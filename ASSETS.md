# Assets: Mimo's Lounge, Bar & Grill

**Status: not downloaded yet.** The build environment's network policy blocked `flipdish.imgix.net`
(and `menus.flipdish.co` and `www.mimoslounge.co.uk`), so none of these files could be fetched or looked at.
The "What it shows" column is left blank on purpose rather than guessed.

Run `./scripts/fetch-assets.sh` on a machine with normal internet access. It writes every file below to the
right path, and the site picks them up with no code changes. Until then, dish photos show a warm gradient panel,
the header and footer use a text wordmark, the hero uses its red-and-ember gradient, and the gallery section hides itself.

All sources are on `https://flipdish.imgix.net/`.

## Logo and hero

| File | Source | Used in | What it shows |
| --- | --- | --- | --- |
| `assets/logo.png` | `YlBiHS4JHW2PoOl8uNX0V5Nuw.png?h=400` | Header (light background) | _Not viewed yet_ |
| `assets/hero.jpg` | `GsPB0BPVjKpGl1ym2mIQ5y4OArY.jpg?w=2000` | Hero background, desktop | _Not viewed yet_ |
| `assets/hero-1000.jpg` | same photo, `?w=1000` | Hero background, phones | (same photo) |

## Gallery (lightbox opens the 1400px file; the grid uses the 700px copy)

| File | Source | Used in | What it shows |
| --- | --- | --- | --- |
| `assets/gallery/gallery-1.jpg` | `rCLgANDMnKvEYPqfhu8w4sNvU.jpg?w=1400` | Gallery, large tile | _Not viewed yet_ |
| `assets/gallery/gallery-2.jpg` | `8J8UlU8WNLeGHiA0LBeVLRZNc.jpg?w=1400` | Gallery | _Not viewed yet_ |
| `assets/gallery/gallery-3.jpg` | `wgu17xBLjNUw2YsGKRUdoTSwZEo.jpg?w=1400` | Gallery | _Not viewed yet_ |
| `assets/gallery/gallery-4.jpg` | `fEFqLj0J8103huztYvqLKzhf64I.jpg?w=1400` | Gallery | _Not viewed yet_ |
| `assets/gallery/gallery-5.jpg` | `XRbeDuvS7Z8MJYhmdZgJiOqU.jpg?w=1400` | Gallery | _Not viewed yet_ |
| `assets/gallery/gallery-6.jpg` | `GkNKyHpCYx2pwlAX2yBKCkSBnuo.jpg?w=1400` | Gallery, wide tile | _Not viewed yet_ |
| `assets/gallery/gallery-7.jpg` | `vnFu1rXoROlV3B8RsfiqvXGPIU.jpg?w=1400` | Gallery, wide tile | _Not viewed yet_ |

## Dish photos (`?w=1000`)

| File | Source | Dish | Mapping | Used in | What it shows |
| --- | --- | --- | --- | --- | --- |
| `assets/dishes/veg-mezze.jpg` | `SsBMNTTqkdPuoVBPsOVQ41UJUcA.jpg` | Vegetarian Selection of Mezze | From their menu data | Signature dishes, feature card | _Not viewed yet_ |
| `assets/dishes/mixed-grill.jpg` | `5FiNcI0kpYmGmJU1SToaKbN10sY.jpg` | Mixed Grill | From their menu data | Off the grill | _Not viewed yet_ |
| `assets/dishes/chicken-chawarma.jpg` | `nzpBjSNlWDgs9OfchumCf4NL1A.jpg` | Chicken Chawarma | From their menu data | Off the grill | _Not viewed yet_ |
| `assets/dishes/farrouj-meshwi.jpg` | `YNFHd8MFudBluSd0tOzp7mLJPA.jpg` | Farrouj Meshwi | From their menu data | Off the grill | _Not viewed yet_ |
| `assets/dishes/fatayer.jpg` | `KPnlfjddgQfaSwJ2m1EEUEIJeA.jpg` | Fatayer | From their menu data | Hot mezze | _Not viewed yet_ |
| `assets/dishes/falafel.jpg` | `OAWvhRhKnfvAT2xyJfskfXHeo.jpg` | Falafel | From their menu data | Hot mezze | _Not viewed yet_ |
| `assets/dishes/jawaneh.jpg` | `fz21sFZcyGjSS4Y1HGcXLokMM5I.jpg` | Jawaneh | **Inferred from page order** | Hot mezze | _Not viewed yet_ |
| `assets/dishes/arayess.jpg` | `2b3bHfqn3l8cV285g17RcwJclD8.jpg` | Arayess | **Inferred from page order** | Hot mezze | _Not viewed yet_ |
| `assets/dishes/spicy-potatoes.jpg` | `2xdO9z6xWZGEhIs6aAWyqO8TXqI.jpg` | Spicy Potatoes | **Inferred from page order** | Hot mezze | _Not viewed yet_ |
| `assets/dishes/grilled-halloumi.jpg` | `rRqBW4TVo8QrvXpISDIcatmwQ.jpg` | Grilled Halloumi | **Inferred from page order** | Hot mezze | _Not viewed yet_ |

## What the design used in place of looking

The venue's own image colour data (from the brief), not the photos themselves:

- Logo: charcoal `#1f1b1a` with cool greys. A dark logo needs a light header, so the header is warm off-white.
- Hero: dark and red-dominant, deep red `#770518` / `#ae0b10`, ember `#fbac73`.
- Food: saffron/amber `#d69b1c` to `#e09123`, warm browns, herb green.

## Once the photos are in

1. Fill in "What it shows" for every row above.
2. Check the four inferred dish mappings and swap files if any are wrong.
3. Check the logo in the header. If it also works reversed out, it can replace the text wordmark in the footer.
4. Write alt text for the hero and gallery photos (marked `TODO` in `index.html`).
5. Check the colour tokens at the top of `css/styles.css` against the photos and adjust.
6. Check the type (Fraunces + Figtree) against the logo's letterforms.
7. Note any real interior materials, lighting, tableware or pattern in the photos. Those are the only motifs
   the design should borrow. If one shows the bar or lounge, use it in the Bar section.
