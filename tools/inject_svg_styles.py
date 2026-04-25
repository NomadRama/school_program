#!/usr/bin/env python3
"""
Инжектирует inline <style> с .bd-* классами в SVG-файлы block-diagrams,
чтобы они корректно рендерились как автономные файлы (через <img src>).
"""
from pathlib import Path

STYLE = """  <style>
    .bd-comp   { fill:#FFFFFF; stroke:#1F3A5F; stroke-width:2 }
    .bd-pico   { fill:#E8F0F9 }
    .bd-relay  { fill:#E8F4EC }
    .bd-led    { fill:#FDECEA }
    .bd-atx    { fill:#F5F5F0 }
    .bd-btn    { fill:#FFF4E0 }
    .bd-source { fill:#FFE6D9 }
    .bd-load   { fill:#FDECEA }
    .bd-ctrl   { fill:#E8F4EC }
    .bd-wires  { fill:#F0F0F0 }
    .bd-title  { font:bold 14px sans-serif; fill:#1F3A5F }
    .bd-sub    { font:10px sans-serif; fill:#6B6B6B }
    .bd-section{ font:italic 10px sans-serif; fill:#8B8B8B }
    .bd-pin    { fill:#FFFFFF; stroke:#1F3A5F; stroke-width:1.5 }
    .bd-pinlbl { font:11px monospace; fill:#1F3A5F }
    .bd-wire   { stroke-width:2.5; fill:none; stroke-linecap:round; stroke-linejoin:round }
    .bd-wlbl   { font:bold 10px monospace }
  </style>
"""

FILES = [
    "docs/prototype/diagrams/four-parts.svg",
    "docs/prototype/diagrams/paper-schema-example.svg",
    "docs/prototype/diagrams/closed-vs-open.svg",
    "docs/prototype/diagrams/circuit-led-only.svg",
    "docs/prototype/diagrams/circuit-with-button.svg",
    "docs/prototype/diagrams/circuit-with-relay.svg",
    "docs/prototype/diagrams/circuit-final.svg",
    # also sync curriculum versions
    "curriculum/stage-1/m1-controllable-lamp/diagrams/four-parts.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/paper-schema-example.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/closed-vs-open.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/circuit-led-only.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/circuit-with-button.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/circuit-with-relay.svg",
    "curriculum/stage-1/m1-controllable-lamp/diagrams/circuit-final.svg",
]

ROOT = Path(__file__).resolve().parent.parent

def run():
    for rel in FILES:
        p = ROOT / rel
        if not p.exists():
            print(f"  miss: {rel}")
            continue
        s = p.read_text(encoding="utf-8")
        if ".bd-comp" in s and "<style>" in s and ".bd-comp   { fill:#FFFFFF" in s:
            print(f"  skip (already styled): {rel}")
            continue
        # Inject right after the opening <svg ...> tag
        import re
        m = re.search(r"(<svg\b[^>]*>)", s)
        if not m:
            print(f"  ! no <svg>: {rel}")
            continue
        new = s[:m.end()] + "\n" + STYLE + s[m.end():]
        p.write_text(new, encoding="utf-8")
        print(f"  ok: {rel}")

if __name__ == "__main__":
    run()
