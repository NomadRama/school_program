#!/usr/bin/env python3
"""
Извлекает inline SVG из docs/module-1/index.html в curriculum/.../diagrams/*.svg.
Маппинг aria-label → имя файла ниже.
Запуск: python3 tools/extract_svgs.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "module-1" / "index.html"
DST = ROOT / "curriculum" / "stage-1" / "m1-controllable-lamp" / "diagrams"

# Маппинг aria-label (точная подстрока) → имя выходного файла
MAPPING = {
    "Плата-разветвитель ATX 24-pin":           "atx-breakout.svg",
    "Мультиметр UNI-T UT33C+":                 "multimeter-ut33c.svg",
    "4 части любой цепи":                      "four-parts.svg",
    "Замкнутая и разомкнутая цепь":            "closed-vs-open.svg",
    "Пример схемы на бумаге":                  "paper-schema-example.svg",
    "Простая цепь — только LED":               "circuit-led-only.svg",
    "Цепь с кнопкой":                          "circuit-with-button.svg",
    "Схема 4.3 — цепь с реле":                 "circuit-with-relay.svg",
    "Схема соединений Модуля 1":               "circuit-final.svg",
}

SVG_BLOCK = re.compile(r"<svg\b[^>]*?>.*?</svg>", re.DOTALL)
ARIA_ATTR = re.compile(r'aria-label="([^"]+)"')

def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    html = SRC.read_text(encoding="utf-8")

    extracted = 0
    skipped = 0
    for match in SVG_BLOCK.finditer(html):
        svg = match.group(0)
        aria = ARIA_ATTR.search(svg)
        if not aria:
            skipped += 1
            continue
        label = aria.group(1)

        out_name = None
        for key, fname in MAPPING.items():
            if key in label:
                out_name = fname
                break
        if not out_name:
            print(f"  ?? unknown aria-label: {label!r}")
            skipped += 1
            continue

        # Обернуть в XML-документ
        xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- Извлечено из docs/module-1/index.html скриптом tools/extract_svgs.py -->\n'
            f'<!-- aria-label: {label} -->\n'
            + svg
            + '\n'
        )
        # Если в теге <svg> нет xmlns — добавим
        if 'xmlns="http://www.w3.org/2000/svg"' not in svg[:200]:
            xml = xml.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)

        out_path = DST / out_name
        out_path.write_text(xml, encoding="utf-8")
        print(f"  ✓ {out_name}  ({len(svg):,} bytes, aria: {label[:50]})")
        extracted += 1

    print(f"\nГотово: извлечено {extracted}, пропущено {skipped}.")
    print(f"Папка: {DST}")

if __name__ == "__main__":
    main()
