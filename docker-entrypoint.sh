#!/bin/sh
set -e

# Replace the placeholder baked during build with the real runtime value.
# Falls back to the production default if the variable is not set.
API_URL="${API_BASE_URL:-https://api.plenario.app}"

find /usr/share/nginx/html -name '*.js' -exec \
  sed -i "s|__API_BASE_URL__|${API_URL}|g" {} \;

exec nginx -g 'daemon off;'
