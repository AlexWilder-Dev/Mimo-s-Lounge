#!/usr/bin/env python3
"""Fetch Mimo's menu from Flipdish once and save a cleaned copy to data/menu.json.

Usage:
    python3 scripts/fetch-menu.py              # download and convert
    python3 scripts/fetch-menu.py saved.json   # convert a copy you already saved

The site only ever reads data/menu.json. Nothing calls Flipdish at runtime.
Field names follow Flipdish's published menu format (MenuSections > MenuItems >
MenuItemOptionSets); keys are matched case-insensitively. If their format has
changed, the script stops and says so rather than writing a broken file.
"""

import datetime
import json
import pathlib
import re
import sys
import urllib.request

MENU_URL = "https://menus.flipdish.co/prod/1000284006/3a745240-959a-11f1-81b6-135bd667c171.json"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "menu.json"

DRINKS = re.compile(
    r"\b(drinks?|wines?|ros[eé]|beers?|cocktails?|mocktails?|juices?|lemonades?|coffees?|teas?|"
    r"softs?|spirits?|beverages?|waters?|prosecco|champagne|arak|whisk(?:e)?y|vodka|gin|rum|smoothies?|shakes?)\b",
    re.I,
)
VEG = re.compile(r"\s*\(\s*v\s*\)", re.I)
ALLERGENS = re.compile(r"(?:^|(?<=[.\n]))\s*(allergens?|contains)\s*[:\-]\s*(.+)$", re.I | re.S)


def pick(obj, *names, default=None):
    """First non-null value among the given keys, ignoring case."""
    if not isinstance(obj, dict):
        return default
    lowered = {k.lower(): v for k, v in obj.items()}
    for name in names:
        value = lowered.get(name.lower())
        if value is not None:
            return value
    return default


def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def available(obj):
    return pick(obj, "IsAvailable") is not False and not pick(obj, "IsHiddenFromUsers")


def ordered(objs):
    return sorted(objs or [], key=lambda o: pick(o, "DisplayOrder", default=0) or 0)


def split_description(text):
    """Separate a trailing 'Allergens: ...' note from the description."""
    text = clean(text)
    allergens = None
    match = ALLERGENS.search(text)
    if match:
        allergens = clean(match.group(2)).rstrip(".") or None
        text = clean(text[: match.start()])
    return text or None, allergens


def prices(item):
    """Master option sets (e.g. Regular / Meal) carry the real prices; otherwise use the item price."""
    for option_set in ordered(pick(item, "MenuItemOptionSets", "OptionSets", default=[])):
        if not pick(option_set, "IsMasterOptionSet"):
            continue
        options = [o for o in ordered(pick(option_set, "MenuItemOptionSetItems", "Items", default=[])) if available(o)]
        variants = [
            {"label": clean(pick(o, "Name")) or None, "amount": round(float(pick(o, "Price", default=0)), 2)}
            for o in options
        ]
        if variants:
            return variants
    price = pick(item, "Price")
    if isinstance(price, (int, float)) and price > 0:
        return [{"label": None, "amount": round(float(price), 2)}]
    return []


def convert(raw):
    sections = pick(raw, "MenuSections", "Sections", "Categories")
    if sections is None:
        for wrapper in ("Menu", "Data"):
            sections = pick(pick(raw, wrapper, default={}), "MenuSections", "Sections", "Categories")
            if sections:
                break
    if not isinstance(sections, list) or not sections:
        sys.exit("No menu sections found. The Flipdish format may have changed: check the file and update convert().")

    food, drinks = [], []
    for section in ordered(sections):
        if not available(section):
            continue
        name = clean(pick(section, "Name"))
        items = []
        for item in ordered(pick(section, "MenuItems", "Items", default=[])):
            if not available(item):
                continue
            raw_name = clean(pick(item, "Name"))
            description, allergens = split_description(pick(item, "Description"))
            listed = pick(item, "Allergens")
            if listed and not allergens:
                names = [clean(a if isinstance(a, str) else pick(a, "Name", default="")) for a in listed]
                allergens = ", ".join(n for n in names if n) or None
            entry = {
                "name": VEG.sub("", raw_name).strip(),
                "veg": bool(VEG.search(raw_name) or (description and VEG.search(description))),
                "prices": prices(item),
            }
            if description:
                entry["description"] = VEG.sub("", description).strip()
            if allergens:
                entry["allergens"] = allergens
            items.append(entry)
        if items:
            note = clean(pick(section, "Description")) or None
            (drinks if DRINKS.search(name) else food).append(
                {"id": slug(name), "name": name, "note": note, "items": items}
            )

    return {
        "meta": {
            "venue": "Mimo's Lounge, Bar & Grill",
            "source": "flipdish",
            "sourceNote": f"Cleaned copy of {MENU_URL}",
            "currency": "GBP",
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
    count = lambda group: sum(len(s["items"]) for s in menu[group])
    print(f"Wrote {OUT}: {len(menu['food'])} food sections ({count('food')} items), "
          f"{len(menu['drinks'])} drinks sections ({count('drinks')} items)")


if __name__ == "__main__":
    main()
