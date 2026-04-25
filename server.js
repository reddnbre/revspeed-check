const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 8787);
const MAX_DOWNLOAD_BYTES = 250 * 1024 * 1024;
const DEFAULT_DOWNLOAD_BYTES = 50 * 1024 * 1024;

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: true
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 240,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.raw({ type: "*/*", limit: "200mb" }));
app.use(express.static(path.join(__dirname)));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/ping", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(204).end();
});

app.get("/download", (req, res) => {
  const requested = Number(req.query.bytes);
  const totalBytes = Number.isFinite(requested) && requested > 0
    ? Math.min(Math.floor(requested), MAX_DOWNLOAD_BYTES)
    : DEFAULT_DOWNLOAD_BYTES;
  const chunk = Buffer.allocUnsafe(64 * 1024);
  let sent = 0;

  res.set({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
    "Content-Length": String(totalBytes),
    "X-Content-Type-Options": "nosniff"
  });

  const write = () => {
    while (sent < totalBytes) {
      const remaining = totalBytes - sent;
      const size = Math.min(chunk.length, remaining);
      const canContinue = res.write(chunk.subarray(0, size));
      sent += size;
      if (!canContinue) {
        res.once("drain", write);
        return;
      }
    }
    res.end();
  };

  write();
});

app.post("/upload", (req, res) => {
  const startedAt = performance.now();
  let bytes = 0;

  req.on("data", (chunk) => {
    bytes += chunk.length;
  });

  req.on("end", () => {
    const elapsedSec = Math.max((performance.now() - startedAt) / 1000, 0.001);
    const mbps = (bytes * 8) / elapsedSec / 1024 / 1024;
    res.set("Cache-Control", "no-store");
    res.json({
      receivedBytes: bytes,
      elapsedMs: Math.round(elapsedSec * 1000),
      mbps
    });
  });
});

app.listen(PORT, () => {
  console.log(`RevSpeed API running on http://localhost:${PORT}`);
});
