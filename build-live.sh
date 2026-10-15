#!/usr/bin/env bash
set -e

echo "Building dist-live for Cloudflare Pages..."
rm -rf dist-live
mkdir -p dist-live
cp pos-live/index.html pos-live/live.js pos-live/style.css dist-live/
if [ -d "pos-live/assets" ]; then
  cp -r pos-live/assets dist-live/
  find dist-live/assets/img/toppings -maxdepth 1 \( -name '*.jpg' -o -name '*.png' \) -delete 2>/dev/null || true
fi

cat << 'EOF' > dist-live/_headers
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  Cache-Control: public, max-age=0, must-revalidate
EOF

echo "Build dist-live completed successfully!"
