#!/usr/bin/env bash
# scroll-craft: turn footage you ALREADY HAVE into scrub-ready acts. No API key, no spend.
#
#   bash prep-footage.sh master.mp4 --cuts 0,4.4,11.8 --out assets
#   bash prep-footage.sh master.mp4 --cuts 0,6 --out assets --allintra --poster-at 3
#
# For each interval between cuts it writes, numbered from 01:
#   NN.mp4            desktop, dense GOP, native height capped at 1080 (never upscaled)
#   NN-m.mp4          phone variant, 480p-720p, GOP 4 (same framing: see recipes.md "phone band")
#   NN-poster.webp    the interval's own first frame (the poster MUST be the clip's first frame)
# and prints what the page needs: master-time start of each act, durations, and byte sizes.
#
# Cut where the camera does something decisive (a turn, a reveal, a cut), not at arbitrary halves: each act is
# one beat of the feeling curve. Measured on the apolo-tek pilot: one 11.8 s master became a 4.4 s hero act and a
# 7.4 s peak act, 0.8 MB + 2.4 MB desktop, 0.5 MB + 1.4 MB phone.
#
#   --allintra       keyframe on every frame (GOP 1): smoothest scrub, ~2.5x the bytes (5.8 MB vs 2.3 MB for 7.4 s)
#   --poster-at S    use second S of each interval for the poster instead of its first frame (not recommended)
#   --crf N          override quality (default 20 desktop / 24 phone)
set -euo pipefail

IN="${1:?usage: prep-footage.sh <in> --cuts a,b,c --out <dir>}"; shift
CUTS=""; OUT="assets"; ALLINTRA=0; CRF_D=20; CRF_M=24; POSTER_AT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --cuts) CUTS="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --allintra) ALLINTRA=1; shift ;;
    --crf) CRF_D="$2"; CRF_M="$(( $2 + 4 ))"; shift 2 ;;
    --poster-at) POSTER_AT="$2"; shift 2 ;;
    *) echo "unknown option $1" >&2; exit 1 ;;
  esac
done
[ -n "$CUTS" ] || { echo "--cuts is required, e.g. --cuts 0,4.4,11.8" >&2; exit 1; }

pick_ffmpeg() {
  local cand
  for cand in "${SCROLLCRAFT_FFMPEG:-}" "$(command -v ffmpeg 2>/dev/null || true)" /usr/local/bin/ffmpeg /opt/homebrew/bin/ffmpeg /usr/bin/ffmpeg; do
    [ -n "$cand" ] && [ -x "$cand" ] || continue
    if [ "$("$cand" -hide_banner -filters 2>/dev/null | wc -l)" -gt 200 ]; then echo "$cand"; return 0; fi
  done
  echo "ERROR: no full ffmpeg build found. Set SCROLLCRAFT_FFMPEG." >&2; return 1
}
FF="$(pick_ffmpeg)"; FP="$(dirname "$FF")/ffprobe"; [ -x "$FP" ] || FP="$(command -v ffprobe)"
mkdir -p "$OUT"

IFS=',' read -r -a C <<< "$CUTS"
[ "${#C[@]}" -ge 2 ] || { echo "need at least two cut points" >&2; exit 1; }
DUR="$("$FP" -v error -show_entries format=duration -of csv=p=0 "$IN")"
echo "master: $IN  (${DUR}s)"

enc() { # in start dur out gop crf scale
  "$FF" -y -hide_banner -loglevel error -ss "$2" -t "$3" -i "$1" -an \
    -vf "$7,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf "$6" \
    -g "$5" -keyint_min "$5" -sc_threshold 0 -movflags +faststart "$4"
}

for ((i=0; i<${#C[@]}-1; i++)); do
  n="$(printf '%02d' $((i+1)))"; s="${C[$i]}"; e="${C[$((i+1))]}"
  d="$(awk -v a="$s" -v b="$e" 'BEGIN{printf "%.3f", b-a}')"
  gd=8; gm=4; [ "$ALLINTRA" = 1 ] && { gd=1; gm=1; }
  enc "$IN" "$s" "$d" "$OUT/$n.mp4"   "$gd" "$CRF_D" "scale=-2:min(ih\,1080)"
  enc "$IN" "$s" "$d" "$OUT/$n-m.mp4" "$gm" "$CRF_M" "scale=-2:min(ih\,480)"
  ps="$s"; [ -n "$POSTER_AT" ] && ps="$(awk -v a="$s" -v p="$POSTER_AT" 'BEGIN{printf "%.3f", a+p}')"
  "$FF" -y -hide_banner -loglevel error -ss "$ps" -i "$IN" -frames:v 1 -c:v libwebp -quality 82 "$OUT/$n-poster.webp"
  printf 'act %s: master %ss -> %ss (%ss)  %s %s  phone %s  poster %s\n' "$n" "$s" "$e" "$d" \
    "$(du -h "$OUT/$n.mp4" | cut -f1)" "$(basename "$OUT/$n.mp4")" "$(du -h "$OUT/$n-m.mp4" | cut -f1)" "$(du -h "$OUT/$n-poster.webp" | cut -f1)"
done
echo
echo "In ScrollCraftAnchors / your own overlays, clipStart for act NN is its master start time above."
echo "Check the clips for the phone: references/recipes.md 'Phone band' (a 16:9 clip shows only ~25% of its width full-bleed)."
