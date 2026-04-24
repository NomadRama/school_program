#!/usr/bin/env python3
"""Часть 3 — глобальные замены (все вхождения) + финальная чистка."""
from pathlib import Path
import re

FILE = Path(__file__).resolve().parent.parent / "docs" / "kk" / "module-1" / "index.html"

# Все вхождения каждой пары — replace_all
GLOBAL = [
    # Часть 1, пропущенная в первом скрипте (многоразовые ярлыки)
    ("🧩 ВЫВОДЫ", "🧩 ҚОРЫТЫНДЫ"),
    ("✅ ЧЕКПОИНТ", "✅ ТЕКСЕРУ"),

    # CSS комментарии
    ("/* Тема (theme) */", "/* Тақырып (topic) */"),
    ("/* Checklist (inert, декоративный) */", "/* Checklist (inert, decorative) */"),
    ("/* Стоп. Проверь себя */", "/* Stop. Self-check */"),
    ("/* Термины с подсказкой при наведении */", "/* Terms with hover tooltip */"),
    ('content:" · скоро"', 'content:" · жақын арада"'),

    # Roadmap main description (still untouched)
    ("Модуль состоит из <b>6 этапов</b>. Двигайтесь по порядку: сверху вниз. Каждый этап разбит на темы. В каждой теме — 4 шага: <b>🛠 Практика → 💡 Теория → 🧩 Выводы → ✅ Чекпоинт</b>.",
     "Модуль <b>6 кезеңнен</b> тұрады. Ретімен жүріңіз: жоғарыдан төменге. Әр кезең тақырыптарға бөлінген. Әр тақырыпта — 4 қадам: <b>🛠 Практика → 💡 Теория → 🧩 Қорытынды → ✅ Тексеру</b>."),
    ("<h2><span class=\"num\">🗺</span> Модуль маршруты</h2>",
     "<h2><span class=\"num\">🗺</span> Модуль маршруты</h2>"),  # already ok

    # ATX breakout caption
    ("Плата-разветвитель ATX 24-pin: 24-контактный разъём (от блока питания), 8 банановых клемм (4 пары GND/+V), предохранитель, тумблер питания, индикатор. Размеры 128×48 мм.",
     "ATX 24-pin бөлгіш тақтасы: 24-контактты разъем (қуат блогінен), 8 банан клеммасы (4 GND/+V жұп), сақтандырғыш, қуат тумблері, индикатор. Өлшемі 128×48 мм."),

    # ATX SVG inner labels
    ('<text x="170" y="556" text-anchor="middle" font-family="monospace" font-size="8" fill="#B3D1F0" letter-spacing="1.5">ATX BREAKOUT · 24-PIN · 128×48</text>',
     '<text x="170" y="556" text-anchor="middle" font-family="monospace" font-size="8" fill="#B3D1F0" letter-spacing="1.5">ATX BREAKOUT · 24-PIN · 128×48</text>'),
    ('>Power LED</text>', '>Power LED</text>'),
    ('>24-pin</text>',    '>24-pin</text>'),
    ('>предохранитель</text>', '>сақтандырғыш</text>'),

    # Multimeter SVG labels
    ('>① Экран</text>', '>① Экран</text>'),
    ('>показывает результат</text>', '>нәтижені көрсетеді</text>'),
    ('>② Переключатель</text>', '>② Ауыстырғыш</text>'),
    ('>что мерять</text>', '>нені өлшеу керек</text>'),
    ('>V=  постоянное напряжение</text>', '>V=  тұрақты кернеу</text>'),
    ('>Ω — сопротивление</text>', '>Ω — кедергі</text>'),
    ('>🔊 — прозвонка (пикает)</text>', '>🔊 — шалу (шылдыр ешеді)</text>'),
    ('>③ COM (чёрный)</text>', '>③ COM (қара)</text>'),
    ('>сюда чёрный провод — «минус»</text>', '>қара сым осында — «минус»</text>'),
    ('>④ VΩmA (красный)</text>', '>④ VΩmA (қызыл)</text>'),

    # Multimeter caption
    ('<div class="caption">Мультиметр UT33C+. Четыре главные части: экран, переключатель, гнездо COM (чёрный провод), гнездо VΩmA (красный провод).</div>',
     '<div class="caption">UT33C+ мультиметрі. Төрт негізгі бөлік: экран, ауыстырғыш, COM ұясы (қара сым), VΩmA ұясы (қызыл сым).</div>'),

    # 4.1-4.3 SVG: БЛОК ATX labels (multiple occurrences)
    ('<text x="120" y="110" text-anchor="middle" class="bd-title">БЛОК ATX</text>',
     '<text x="120" y="110" text-anchor="middle" class="bd-title">ATX БЛОГІ</text>'),
    ('<text x="110" y="100" text-anchor="middle" class="bd-title">БЛОК ATX</text>',
     '<text x="110" y="100" text-anchor="middle" class="bd-title">ATX БЛОГІ</text>'),
    ('<text x="350" y="100" text-anchor="middle" class="bd-title">КНОПКА</text>',
     '<text x="350" y="100" text-anchor="middle" class="bd-title">ТҮЙМЕ</text>'),

    # Label "провод" in theme 3.1 SVG
    ('<text x="370" y="92" text-anchor="middle" class="bd-wlbl" fill="#B8822A">провод</text>',
     '<text x="370" y="92" text-anchor="middle" class="bd-wlbl" fill="#B8822A">сым</text>'),

    # Simulator Запуск callback
    ("setTimeout(() => event.target.textContent = 'копировать'",
     "setTimeout(() => event.target.textContent = 'көшіру'"),
    ("event.target.textContent = '✓ скопировано'",
     "event.target.textContent = '✓ көшірілді'"),

    # aria-labels in SVGs
    ('aria-label="4 части любой цепи"', 'aria-label="Кез келген тізбектің 4 бөлігі"'),
    ('aria-label="Пример схемы на бумаге"', 'aria-label="Қағаздағы сұлба мысалы"'),
    ('aria-label="Замкнутая и разомкнутая цепь"', 'aria-label="Тұйық және ашық тізбек"'),
    ('aria-label="Простая цепь — только LED"', 'aria-label="Қарапайым тізбек — тек LED"'),
    ('aria-label="Цепь с кнопкой"', 'aria-label="Түймесі бар тізбек"'),
    ('aria-label="Схема 4.3 — цепь с реле (управление кнопкой)"', 'aria-label="4.3-сұлба — релесі бар тізбек (түймемен басқару)"'),
    ('aria-label="Схема соединений Модуля 1"', 'aria-label="1-модуль жалғану сұлбасы"'),
    ('aria-label="Плата-разветвитель ATX 24-pin"', 'aria-label="ATX 24-pin бөлгіш тақтасы"'),
    ('aria-label="Мультиметр UNI-T UT33C+ с подписями"', 'aria-label="Жазулары бар UNI-T UT33C+ мультиметрі"'),
]


def run():
    s = FILE.read_text(encoding="utf-8")
    applied_total = 0
    for ru, kk in GLOBAL:
        count = s.count(ru)
        if count:
            s = s.replace(ru, kk)  # replace ALL occurrences
            applied_total += count
    FILE.write_text(s, encoding="utf-8")
    print(f"Часть 3: {applied_total} глобальных замен применено")


if __name__ == "__main__":
    run()
