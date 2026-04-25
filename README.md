# RevSpeed Check

RevSpeed frontend + Node backend for more consistent ping/download/upload testing.

## Project structure

- `index.html`: frontend UI and test runner
- `server.js`: Node/Express speed test API

## Run locally

1. Install dependencies:
   - `npm install`
2. Start backend:
   - `npm start`
3. Open:
   - `http://localhost:8787/index.html`

When frontend runs on localhost, it auto-uses `http://localhost:8787`.

## API endpoints

- `GET /health`: health check
- `GET /ping`: low payload latency endpoint
- `GET /download?bytes=250000000`: streams bytes for download measurement
- `POST /upload`: accepts binary payload for upload measurement

## Deploy frontend + backend separately

If frontend is on GitHub Pages and backend is elsewhere:

1. Deploy backend (Render/Railway/Fly/VPS).
2. Before loading `index.html`, define:

```html
<script>
  window.REVSPEED_API_BASE = "https://your-backend-domain.com";
</script>
```

3. Then load the page script normally.

## Cloudflare Worker backend (recommended)

This repo includes a Worker backend in `cloudflare-worker/`.

### One-time setup

1. Install Wrangler:
   - `npm i -g wrangler`
2. Login to Cloudflare:
   - `wrangler login`

### Deploy

```powershell
cd C:\Users\cdwbn\revspeed-check\cloudflare-worker
wrangler deploy
```

Wrangler will print a URL like:
- `https://revspeed-api.<your-subdomain>.workers.dev`

Use that as `window.REVSPEED_API_BASE`.

### Worker limits note

- Worker free tier is usually great for ping/download.
- Upload test payload in this Worker is capped at 25 MB by code (`MAX_UPLOAD_BYTES`) for safer operation.

## Notes

- Browser tests are indicative, not ISP-certified lab measurements.
- Run 2-3 tests and use median values for best consistency.
