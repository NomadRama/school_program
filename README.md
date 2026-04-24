# ShokanLab — School Program

Учебная программа инженерной школы [ShokanLab](https://github.com/NomadRama/ShokanLab) для подростков 12-17 лет в Казахстане. Открытый репозиторий — методички, схемы, код, сайт.

> **Сайт:** будет доступен по адресу [nomadrama.github.io/school_program](https://nomadrama.github.io/school_program/) после включения GitHub Pages.

---

## Что внутри

```
.
├── curriculum/          ← источник правды учебной программы (MD/SVG/YAML)
│   ├── README.md
│   └── stage-1/         ← Этап 1: База (3 модуля + введение)
├── docs/                ← статический сайт для GitHub Pages
│   ├── index.html       ← хаб Этапа 1
│   ├── intro/           ← введение для нового ученика
│   ├── module-1/        ← Модуль 1: Управляемая лампа (готов)
│   ├── module-2/        ← Модуль 2: Умная сушилка (заглушка)
│   └── module-3/        ← Модуль 3: Ночник с режимами (заглушка)
└── tools/               ← утилиты
    └── extract_svgs.py  ← вытаскивает inline SVG из HTML в curriculum/
```

## Принцип работы

- **`curriculum/`** — каноническая база. Меняется только тут.
- **`docs/`** — статический сайт, который видит ученик. Сейчас правится вручную, в будущем — генерируется из `curriculum/`.
- **Notion НЕ используется** как база программы. Только git.

Подробнее об устройстве — `curriculum/README.md`.

## Как читать программу

1. Откройте [`curriculum/stage-1/README.md`](curriculum/stage-1/README.md) — обзор Этапа 1
2. Любой модуль:
   - [`curriculum/stage-1/m1-controllable-lamp/content.md`](curriculum/stage-1/m1-controllable-lamp/content.md) — методичка
   - `spec.yaml` — метаданные (железо, длительность, компетенции)
   - `prompt.md` — мастер-промпт ИИ
   - `mentor.md` — заметки для ментора
   - `code/main.py` — референсный MicroPython
   - `diagrams/*.svg` — иллюстрации

## Что НЕ хранится здесь

- Личные данные учеников (имена, контакты, оценки) → отдельный CRM (Airtable)
- Фото/видео работ учеников → Google Drive
- Финансы, расписание, маркетинг → Google Sheets / Calendar
- Бизнес-стратегия и админка → приватный репо [`NomadRama/ShokanLab`](https://github.com/NomadRama/ShokanLab)

Этот репозиторий — **только учебная программа**.

## Лицензия

Программа предоставляется как референс для других преподавателей. Можно адаптировать под свою школу. Атрибуция приветствуется.

## Контакт

Рамазан Мухтар · ShokanLab Founder · Казахстан
