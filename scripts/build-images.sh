#!/usr/bin/env bash
#
# Mirror every source photo into web-ready derivatives.
#
#   assets/img/live-with-jon/jhband-liveinlondon-color.jpeg
#     -> assets/web/img/live-with-jon/jhband-liveinlondon-color.jpg
#
# assets/img/ is gitignored (it sits next to 520MB of video and holds
# originals up to 10MB, which must not be served to visitors). This script
# is what makes those originals usable: drop a photo in assets/img/ANY/
# folder, run this, and it is committed and referenceable. No per-image
# decisions.
#
# Re-running is cheap: a derivative newer than its source is skipped.
# Names are lowercased and spaces become dashes, so paths stay URL-safe.
#
#   ./scripts/build-images.sh          # convert what changed
#   ./scripts/build-images.sh --force  # rebuild everything
#
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=assets/img
OUT=assets/web/img
MAX_EDGE=1800
QUALITY=82
FORCE=${1:-}

[ -d "$SRC" ] || { echo "no $SRC directory"; exit 0; }

built=0; skipped=0

while IFS= read -r -d '' file; do
  rel=${file#"$SRC"/}
  dir=$(dirname "$rel")
  base=$(basename "$rel")
  base=${base%.*}
  # lowercase; anything not a letter, digit or dot becomes a dash, so the
  # result is always safe in a URL without escaping
  safe=$(printf '%s' "$base" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9.]+/-/g; s/-+/-/g; s/^-|-$//g')

  target_dir=$OUT
  [ "$dir" != "." ] && target_dir="$OUT/$dir"
  target="$target_dir/$safe.jpg"

  if [ -z "$FORCE" ] && [ -f "$target" ] && [ "$target" -nt "$file" ]; then
    skipped=$((skipped+1)); continue
  fi

  mkdir -p "$target_dir"
  # sips -Z scales up as happily as down, which turns a small scan into a
  # heavy, mushy file. Cap the target at the source's own longest edge.
  edge=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null \
           | awk '/pixel(Width|Height)/ {if ($2+0 > m) m = $2+0} END {print m+0}')
  [ "${edge:-0}" -gt 0 ] && [ "$edge" -lt "$MAX_EDGE" ] || edge=$MAX_EDGE

  if sips -Z "$edge" -s format jpeg -s formatOptions "$QUALITY" \
       "$file" --out "$target" >/dev/null 2>&1; then
    echo "  $rel -> ${target#"$OUT"/}"
    built=$((built+1))
  else
    echo "  SKIPPED (not an image sips can read): $rel" >&2
  fi
done < <(find "$SRC" -type f \
           \( -iname '*.jpg'  -o -iname '*.jpeg' -o -iname '*.png' \
           -o -iname '*.webp' -o -iname '*.tif'  -o -iname '*.tiff' \) \
           -not -name '.*' -print0)

echo "images: $built built, $skipped already current"
