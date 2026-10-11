#!/usr/bin/env python3
"""Fetch Mimo's menu from Flipdish once and save a cleaned copy to data/menu.json.

Usage:
    python3 scripts/fetch-menu.py              # download and convert
    python3 scripts/fetch-menu.py saved.json   # convert a copy you already saved

The site only ever reads data/menu.json. Nothing calls Flipdish at runtime.

Cleaning: "(V)" becomes a vegetarian flag, "Contains ..." lines become allergen notes,
food descriptions go from Title Case to sentence case, prices come from whichever option
set carries them (Regular / Meal, glass / bottle, 25ml / 50ml / 70cl), and a handful of
obvious typos in the source are fixed (listed in FIXES).
"""

import datetime
import json
import pathlib
import re
import sys
import urllib.request

MENU_URL = "https://menus.flipdish.co/prod/1000284006/3a745240-959a-11f1-81b6-135bd667c171.json"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "menu.json"

FOOD = [
    "PLATTERS", "MAIN COURSES", "WRAPS", "BBQ", "HOT MEZZE", "COLD MEZZE",
    "SALAD", "SOUP", "SIDES", "DESSERT", "LUNCH BOX SPECIAL",
]

# Drinks sections grouped the way a bar list reads. Each entry: (group, [(section, label)]).
DRINKS = [
    ("Lebanese wine", [("LEBANESE HOUSE WINE", "House"), ("LEBANESE RED WINE", "Red"),
                       ("LEBANESE WHITE WINE", "White"), ("LEBANESE ROSÉ WINE", "Rosé")]),
    ("Cocktails", [("COCKTAILS", None)]),
    ("Beer", [("LEBANESE BEER BOTTLE", "Lebanese beer"), ("DRAFT BEER", "Draught"), ("BEER BOTTLE", "Bottled lager")]),
    ("Fresh juices & soft drinks", [("FRESH JUICES", "Fresh juices"), ("SOFT DRINKS", "Soft drinks")]),
    ("Coffee & tea", [("COFFEE & TEA", None)]),
    ("Wine & bubbles", [("WHITE WINE", "White wine"), ("RED WINE", "Red wine"),
                        ("CHAMPAGNE", "Champagne"), ("PROSECCO & SPARKLING WINE", "Prosecco & sparkling")]),
    ("Spirits", [("GIN", "Gin"), ("VODKA", "Vodka"), ("WHISKEY", "Whisky"), ("TEQUILA", "Tequila"),
                 ("RUM", "Rum"), ("COGNAC", "Cognac & brandy")]),
    ("Shots & liqueurs", [("SHOTS", "Shots"), ("LIQUEURS", "Liqueurs")]),
]

# Obvious typos in the source data.
FIXES = {
    "Dirty Martin": "Dirty Martini",
    "Cambari": "Campari",
    "Absolute": "Absolut",
    "Johnny Walker": "Johnnie Walker",
    "Hendricks": "Hendrick's",
    "Makers Mark": "Maker's Mark",
    "Pimms NO 1": "Pimm's No. 1",
    "Amertto": "Amaretto",
    "Sparkled with": "Sprinkled with",
    "Corianders": "Coriander",
    "Chili Lemon": "Chilli, Lemon",
    "Gordon": "Gordon's",
}
# Item descriptions that need more than a word fixed.
REWRITE = {
    "Grilled Kafta-Fattoush": "Skewered Minced Lamb with Parsley & Onion, Charcoal Grilled, served with Fattoush Salad & Rice.\n\nContains Gluten.",
}
SIZE_LABELS = {
    "284ml, 1/2 Pint": "Half", "568ml, 1 Pint": "Pint", "125ml Glass": "Glass", "175ml Glass": "Glass",
    "750ml Bottle": "Bottle", "25cl": "25ml", "50cl": "50ml",
}
KEEP_CAPS = {"Lebanese", "Lebanon", "BBQ", "Mimo's", "I"}
VEG = re.compile(r"\s*\(\s*v\s*\)", re.I)
CONTAINS = re.compile(r"\s*Contains\s+([^.\n]+)\.?\s*$", re.I)


def fix(text):
    for wrong, right in FIXES.items():
        text = re.sub(rf"\b{re.escape(wrong)}\b(?!')", right, text)
    return text


def clean(text):
    text = re.sub(r"(?<=[^.!?\s])\s*\n\s*\n\s*", ". ", text or "")  # separate paragraphs that lack a full stop
    return re.sub(r"\s+", " ", text).strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def title(name):
    small = {"and", "&", "of", "with", "or"}
    words = name.lower().split()
    return " ".join(w if (i and w in small) else ("BBQ" if w == "bbq" else w.capitalize()) for i, w in enumerate(words))


def sentence_case(text):
    """'Skewered Lamb, Charcoal Grilled' -> 'Skewered lamb, charcoal grilled'."""
    out, start = [], True
    for word in re.split(r"(\s+)", text):
        if not word.strip():
            out.append(word)
            continue
        bare = word.strip(",.:;()&")
        if bare and bare not in KEEP_CAPS and not bare.isupper():
            parts = bare.split("-")  # "Deep-Fried" -> "deep-fried"
            lowered = "-".join(p[:1].lower() + p[1:] if (i or not start) else p for i, p in enumerate(parts))
            word = word.replace(bare, lowered, 1)
        out.append(word)
        start = word.endswith((".", "!", "?"))
    return "".join(out)


def finish(text):
    """Some source descriptions are cut off mid-sentence; mark them rather than leave them hanging."""
    return text if not text or text[-1] in ".!?)" else text + "…"


def prices(item):
    sets = item.get("MenuItemOptionSets") or []
    for option_set in sets:
        options = [o for o in option_set.get("MenuItemOptionSetItems") or [] if o.get("IsAvailable", True) is not False]
        priced = bool(options) and all((o.get("Price") or 0) > 0 for o in options)
        if option_set.get("IsMasterOptionSet") or (priced and not item.get("Price")):
            return [{"label": SIZE_LABELS.get(o["Name"].strip(), o["Name"].strip()), "amount": round(float(o["Price"]), 2)}
                    for o in sorted(options, key=lambda o: o.get("DisplayOrder") or 0)]
    if item.get("Price"):
        return [{"label": None, "amount": round(float(item["Price"]), 2)}]
    return []


def food_item(item):
    raw = item["Name"].strip()
    desc = REWRITE.get(raw) or item.get("Description") or ""
    name = VEG.sub("", raw).strip()
    entry = {"name": name, "veg": bool(VEG.search(raw))}
    if "-" in name:  # "Mixed Grill-Hoummos & Tabbouleh": the description already lists the sides
        entry["name"] = name.split("-")[0].strip()
    piece = re.match(r"^(.*)\((\d+)\)$", entry["name"])
    if piece:
        entry["name"], entry["note"] = piece.group(1).strip(), f"{piece.group(2)} pieces"
    allergens = None
    match = CONTAINS.search(desc)
    if match:
        allergens = clean(match.group(1))
        allergens = allergens[0].upper() + sentence_case(allergens)[1:]
        desc = desc[: match.start()]
    desc = finish(sentence_case(fix(clean(desc))))
    entry["name"] = fix(entry["name"])
    if desc:
        entry["description"] = desc
    if allergens:
        entry["allergens"] = allergens
    entry["prices"] = prices(item)
    return entry


def drink_item(item, wine=False):
    name = fix(item["Name"].strip())
    if wine:  # "Soupir-Château Oumsiyat" -> "Soupir · Château Oumsiyat"
        name = re.sub(r"\s*-\s*", " · ", name.replace("-(Organic)", " (Organic)"))
    entry = {"name": name}
    desc = finish(fix(clean(item.get("Description"))))
    if desc:
        entry["description"] = desc
    entry["prices"] = prices(item)
    return entry


def available(obj):
    return obj.get("IsAvailable", True) is not False and not obj.get("IsHiddenFromUsers") and not obj.get("IsDeleted")


def ordered(objs):
    return sorted([o for o in objs or [] if available(o)], key=lambda o: o.get("DisplayOrder") or 0)


def convert(raw):
    sections = {s["Name"].strip(): s for s in ordered(raw.get("MenuSections"))}
    if not sections:
        sys.exit("No menu sections found. The Flipdish format may have changed: check the file and update convert().")
    used = set()

    food = []
    for key in FOOD:
        section = sections.get(key)
        if not section:
            continue
        used.add(key)
        items = [food_item(i) for i in ordered(section.get("MenuItems"))]
        if items:
            note = clean(section.get("Description"))
            food.append({"id": slug(key), "name": title(key), "note": sentence_case(note) or None, "items": items})

    drinks = []
    for group, parts in DRINKS:
        groups = []
        for key, label in parts:
            section = sections.get(key)
            if not section:
                continue
            used.add(key)
            items = [drink_item(i, wine=group == "Lebanese wine") for i in ordered(section.get("MenuItems"))]
            note = clean(section.get("Description")).rstrip(".").replace(". ", ", ")
            note = (note[:1] + note[1:].lower()) or None
            if items:
                groups.append({"name": label or title(key), "note": note, "items": items})
        if groups:
            single = len(groups) == 1 and groups[0]["name"] == title(parts[0][0])
            entry = {"id": slug(group), "name": group, "groups": [] if single else groups, "items": groups[0]["items"] if single else []}
            if single and groups[0]["note"]:
                entry["note"] = groups[0]["note"]
            drinks.append(entry)

    leftover = [k for k in sections if k not in used]
    if leftover:
        print("Not placed (add them to FOOD or DRINKS):", ", ".join(leftover), file=sys.stderr)

    return {
        "meta": {
            "venue": "Mimo's Lounge, Bar & Grill",
            "source": "flipdish",
            "sourceNote": f"Cleaned copy of {MENU_URL}",
            "menuVersion": raw.get("MenuVersionNumber"),
            "currency": raw.get("Currency") or "GBP",
            "updated": datetime.date.today().isoformat(),
        },
        "food": food,
        "drinks": drinks,
    }


def main():
    if len(sys.argv) > 1:
        raw = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    else:
        req = urllib.request.Request(MENU_URL, headers={"User-Agent": "Mozilla/5.0 (menu snapshot)"})
        with urllib.request.urlopen(req, timeout=30) as res:
            raw = json.load(res)
    menu = convert(raw)
    OUT.write_text(json.dumps(menu, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    food = sum(len(s["items"]) for s in menu["food"])
    drinks = sum(len(d["items"]) + sum(len(g["items"]) for g in d["groups"]) for d in menu["drinks"])
    print(f"Wrote {OUT}: {len(menu['food'])} food sections ({food} items), {len(menu['drinks'])} drinks groups ({drinks} drinks)")


if __name__ == "__main__":
    main()
