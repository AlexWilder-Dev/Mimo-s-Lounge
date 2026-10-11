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
| Fonts | `fonts/` (Fraunces and Figtree, self-hosted, SIL Open Font License) |

### Refreshing the venue's data

```bash
./scripts/fetch-assets.sh        # logo, hero, gallery and dish photos into assets/
python3 scripts/fetch-menu.py    # their Flipdish menu, cleaned, into data/menu.json
```

Both only need running once. `data/menu.json` is currently built from a fallback list because the Flipdish
menu couldn't be fetched. `fetch-menu.py` follows Flipdish's published menu format but hasn't been run against
the live file yet, so check its output before committing.

## Still to confirm

Search the code for `TODO`.

- Photos and logo not yet downloaded or viewed (see ASSETS.md).
- Signature dish descriptions were written from the dish names. Replace them with the venue's own wording.
- Outdoor seating, wheelchair access and dog-friendly come from their TableAgent listing. Confirm with the owner.
- Barbara's and Kevin's reviews from their current site need adding word for word.
- Drinks: wine bottle names, the 22 cocktails, juice names and drink prices arrive with the full menu data.
