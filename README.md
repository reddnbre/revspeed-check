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

## Notes

- Browser tests are indicative, not ISP-certified lab measurements.
- Run 2-3 tests and use median values for best consistency.
