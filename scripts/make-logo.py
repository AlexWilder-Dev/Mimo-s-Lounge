#!/usr/bin/env python3
"""Derive web logo files from the venue's logo (a JPEG on a white background).

Usage: python3 scripts/make-logo.py path/to/logo-source.jpg   (needs Pillow)

Writes:
  assets/logo-badge.webp      the grey brush circle and lettering, white background removed
  assets/logo-wordmark.webp   the lettering only, in cream, for dark backgrounds
  favicon.png, apple-touch-icon.png
"""

import pathlib
import sys

from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parent.parent
CREAM = (246, 237, 228)
NIGHT = (18, 12, 12)


def badge(src):
    """White background to transparent, keeping the grey circle and its dry-brush edge."""
    rgb = src.convert("RGB")
    r, g, b = rgb.split()
    darkest = ImageChops.darker(ImageChops.darker(r, g), b)
    # The circle's grey is ~148 at its darkest channel; white is 255.
    alpha = darkest.point(lambda v: 0 if v > 245 else min(255, int((255 - v) * 255 / 107)))
    out = rgb.copy()
    out.putalpha(alpha)
    return out.crop(out.getbbox())


def wordmark(src):
    """Just the dark lettering (script + 'Lounge, Bar & Grill'), recoloured cream."""
    lum = src.convert("L")
    # Ink is ~35, the grey circle ~156, the background 255.
    alpha = lum.point(lambda v: 255 if v < 60 else (0 if v > 135 else int((135 - v) * 255 / 75)))
    out = Image.new("RGBA", src.size, CREAM + (0,))
    out.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    pad = int(src.width * 0.01)
    return out.crop((box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad))


def main():
    src = Image.open(sys.argv[1])
    b = badge(src)
    b.resize((600, round(600 * b.height / b.width)), Image.LANCZOS).save(ROOT / "assets/logo-badge.webp", quality=88, method=6)

    w = wordmark(src)
    w.resize((800, round(800 * w.height / w.width)), Image.LANCZOS).save(ROOT / "assets/logo-wordmark.webp", quality=90, method=6)

    b.resize((64, 64), Image.LANCZOS).save(ROOT / "favicon.png", optimize=True)
    touch = Image.new("RGB", (180, 180), NIGHT)
    small = b.resize((160, 160), Image.LANCZOS)
    touch.paste(small, (10, 10), small)
    touch.save(ROOT / "apple-touch-icon.png", optimize=True)
    print("Wrote assets/logo-badge.webp, assets/logo-wordmark.webp, favicon.png, apple-touch-icon.png")


if __name__ == "__main__":
    main()
