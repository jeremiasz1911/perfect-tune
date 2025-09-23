#!/usr/bin/env bash
set -euo pipefail

# === KONFIG z env (możesz ustawić w .env.local lub export w shellu) ===
REMOTE_HOST="${ATTHOST_HOST:?Set ATTHOST_HOST
REMOTE_USER="${ATTHOST_USER:?Set ATTHOST_USER 
REMOTE_PATH="${ATTHOST_PATH:?Set ATTHOST_PATH 

# gdzie Vite buduje pliki (u Ciebie to dist/public)
BUILD_DIR="${BUILD_DIR:-dist/public}"

echo "▶ Buduję frontend…"
npm run build

echo "▶ Wysyłam pliki do ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
rsync -az --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  "${BUILD_DIR}/" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

# dołóż .htaccess dla SPA
if [ -f "scripts/htaccess-spa" ]; then
  scp -o StrictHostKeyChecking=no scripts/htaccess-spa \
     "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/.htaccess"
fi

echo "✅ Gotowe!"
