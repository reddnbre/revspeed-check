# RevSpeed Check

This repo now includes a LibreSpeed server setup so you can run real ping/download/upload tests with less browser API hassle.

## Fastest path (LibreSpeed with Docker)

1. Install Docker Desktop.
2. Open terminal in this folder:
   - `C:\Users\cdwbn\revspeed-check\librespeed`
3. Start LibreSpeed:
   - `docker compose up -d`
4. Open in browser:
   - `http://localhost:8080`

That is your working LibreSpeed test page (including upload).

## Files added

- `librespeed/docker-compose.yml`: ready-to-run LibreSpeed server config

## Stop/start commands

- Stop:
  - `docker compose down`
- Start again:
  - `docker compose up -d`
- View logs:
  - `docker compose logs -f`

## Deploy online later

If you want it public, deploy the same container on a VPS or Docker-capable host, then point a domain/subdomain to it (for example `speed.yourdomain.com`).

## Notes

- LibreSpeed gives much better upload realism than browser-only hacks.
- Run multiple tests and use median values for best consistency.
