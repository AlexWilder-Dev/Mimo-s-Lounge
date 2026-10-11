#!/usr/bin/env bash
# Downloads the venue's logo and photos (from the image CDN behind their current site) into assets/.
# Also pulls smaller copies of the hero and gallery photos for phones and thumbnails.
# Usage: ./scripts/fetch-assets.sh   (from anywhere)
set -uo pipefail

cd "$(dirname "$0")/.."
CDN="https://flipdish.imgix.net"
mkdir -p assets/gallery assets/dishes
failed=0

get() { # get <cdn path + query> <destination>
  if curl -fsSL --retry 2 "$CDN/$1" -o "$2.part"; then
    mv "$2.part" "$2"
    echo "ok      $2"
  else
    rm -f "$2.part"
    echo "FAILED  $2" >&2
    failed=1
  fi
}

get "YlBiHS4JHW2PoOl8uNX0V5Nuw.png?h=400" assets/logo.png
get "GsPB0BPVjKpGl1ym2mIQ5y4OArY.jpg?w=2000" assets/hero.jpg
get "GsPB0BPVjKpGl1ym2mIQ5y4OArY.jpg?w=1000" assets/hero-1000.jpg

gallery=(
  rCLgANDMnKvEYPqfhu8w4sNvU
  8J8UlU8WNLeGHiA0LBeVLRZNc
  wgu17xBLjNUw2YsGKRUdoTSwZEo
  fEFqLj0J8103huztYvqLKzhf64I
  XRbeDuvS7Z8MJYhmdZgJiOqU
  GkNKyHpCYx2pwlAX2yBKCkSBnuo
  vnFu1rXoROlV3B8RsfiqvXGPIU
)
for i in "${!gallery[@]}"; do
  n=$((i + 1))
  get "${gallery[$i]}.jpg?w=1400" "assets/gallery/gallery-$n.jpg"
  get "${gallery[$i]}.jpg?w=700" "assets/gallery/gallery-$n-700.jpg"
done

# The last four mappings were inferred from page order on their site. Check them by eye.
while read -r name id; do
  get "$id.jpg?w=1000" "assets/dishes/$name.jpg"
done <<'EOF'
veg-mezze SsBMNTTqkdPuoVBPsOVQ41UJUcA
mixed-grill 5FiNcI0kpYmGmJU1SToaKbN10sY
chicken-chawarma nzpBjSNlWDgs9OfchumCf4NL1A
farrouj-meshwi YNFHd8MFudBluSd0tOzp7mLJPA
fatayer KPnlfjddgQfaSwJ2m1EEUEIJeA
falafel OAWvhRhKnfvAT2xyJfskfXHeo
jawaneh fz21sFZcyGjSS4Y1HGcXLokMM5I
arayess 2b3bHfqn3l8cV285g17RcwJclD8
spicy-potatoes 2xdO9z6xWZGEhIs6aAWyqO8TXqI
grilled-halloumi rRqBW4TVo8QrvXpISDIcatmwQ
EOF

exit $failed
