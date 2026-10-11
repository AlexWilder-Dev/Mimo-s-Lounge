# Assets: Mimo's Lounge, Bar & Grill

Everything here comes from the image CDN behind the venue's current site (`https://flipdish.imgix.net/`).
`./scripts/fetch-assets.sh` re-downloads the lot.

## Logo

| File | Source | What it shows | Used in |
| --- | --- | --- | --- |
| `assets/logo.jpg` | `YlBiHS4JHW2PoOl8uNX0V5Nuw.png?h=400` | Calligraphic script "Mimo's" with "Lounge, Bar & Grill" in Roboto underneath, on a grey (#949ea8) dry-brush circle. Served as a JPEG on white despite the .png name. | Reference only |
| `assets/logo-badge.webp` | same logo at 1600px, via `scripts/make-logo.py` | The badge with the white background removed | Hero, footer, favicon |
| `assets/logo-wordmark.webp` | same, via `scripts/make-logo.py` | Just the lettering, recoloured cream for dark backgrounds | Header (appears once the hero badge scrolls away) |

## Hero

| File | Source | What it shows | Used in |
| --- | --- | --- | --- |
| `assets/hero.jpg`, `hero-1000.jpg` | `GsPB0BPVjKpGl1ym2mIQ5y4OArY.jpg` | The dining room under red lighting: dark wood tables set with black plates, folded red napkins and wine glasses, the bar at the back with lit bottle shelves, string lights and stools. | Hero (whole room); Bar section (cropped to the bar) |

## Dish photos (the venue's own phone photos, taken in the restaurant)

All ten mappings checked by eye.

| File | Dish | What it shows | Used in |
| --- | --- | --- | --- |
| `dishes/mixed-grill.jpg` | Mixed Grill | Kafta and lamb skewers, shish taouk, vermicelli rice, salad with pomegranate and a pot of garlic sauce on a black plate | Grill band |
| `dishes/farrouj-meshwi.jpg` | Farrouj Meshwi | Charred, charcoal-grilled chicken with rice dusted with sumac, salad and lemon | Grill band |
| `dishes/chicken-chawarma.jpg` | Chicken Chawarma | Chicken chawarma over rice and salad on a black plate on the bar counter, with garlic and chilli sauce pots | Grill band |
| `dishes/veg-mezze.jpg` | Vegetarian Selection of Mezze | A takeaway tray: vine leaves, green beans, falafel, fatayer, hoummos, pomegranate and lemon | Mezze grid |
| `dishes/fatayer.jpg` | Fatayer | Four triangular baked pastries with a lemon slice on a black plate | Mezze grid |
| `dishes/falafel.jpg` | Falafel | Four sesame-crusted falafel with salad and pickles, and a bowl of tahini | Mezze grid |
| `dishes/jawaneh.jpg` | Jawaneh | Grilled chicken wings with lettuce, tomato, lemon and garlic sauce with mint | Mezze grid |
| `dishes/arayess.jpg` | Arayess | Grilled flatbread wedges stuffed with minced lamb, pickles, cabbage and tomato | Mezze grid |
| `dishes/spicy-potatoes.jpg` | Spicy Potatoes | Cubed potatoes with coriander and chilli in a black bowl, lemon wedge | Mezze grid |
| `dishes/grilled-halloumi.jpg` | Grilled Halloumi | Grilled halloumi slices with cucumber, tomato, mint and sumac | Mezze grid |

## Gallery (lightbox opens the 1400px file; the grid uses the 700px copy)

These look like stock or studio photography rather than shots taken at Mimo's: white seamless
backgrounds, slate boards, silver platters. They are what the venue's own site uses, so they're kept,
but the design leans on the venue's own photos above.

| File | Source | What it shows | Used in |
| --- | --- | --- | --- |
| `gallery/gallery-1.jpg` | `rCLgANDMnKvEYPqfhu8w4sNvU.jpg` | Lamb shawarma in pitta with tahini, pickled peppers, grilled tomato and parsley, on white | Gallery |
| `gallery/gallery-2.jpg` | `8J8UlU8WNLeGHiA0LBeVLRZNc.jpg` | Okra and lamb stew (bamieh) in a gold-rimmed bowl with saffron rice, on a wooden table | Gallery |
| `gallery/gallery-3.jpg` | `wgu17xBLjNUw2YsGKRUdoTSwZEo.jpg` | Overhead spread on slate: kafta skewers, tabbouleh, pastries, pitta, olives, dips, figs and pomegranate on silver platters | Gallery |
| `gallery/gallery-4.jpg` | `fEFqLj0J8103huztYvqLKzhf64I.jpg` | Fattoush in a grey bowl with toasted pitta, romaine and sumac | Gallery |
| `gallery/gallery-5.jpg` | `XRbeDuvS7Z8MJYhmdZgJiOqU.jpg` | Mezze in terracotta bowls on a wooden table: hoummos, moutabbal, labneh, olives and pickles, stuffed pastries, basterma | Gallery; Groups section |
| `gallery/gallery-6.jpg` | `GkNKyHpCYx2pwlAX2yBKCkSBnuo.jpg` | Chicken shish taouk skewers with spinach, rocket and chard on a dark plate, cucumber salad | Gallery |
| `gallery/gallery-7.jpg` | `vnFu1rXoROlV3B8RsfiqvXGPIU.jpg` | Shankleesh: a chilli-coated cheese ball with mint, crumbled, in olive oil | Gallery |

Not used: the testimonials background on their site (`t2a24GHQrfRK7FLR6Peg58dzk.jpg`) is a generic
stock café interior, not Mimo's.

## How the photos shaped the design

- **The room is dark and red-lit**, and the dish photos were taken in it. The site is a dark lounge
  (#120c0c night, deep reds #770518 / #c8141c) so the photos sit in their own light instead of fighting a cream page.
- **Ember (#fbac73) and amber (#e09123)** come from the warm bulbs over the bar and the food's saffron tones,
  and are used for prices, accents and the grill band's embers.
- **The logo's grey (#949ea8)** is used for small labels.
- **Type:** the logo pairs a pointed-pen script with Roboto. Headings are Cormorant Garamond (high contrast,
  calligraphic stress, sits beside the script without imitating it). Body text is Roboto, the logo's own sans.
- **The one motif borrowed** is the string of small warm bulbs over their bar, used as a tiny divider beside
  section labels. The menu is shown as a cream card on the dark page, like a menu on a table.
