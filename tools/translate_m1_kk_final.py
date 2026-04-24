#!/usr/bin/env python3
"""Финальная чистка — остаточные вхождения."""
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "docs" / "kk" / "module-1" / "index.html"

R = [
    # "Без подглядывания" во всех местах
    ("<p>Без подглядывания:</p>", "<p>Қарамай:</p>"),

    # SVG финал — БЛОК ATX (в final circuit отдельный class)
    ('<text x="60" y="428" class="bd-title">БЛОК ATX</text>\n          <text x="60" y="444" class="bd-sub">источник питания</text>',
     '<text x="60" y="428" class="bd-title">ATX БЛОГІ</text>\n          <text x="60" y="444" class="bd-sub">қуат көзі</text>'),

    # SVG 4.4 final scheme labels (внутри class с другим отступом)
    ('<text x="360" y="150" class="bd-section">управление:</text>',
     '<text x="360" y="150" class="bd-section">басқару:</text>'),
    ('<text x="540" y="150" text-anchor="end" class="bd-section">силовые:</text>',
     '<text x="540" y="150" text-anchor="end" class="bd-section">қуаттық:</text>'),
    ('<text x="550" y="286" text-anchor="end" style="font:italic 9px sans-serif;fill:#AAA">не используем</text>',
     '<text x="550" y="286" text-anchor="end" style="font:italic 9px sans-serif;fill:#AAA">пайдаланбаймыз</text>'),

    # SVG 4.4 legend (final scheme)
    ('<text x="32" y="4" fill="#333">сигнал (3.3V от Pico)</text>',
     '<text x="32" y="4" fill="#333">сигнал (Pico-дан 3.3V)</text>'),
    ('<text x="212" y="4" fill="#333">питание</text>', '<text x="212" y="4" fill="#333">қоректену</text>'),
    ('<text x="452" y="4" fill="#333">силовая к LED</text>',
     '<text x="452" y="4" fill="#333">LED-ке қуаттық</text>'),

    # Theme 6.2 — запись в портфолио (с упоминанием Notion)
    ('<li><b>Запись в портфолио</b> — ментор откроет страницу в Notion:\n          <ul>',
     '<li><b>Портфолиодағы жазба</b> — ментор сіздің бетіңізді ашады:\n          <ul>'),

    # Table 2.2
    ('<tr><td>Реле</td><td>___</td></tr>',  '<tr><td>Реле</td><td>___</td></tr>'),

    # Comp label (same in both languages technically)
    ('<span class="comp">🔍 Диагностика</span>', '<span class="comp">🔍 Диагностика</span>'),
]


def run():
    s = FILE.read_text(encoding="utf-8")
    applied = 0
    for ru, kk in R:
        count = s.count(ru)
        if count:
            s = s.replace(ru, kk)  # replace all
            applied += count
    FILE.write_text(s, encoding="utf-8")
    print(f"Финал: применено {applied} замен")


if __name__ == "__main__":
    run()
