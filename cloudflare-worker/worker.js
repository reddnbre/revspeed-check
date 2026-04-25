const MAX_DOWNLOAD_BYTES = 250 * 1024 * 1024;
const DEFAULT_DOWNLOAD_BYTES = 50 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function noStoreHeaders(extra = {}) {
  return {
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
    ...extra
  };
}

function parseBytesParam(url) {
  const requested = Number(url.searchParams.get("bytes"));
  if (!Number.isFinite(requested) || requested <= 0) {
    return DEFAULT_DOWNLOAD_BYTES;
  }
  return Math.min(Math.floor(requested), MAX_DOWNLOAD_BYTES);
}

function streamRandomBytes(totalBytes) {
  let sent = 0;
  return new ReadableStream({
    pull(controller) {
      if (sent >= totalBytes) {
        controller.close();
        return;
      }
      const size = Math.min(64 * 1024, totalBytes - sent);
      const chunk = new Uint8Array(size);
      crypto.getRandomValues(chunk);
      sent += size;
      controller.enqueue(chunk);
    }
  });
}

async function measureUpload(request) {
  const startedAt = Date.now();
  let bytes = 0;
  const reader = request.body?.getReader();
  if (!reader) {
    return { bytes: 0, elapsedMs: 1, mbps: 0 };
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_UPLOAD_BYTES) {
      throw new Error(`Upload too large. Max ${MAX_UPLOAD_BYTES} bytes.`);
    }
  }

  const elapsedMs = Math.max(Date.now() - startedAt, 1);
  const mbps = (bytes * 8) / (elapsedMs / 1000) / 1024 / 1024;
  return { bytes, elapsedMs, mbps };
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "*";
    const cors = corsHeaders(origin);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          ...noStoreHeaders()
        }
      });
    }

    if (url.pathname === "/health") {
      return Response.json(
        { ok: true, provider: "cloudflare-worker" },
        { headers: { ...cors, ...noStoreHeaders() } }
      );
    }

    if (url.pathname === "/ping") {
      return new Response(null, {
        status: 204,
        headers: { ...cors, ...noStoreHeaders() }
      });
    }

    if (url.pathname === "/download" && request.method === "GET") {
      const totalBytes = parseBytesParam(url);
      const stream = streamRandomBytes(totalBytes);
      return new Response(stream, {
        status: 200,
        headers: {
          ...cors,
          ...noStoreHeaders({
            "Content-Type": "application/octet-stream",
            "Content-Length": String(totalBytes),
            "X-Content-Type-Options": "nosniff"
          })
        }
      });
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      try {
        const result = await measureUpload(request);
        return Response.json(
          {
            receivedBytes: result.bytes,
            elapsedMs: result.elapsedMs,
            mbps: result.mbps
          },
          {
            headers: { ...cors, ...noStoreHeaders() }
          }
        );
      } catch (error) {
        return Response.json(
          {
            error: String(error.message || error)
          },
          {
            status: 413,
            headers: { ...cors, ...noStoreHeaders() }
          }
        );
      }
    }

    return new Response("Not found", {
      status: 404,
      headers: { ...cors, ...noStoreHeaders() }
    });
  }
};
