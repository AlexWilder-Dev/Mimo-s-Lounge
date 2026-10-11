# Mimo's Lounge, Bar & Grill: demo site

Speculative one-page site for Mimo's Lounge, Bar & Grill, the Lebanese restaurant, charcoal grill and lounge bar
at 141 Tooting High Street, London SW17 0SY.

Static HTML, CSS and JavaScript with no build step and no backend. "Book a table" links to their TableAgent page
and "Order online" to their existing ordering page. Nothing calls a third party at runtime except the embedded
Google Map.

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local server rather than opening `index.html` directly: the menu loads from `data/menu.json`, which
browsers block on `file://`.

## Deploy

`.github/workflows/deploy.yml` publishes the site to GitHub Pages on every push to `main`, and can be run by hand
from the Actions tab. In the repo settings, set **Pages → Source** to **GitHub Actions**. It is then served at
`https://alexwilder-dev.github.io/Mimo-s-Lounge/`. Every path is relative, so the site also works unchanged at a
custom domain root.

## Where things live

| What | Where |
| --- | --- |
| Menu and drinks | `data/menu.json`, rendered by `js/main.js` |
| Logo and photos | `assets/` (see [ASSETS.md](ASSETS.md)) |
| Copy, hours, contact, reviews | `index.html` |
| Colours and type | Tokens at the top of `css/styles.css` |
| Fonts | `fonts/` (Cormorant Garamond and Roboto, self-hosted, SIL Open Font License) |

### Refreshing the venue's data

```bash
./scripts/fetch-assets.sh        # logo, hero, gallery and dish photos into assets/ (logo step needs Pillow)
python3 scripts/fetch-menu.py    # their Flipdish menu, cleaned, into data/menu.json
```

Both only need running once. `data/menu.json` is a cleaned copy of their live Flipdish menu: 71 dishes in
11 sections with descriptions and allergens, and 176 drinks in 8 groups. The script sentence-cases the
descriptions, splits out "Contains ..." allergen lines and fixes a few obvious typos in the source (listed in
`FIXES`).

## Still to confirm

Search the code for `TODO`.

- Outdoor seating, wheelchair access and dog-friendly come from their TableAgent listing. Confirm with the owner.
- "Fresh mint lemonade: guests call it the best in London" is from the brief's summary of their reviews.
  Find the review and quote it, or confirm the line with the owner.
- The gallery photos look like stock photography (see ASSETS.md). New photos of the room and the bar would help.
