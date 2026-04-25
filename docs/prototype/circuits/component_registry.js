/**
 * ============================================
 * ShokanLab Component Registry
 * ============================================
 * 
 * Единая база данных всех компонентов для SVG-схем.
 * Каждый компонент содержит:
 *   - info     → паспорт детали (название, ссылка, характеристики)
 *   - size     → размерная категория (S/M/L/XL)
 *   - bbox     → зона запрета для проводов
 *   - pins     → точки подключения с направлениями
 *   - svg      → функция отрисовки визуала компонента
 * 
 * Стандарт: SOP_SVG_CIRCUIT_DIAGRAMS.md
 * Версия: 1.0
 * Дата: 2026-04-24
 */

// ============================================
// SIZE GRID (стандартные размеры bbox)
// ============================================
const SIZE_GRID = {
    S:  { w: 60,  h: 60  },   // LED, кнопка, бузер
    M:  { w: 120, h: 80  },   // Реле, MOSFET, датчик, OLED
    L:  { w: 220, h: 100 },   // Pico, Arduino, L298N
    XL: { w: 740, h: 220 }    // ATX плата, Breadboard
};

// ============================================
// WIRE COLORS (стандарт IEC 60446 + ShokanLab)
// ============================================
const WIRE_COLORS = {
    VCC:    "#ef4444",   // Красный — питание (+)
    GND:    "#1d1d1f",   // Чёрный — земля (−)
    SIGNAL: "#3b82f6",   // Синий — данные
    GPIO:   "#22c55e",   // Зелёный — GPIO control
    I2C_SDA:"#eab308",   // Жёлтый — I2C SDA
    I2C_SCL:"#e5e7eb",   // Белый — I2C SCL
    PWM:    "#a855f7",   // Фиолетовый — PWM
    POWER12:"#f97316"    // Оранжевый — 12V силовое
};

// ============================================
// ROUTING CONSTANTS
// ============================================
const EXIT_OFFSET  = 20;
const WIRE_SPACING = 30;

// ============================================
// COMPONENT REGISTRY
// ============================================
const COMPONENT_LIBRARY = {};

// ============================================
// HELPERS — единое правило SOP:
//   pins[key].x / y   = ВИЗУАЛЬНАЯ позиция (центр винта/пада/отверстия)
//   anchors[key].x/y  = позиция произвольного визуального элемента (экран, чип, USB...)
//   offset = { tx, ty } — сдвиг компонента на странице (origin)
// ============================================

// Абсолютные координаты пина на странице (центр визуала)
function pin(comp, pinKey, offset) {
    const p = comp.pins[pinKey];
    return { x: p.x + offset.tx, y: p.y + offset.ty, side: p.side };
}

// Точка выхода провода наружу bbox — для красивого ортогонального роутинга
function pinExit(comp, pinKey, offset, pad = EXIT_OFFSET) {
    const p = comp.pins[pinKey];
    const b = comp.bbox;
    const ox = offset.tx, oy = offset.ty;
    switch (p.side) {
        case "left":   return { x: ox + b.x - pad,         y: oy + p.y };
        case "right":  return { x: ox + b.x + b.w + pad,   y: oy + p.y };
        case "top":    return { x: ox + p.x,               y: oy + b.y - pad };
        case "bottom": return { x: ox + p.x,               y: oy + b.y + b.h + pad };
        default:       return { x: ox + p.x,               y: oy + p.y };
    }
}

// Абсолютные координаты произвольной anchor-точки компонента
function anchor(comp, anchorKey, offset) {
    const a = comp.anchors[anchorKey];
    return { x: a.x + offset.tx, y: a.y + offset.ty };
}


// ─────────────────────────────────────────────
// COMPONENT: ATX Breakout Board (XH-M229)
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["atx_xh_m229"] = {

    // === ПАСПОРТ ДЕТАЛИ ===
    info: {
        name_en: "ATX 24-Pin Breakout Board",
        name_ru: "Плата расширения ATX 24-Pin",
        model: "XH-M229",
        manufacturer: "YANXD",
        aliexpress: "https://aliexpress.ru/item/1005004954698261.html",
        price_usd: 2.50,
        description: "Преобразует стандартный 24-pin ATX разъём блока питания ПК в удобные винтовые/банановые клеммы с предохранителями на каждом канале.",
        specs: {
            input: "24-pin ATX connector (от БП компьютера)",
            outputs: [
                { rail: "+3.3V", max_current: "5A", fused: true },
                { rail: "+5V",   max_current: "5A", fused: true },
                { rail: "+12V",  max_current: "5A", fused: true },
                { rail: "-12V",  max_current: "0.5A", fused: true }
            ],
            switch: "ON/OFF toggle (замыкает PS_ON на GND)",
            indicator: "Red LED (PWR)",
            terminals: "Banana plug binding post (4mm)",
            mounting: "4× corner holes (M3)",
            pcb_size: "150mm × 62mm"
        },
        safety: [
            "Всегда выключай переключатель перед подключением/отключением проводов",
            "Не замыкай клеммы разных напряжений между собой",
            "Максимальный ток через одну клемму — 5A (защита предохранителем)",
            "Используй мультиметр для проверки напряжения перед подключением нагрузки"
        ]
    },

    // === РАЗМЕР ===
    size: "XL",

    // === BOUNDING BOX (зона запрета) ===
    // Рассчитан под viewBox 820×620
    bbox: { x: 40, y: 30, w: 740, h: 220 },

    // === ПИНЫ (точки подключения) ===
    // Расположение: 8 клемм в ряд внизу платы
    // Порядок слева направо: -12V, GND, +12V, GND, +5V, GND, +3.3V, GND
    // ПРАВИЛО SOP: pin.x/y = визуальный центр клеммы (банановой шляпки)
    pins: {
        "minus12V": { x: 100, y: 160, side: "bottom", color: WIRE_COLORS.VCC,     label: "−12V",  type: "power", voltage: -12 },
        "gnd_1":    { x: 160, y: 160, side: "bottom", color: WIRE_COLORS.GND,     label: "GND",   type: "ground" },
        "plus12V":  { x: 260, y: 160, side: "bottom", color: WIRE_COLORS.POWER12, label: "+12V",  type: "power", voltage: 12 },
        "gnd_2":    { x: 340, y: 160, side: "bottom", color: WIRE_COLORS.GND,     label: "GND",   type: "ground" },
        "plus5V":   { x: 440, y: 160, side: "bottom", color: WIRE_COLORS.VCC,     label: "+5V",   type: "power", voltage: 5 },
        "gnd_3":    { x: 520, y: 160, side: "bottom", color: WIRE_COLORS.GND,     label: "GND",   type: "ground" },
        "plus3V3":  { x: 620, y: 160, side: "bottom", color: WIRE_COLORS.VCC,     label: "+3.3V", type: "power", voltage: 3.3 },
        "gnd_4":    { x: 700, y: 160, side: "bottom", color: WIRE_COLORS.GND,     label: "GND",   type: "ground" }
    },

    // === SVG RENDER FUNCTION ===
    // Рисует визуальное представление компонента
    // origin: {x, y} — верхний левый угол bbox
    renderSVG: function(origin) {
        const ox = origin?.x ?? this.bbox.x;
        const oy = origin?.y ?? this.bbox.y;
        const w = this.bbox.w;
        const h = this.bbox.h;

        return `
        <g id="comp-atx_xh_m229" class="component" data-component="atx_xh_m229">
            <!-- PCB Board -->
            <rect x="${ox}" y="${oy}" width="${w}" height="${h}" rx="8" ry="8"
                  fill="#1565C0" stroke="#0D47A1" stroke-width="2"/>
            
            <!-- PCB traces (decorative) -->
            <rect x="${ox+10}" y="${oy+10}" width="${w-20}" height="${h-20}" rx="4"
                  fill="none" stroke="#1976D2" stroke-width="0.5" opacity="0.4"/>

            <!-- Corner mounting holes (M3) -->
            <circle cx="${ox+15}" cy="${oy+15}" r="5" fill="#0D47A1" stroke="#1976D2" stroke-width="1"/>
            <circle cx="${ox+w-15}" cy="${oy+15}" r="5" fill="#0D47A1" stroke="#1976D2" stroke-width="1"/>
            <circle cx="${ox+15}" cy="${oy+h-15}" r="5" fill="#0D47A1" stroke="#1976D2" stroke-width="1"/>
            <circle cx="${ox+w-15}" cy="${oy+h-15}" r="5" fill="#0D47A1" stroke="#1976D2" stroke-width="1"/>

            <!-- ON/OFF Switch -->
            <rect x="${ox+30}" y="${oy+30}" width="${60}" height="${25}" rx="3"
                  fill="#E0E0E0" stroke="#9E9E9E" stroke-width="1"/>
            <rect x="${ox+52}" y="${oy+32}" width="${18}" height="${21}" rx="2"
                  fill="#424242" stroke="#616161" stroke-width="1"/>
            <text x="${ox+38}" y="${oy+47}" fill="#757575" font-size="8" font-weight="600">OFF</text>
            <text x="${ox+58}" y="${oy+47}" fill="#4CAF50" font-size="8" font-weight="700">ON</text>
            <text x="${ox+35}" y="${oy+25}" fill="#90CAF9" font-size="7">SWITCH</text>

            <!-- 24-pin ATX Connector (white) -->
            <rect x="${ox+240}" y="${oy+20}" width="${180}" height="${45}" rx="3"
                  fill="#F5F5F5" stroke="#BDBDBD" stroke-width="1.5"/>
            <!-- Connector pins (two rows) -->
            ${Array.from({length: 12}, (_, i) => 
                `<rect x="${ox+248+i*14}" y="${oy+28}" width="8" height="12" rx="1" fill="#C0C0C0" stroke="#999" stroke-width="0.5"/>
                 <rect x="${ox+248+i*14}" y="${oy+45}" width="8" height="12" rx="1" fill="#C0C0C0" stroke="#999" stroke-width="0.5"/>`
            ).join('')}
            <text x="${ox+330}" y="${oy+75}" text-anchor="middle" fill="#90CAF9" font-size="9">24-pin ATX</text>

            <!-- PWR LED -->
            <circle cx="${ox+w-50}" cy="${oy+35}" r="4" fill="#F44336" opacity="0.9"/>
            <circle cx="${ox+w-50}" cy="${oy+35}" r="6" fill="none" stroke="#F44336" stroke-width="0.5" opacity="0.4"/>
            <text x="${ox+w-50}" y="${oy+50}" text-anchor="middle" fill="#90CAF9" font-size="7">PWR</text>

            <!-- Fuse holders (4 glass fuses) -->
            ${[0, 1, 2, 3].map(i => {
                const fx = ox + 60 + i * 170;
                return `<rect x="${fx}" y="${oy+95}" width="${80}" height="${16}" rx="8" 
                              fill="#E8F5E9" stroke="#A5D6A7" stroke-width="1" opacity="0.7"/>
                         <circle cx="${fx+8}" cy="${oy+103}" r="5" fill="#C8E6C9" stroke="#81C784" stroke-width="1"/>
                         <circle cx="${fx+72}" cy="${oy+103}" r="5" fill="#C8E6C9" stroke="#81C784" stroke-width="1"/>`;
            }).join('')}
            <text x="${ox+60}" y="${oy+88}" fill="#90CAF9" font-size="7">FUSE</text>

            <!-- Terminal binding posts (banana plugs) -->
            <!-- Pattern: Red=voltage, Black=GND, alternating -->
            ${Object.entries(this.pins).map(([name, pin]) => {
                const isGnd = pin.type === "ground";
                const termColor = isGnd ? "#212121" : "#E53935";
                const ringColor = isGnd ? "#424242" : "#EF5350";
                const nutColor = isGnd ? "#333333" : "#C62828";
                return `
                    <!-- Terminal: ${pin.label} (визуал в pin.x/pin.y, см. SOP) -->
                    <circle cx="${ox + pin.x}" cy="${oy + pin.y}" r="14" fill="${termColor}" stroke="${ringColor}" stroke-width="2"/>
                    <circle cx="${ox + pin.x}" cy="${oy + pin.y}" r="8" fill="${nutColor}" stroke="${termColor}" stroke-width="1.5"/>
                    <circle cx="${ox + pin.x}" cy="${oy + pin.y}" r="3" fill="#111"/>
                    <text x="${ox + pin.x}" y="${oy + pin.y + 30}" text-anchor="middle"
                          fill="${isGnd ? '#E0E0E0' : '#FFCDD2'}" font-size="11" font-weight="700">
                        ${pin.label}
                    </text>`;
            }).join('')}

            <!-- Board label -->
            <text x="${ox + w/2}" y="${oy + h + 18}" text-anchor="middle" 
                  fill="#78909C" font-size="13" font-weight="600">
                Плата ATX · XH-M229
            </text>
        </g>`;
    }
};


// ─────────────────────────────────────────────
// COMPONENT: LED 3W Star PCB (Top View)
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["led_3w_star"] = {

    // === ПАСПОРТ ДЕТАЛИ ===
    info: {
        name_en: "3W High Power LED on Star PCB",
        name_ru: "Светодиод 3Вт на алюминиевой звезде",
        model: "3W White Star LED",
        aliexpress: "https://aliexpress.ru/item/1005005766856436.html",
        price_usd: 0.30,
        description: "Мощный светодиод 3Вт на алюминиевой подложке 20мм в форме звезды. Используется как основной источник света в модуле 1.",
        specs: {
            forward_voltage: "3.0–3.6V",
            forward_current: "700mA (max)",
            power: "3W",
            color_temp: "6000–6500K (Cold White)",
            luminous_flux: "180–200 lm",
            beam_angle: "120°",
            pcb_diameter: "20mm (star shape)",
            mounting: "M3 center hole or thermal adhesive"
        },
        safety: [
            "Не смотри прямо на включённый LED — яркость может повредить зрение",
            "Требуется токоограничивающий резистор или драйвер тока",
            "При 3.3V от ATX: ток ~300-500mA (допустимо без резистора для демо)",
            "Нагревается! Не трогай подложку после длительной работы"
        ]
    },

    // === РАЗМЕР ===
    size: "S",

    // === BOUNDING BOX ===
    bbox: { x: 0, y: 0, w: 60, h: 60 },

    // === ПИНЫ ===
    // Вид сверху: анод (+) слева, катод (−) справа
    // Провода подходят с боков (симметрично)
    // ПРАВИЛО SOP: pin.x/y = центр серебристого пада (не край bbox)
    // Левый пад: cx-outerR+1..cx-outerR+11 при cx=30, outerR=28 → x∈[3..13], центр 8
    // Правый пад: cx+outerR-11..cx+outerR-1 → x∈[47..57], центр 52
    pins: {
        "anode":   { x: 8,  y: 30, side: "left",  color: WIRE_COLORS.VCC, label: "+", type: "power" },
        "cathode": { x: 52, y: 30, side: "right", color: WIRE_COLORS.GND, label: "−", type: "ground" }
    },

    // === SVG RENDER FUNCTION ===
    renderSVG: function(origin) {
        const cx = (origin?.x ?? this.bbox.x) + 30;  // center X
        const cy = (origin?.y ?? this.bbox.y) + 30;  // center Y
        const outerR = 28;  // arm tip radius
        const innerR = 19;  // notch depth radius
        const arms = 6;

        // Rounded star path: arm tips are flat/rounded, notches are concave arcs
        function roundedStarPath(cx, cy, outerR, innerR, arms) {
            const points = [];
            const armAngle = (Math.PI * 2) / arms;
            const halfArm = armAngle / 2;
            const tipWidth = 0.28; // controls how wide each arm tip is (radians)

            for (let i = 0; i < arms; i++) {
                const angle = i * armAngle - Math.PI / 2;

                // Arm tip: two points forming a flat/wide tip
                const tipL = angle - tipWidth;
                const tipR = angle + tipWidth;
                points.push({
                    x: cx + outerR * Math.cos(tipL),
                    y: cy + outerR * Math.sin(tipL),
                    type: 'line'
                });
                points.push({
                    x: cx + outerR * Math.cos(tipR),
                    y: cy + outerR * Math.sin(tipR),
                    type: 'line'
                });

                // Notch between this arm and next: concave arc
                const notchAngle = angle + halfArm;
                const notchX = cx + innerR * Math.cos(notchAngle);
                const notchY = cy + innerR * Math.sin(notchAngle);
                points.push({
                    x: notchX,
                    y: notchY,
                    type: 'arc',
                    r: 8  // arc radius for smooth curve
                });
            }

            // Build SVG path with arcs at notches
            let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
            for (let i = 1; i < points.length; i++) {
                const p = points[i];
                if (p.type === 'arc') {
                    d += ` A${p.r},${p.r} 0 0,1 ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                } else {
                    d += ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                }
            }
            // Close with arc back to first point
            d += ` A8,8 0 0,1 ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}Z`;
            return d;
        }

        // Thermal pad positions (6 pads at arm tips)
        const padAngles = [0, 1, 2, 3, 4, 5].map(i => -Math.PI/2 + i * Math.PI/3);
        const padR = 20;
        const padSize = 6;

        return `
        <g id="comp-led_3w_star" class="component" data-component="led_3w_star">
            <!-- Star PCB (aluminum substrate) — rounded arms -->
            <path d="${roundedStarPath(cx, cy, outerR, innerR, arms)}"
                  fill="#1A237E" stroke="#283593" stroke-width="1.5"/>

            <!-- Thermal pads (6 silver rectangles on arm tips) -->
            ${padAngles.map(angle => {
                const px = cx + padR * Math.cos(angle);
                const py = cy + padR * Math.sin(angle);
                return `<rect x="${(px - padSize/2).toFixed(1)}" y="${(py - padSize/2).toFixed(1)}" 
                              width="${padSize}" height="${padSize}" rx="1"
                              fill="#B0BEC5" stroke="#90A4AE" stroke-width="0.5" 
                              transform="rotate(${(angle * 180/Math.PI).toFixed(0)}, ${px.toFixed(1)}, ${py.toFixed(1)})"/>`;
            }).join('')}

            <!-- LED base ring (white ceramic) -->
            <circle cx="${cx}" cy="${cy}" r="13" 
                    fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1"/>

            <!-- LED dome lens (clear/blue tint) -->
            <circle cx="${cx}" cy="${cy}" r="9" 
                    fill="#E3F2FD" stroke="#BBDEFB" stroke-width="0.8"/>

            <!-- LED phosphor chip (yellow center) -->
            <circle cx="${cx}" cy="${cy}" r="5" 
                    fill="#FFF9C4" stroke="#FFF176" stroke-width="0.5"/>
            
            <!-- Light glow effect -->
            <circle cx="${cx}" cy="${cy}" r="7" 
                    fill="url(#ledGlow)" opacity="0.3"/>

            <!-- Solder pads for wires (left = +, right = −) -->
            <!-- Anode pad (+) -->
            <rect x="${cx - outerR + 1}" y="${cy - 4}" width="10" height="8" rx="1"
                  fill="#C0C0C0" stroke="#999" stroke-width="0.8"/>
            <text x="${cx - outerR + 6}" y="${cy + 2}" text-anchor="middle"
                  fill="#333" font-size="6" font-weight="700">+</text>

            <!-- Cathode pad (−) -->
            <rect x="${cx + outerR - 11}" y="${cy - 4}" width="10" height="8" rx="1"
                  fill="#C0C0C0" stroke="#999" stroke-width="0.8"/>
            <text x="${cx + outerR - 6}" y="${cy + 2}" text-anchor="middle"
                  fill="#333" font-size="6" font-weight="700">−</text>

            <!-- Polarity marker (notch near cathode) -->
            <line x1="${cx + 3}" y1="${cy + 12}" x2="${cx + 7}" y2="${cy + 12}"
                  stroke="#5C6BC0" stroke-width="1.5"/>

            <!-- Component label -->
            <text x="${cx}" y="${cy + outerR + 14}" text-anchor="middle" 
                  fill="#1e2a4a" font-size="11" font-weight="700">
                LED 3 Вт
            </text>

            <!-- Gradient for glow -->
            <defs>
                <radialGradient id="ledGlow">
                    <stop offset="0%" stop-color="#FFEB3B" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#FFEB3B" stop-opacity="0"/>
                </radialGradient>
            </defs>
        </g>`;
    }
};


// ─────────────────────────────────────────────
// COMPONENT: Tactile Button (2-pin, 6x6mm style)
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["button_tactile_2pin"] = {
    // === ПАСПОРТ ДЕТАЛИ ===
    info: {
        name_en: "Tactile Push Button (2-pin)",
        name_ru: "Тактовая кнопка (2 контакта)",
        model: "6x6mm Tactile Switch",
        aliexpress: "https://aliexpress.ru/item/1005004971266223.html", // user's active page
        price_usd: 0.05,
        description: "Обычная тактовая кнопка. Замыкает цепь при нажатии. Имеет две прямые ножки, поэтому перепутать контакты невозможно.",
        specs: {
            type: "Momentary Push Button (NO - Normally Open)",
            rating: "50mA 12V DC",
            size: "6x6x5 mm",
            pins: "2 pins (straight)"
        },
        safety: [
            "При нажатии ток течёт напрямую. Если нет потребителя (LED/резистора), произойдёт короткое замыкание!"
        ]
    },

    // Относится к категории малых компонентов (S)
    size: "S",

    // ПРАВИЛО 0,0: Все расчеты внутри (0, 0)
    bbox: { x: 0, y: 0, w: 60, h: 60 },

    // === ПИНЫ ===
    // Контакты торчат влево и вправо по оси Y=30
    // ПРАВИЛО SOP: pin.x/y = центр пайки на ножке (renderSVG рисует circle cx=5/55 cy=30)
    pins: {
        "pin_a": { x: 5,  y: 30, side: "left",  color: WIRE_COLORS.SIGNAL, label: "A", type: "passive" },
        "pin_b": { x: 55, y: 30, side: "right", color: WIRE_COLORS.SIGNAL, label: "B", type: "passive" }
    },

    // ВНИМАНИЕ: Правило 0,0. Функция не принимает origin, рисует строго в 0,0.
    renderSVG: function() {
        return `
        <g class="component" data-component="button_tactile_2pin">
            <!-- Metal Pins (Левая и правая ножки) -->
            <rect x="0" y="27" width="15" height="6" fill="#B0BEC5" stroke="#78909C" stroke-width="1.5" rx="1"/>
            <rect x="45" y="27" width="15" height="6" fill="#B0BEC5" stroke="#78909C" stroke-width="1.5" rx="1"/>
            
            <!-- Обозначение отверстия для провода/пайки -->
            <circle cx="5" cy="30" r="2" fill="#263238"/>
            <circle cx="55" cy="30" r="2" fill="#263238"/>

            <!-- Черный пластиковый корпус -->
            <rect x="13" y="13" width="34" height="34" rx="4" fill="#212121" stroke="#424242" stroke-width="2"/>
            
            <!-- Внутренний круглый рельеф корпуса -->
            <circle cx="30" cy="30" r="14" fill="#111" stroke="#333" stroke-width="1.5"/>
            
            <!-- Желтая нажимная кнопка -->
            <circle cx="30" cy="30" r="10" fill="#E53935" stroke="#B71C1C" stroke-width="2"/>
            <circle cx="27" cy="27" r="4" fill="#EF9A9A" opacity="0.5"/> <!-- Блик -->
            
            <text x="30" y="55" text-anchor="middle" fill="#9E9E9E" font-size="8" font-weight="600">КНОПКА</text>
            
            <!-- Invisible hit target for clicking (for interactive demos) -->
            <circle cx="30" cy="30" r="15" fill="transparent" class="btn-hit-area" style="cursor: pointer"/>
        </g>`;
    }
};

// ─────────────────────────────────────────────
// COMPONENT: 1-Channel Relay Module (JQC-3FF-S-Z, 5V, optocoupler)
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["relay_jqc_3ff_s_z"] = {

    // === ПАСПОРТ ДЕТАЛИ ===
    info: {
        name_en: "1-Channel 5V Relay Module with Optocoupler (High/Low Trigger)",
        name_ru: "1-канальный модуль реле 5V с оптопарой (H/L триггер)",
        model: "JQC-3FF-S-Z",
        manufacturer: "HKE (relay chip)",
        aliexpress: "https://aliexpress.ru/item/relay-1ch-5v.html",
        price_usd: 0.80,
        description: "Модуль реле с оптопарой для гальванической развязки. Принимает слабый сигнал от Pico и коммутирует отдельную силовую цепь (до 10A 250VAC). Джампер H/L выбирает уровень триггера.",
        specs: {
            coil_voltage: "5V DC (работает и от 3.3V)",
            coil_current: "~70 mA при 5V",
            switching_capacity: "10A 250VAC / 15A 125VAC / 10A 30VDC",
            trigger: "High-level (джампер H, по умолчанию) или Low-level (джампер L)",
            isolation: "Оптопара EL357N — полная гальваническая развязка катушки от контактов",
            indicator: "PWR LED (красный) + Status LED (зелёный)",
            pcb_size: "56mm × 26mm × 3mm",
            mounting: "4× corner holes (M3)",
            input_terminals: "DC+ (питание катушки), DC− (земля), IN (сигнал)",
            output_terminals: "NC (Normally Closed), COM (общий), NO (Normally Open)"
        },
        safety: [
            "Проверь джампер H/L перед работой. По умолчанию — H (high-level trigger). В позиции L логика инверсная.",
            "Не коммутируй 220V без разрешения ментора",
            "Максимальный ток через контакты — 10A при 250VAC",
            "После срабатывания слышен щелчок — это нормально, значит реле сработало",
            "Между катушкой (DC+/DC−/IN) и контактами (NC/COM/NO) — полная развязка через оптопару"
        ]
    },

    // === РАЗМЕР (ближе к M, но шире из-за 2×3 клемм) ===
    size: "M",

    // === BOUNDING BOX (viewBox units) ===
    // Пропорция ~2.15:1 как реальная плата 56:26мм
    bbox: { x: 0, y: 0, w: 260, h: 130 },

    // === ПИНЫ (точки подключения) ===
    // Управление (левая клемма): DC+ сверху, DC− в середине, IN снизу (по фото)
    // Сила (правая клемма): NC сверху, COM в середине, NO снизу
    // ПРАВИЛО SOP: pin.x/y = центр серебристого винта клеммы
    // Левые винты рисуются в renderSVG при (ox+37, oy+30|65|100), правые — (ox+w-38=ox+222, oy+30|65|100)
    pins: {
        "dc_plus":  { x: 37,  y: 30,  side: "left",  color: WIRE_COLORS.VCC,    label: "DC+", type: "power",   voltage: 3.3 },
        "dc_minus": { x: 37,  y: 65,  side: "left",  color: WIRE_COLORS.GND,    label: "DC−", type: "ground" },
        "signal":   { x: 37,  y: 100, side: "left",  color: WIRE_COLORS.GPIO,   label: "IN",  type: "signal" },
        "nc":       { x: 222, y: 30,  side: "right", color: "#9CA3AF",          label: "NC",  type: "contact", state: "normally_closed" },
        "com":      { x: 222, y: 65,  side: "right", color: WIRE_COLORS.VCC,    label: "COM", type: "contact", state: "common" },
        "no":       { x: 222, y: 100, side: "right", color: WIRE_COLORS.VCC,    label: "NO",  type: "contact", state: "normally_open" }
    },

    // === ANCHORS (визуальные опорные точки для callouts) ===
    anchors: {
        "coil":     { x: 165, y: 65  },  // центр катушки
        "optocoupler": { x: 103, y: 62 },
        "jumper":   { x: 77,  y: 34  },
        "pwr_led":  { x: 75,  y: 118 },
        "status_led": { x: 100, y: 118 }
    },

    // === SVG RENDER FUNCTION ===
    renderSVG: function(origin) {
        const ox = origin?.x ?? this.bbox.x;
        const oy = origin?.y ?? this.bbox.y;
        const w = this.bbox.w;
        const h = this.bbox.h;

        return `
        <g id="comp-relay_jqc_3ff_s_z" class="component" data-component="relay_jqc_3ff_s_z">

            <!-- PCB (красный, закруглённые углы) -->
            <rect x="${ox}" y="${oy}" width="${w}" height="${h}" rx="4" ry="4"
                  fill="#C62828" stroke="#8B1A1A" stroke-width="1.5"/>

            <!-- Декоративный внутренний контур дорожек -->
            <rect x="${ox+3}" y="${oy+3}" width="${w-6}" height="${h-6}" rx="3"
                  fill="none" stroke="#E53935" stroke-width="0.5" opacity="0.5"/>

            <!-- Монтажные отверстия (4 угла, M3) -->
            <circle cx="${ox+8}" cy="${oy+8}" r="4" fill="#F5F5F5" stroke="#888" stroke-width="0.8"/>
            <circle cx="${ox+w-8}" cy="${oy+8}" r="4" fill="#F5F5F5" stroke="#888" stroke-width="0.8"/>
            <circle cx="${ox+8}" cy="${oy+h-8}" r="4" fill="#F5F5F5" stroke="#888" stroke-width="0.8"/>
            <circle cx="${ox+w-8}" cy="${oy+h-8}" r="4" fill="#F5F5F5" stroke="#888" stroke-width="0.8"/>

            <!-- ============ ЛЕВАЯ КЛЕММА (управление) ============ -->
            <rect x="${ox+15}" y="${oy+18}" width="45" height="94" rx="2"
                  fill="#1565C0" stroke="#0D47A1" stroke-width="1"/>

            <!-- DC+ винт сверху -->
            <circle cx="${ox+37}" cy="${oy+30}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+34}" y="${oy+27}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+34}" y1="${oy+30}" x2="${ox+40}" y2="${oy+30}" stroke="#333" stroke-width="1"/>
            <text x="${ox+37}" y="${oy+22}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">DC+</text>

            <!-- DC− винт в середине -->
            <circle cx="${ox+37}" cy="${oy+65}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+34}" y="${oy+62}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+34}" y1="${oy+65}" x2="${ox+40}" y2="${oy+65}" stroke="#333" stroke-width="1"/>
            <text x="${ox+37}" y="${oy+51}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">DC−</text>

            <!-- IN винт снизу -->
            <circle cx="${ox+37}" cy="${oy+100}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+34}" y="${oy+97}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+34}" y1="${oy+100}" x2="${ox+40}" y2="${oy+100}" stroke="#333" stroke-width="1"/>
            <text x="${ox+37}" y="${oy+86}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">IN</text>

            <!-- ============ ДЖАМПЕР H/L ============ -->
            <rect x="${ox+70}" y="${oy+28}" width="14" height="12" rx="1"
                  fill="#424242" stroke="#222" stroke-width="0.8"/>
            <rect x="${ox+72}" y="${oy+30}" width="4" height="8" fill="#FBC02D"/>
            <text x="${ox+66}" y="${oy+25}" fill="#F5F5F5" font-size="5" font-weight="700">H</text>
            <text x="${ox+84}" y="${oy+25}" fill="#F5F5F5" font-size="5" font-weight="700">L</text>
            <text x="${ox+77}" y="${oy+50}" text-anchor="middle" fill="#FDD835" font-size="5" font-weight="700">JP: H</text>

            <!-- ============ ОПТОПАРА (SMD IC) ============ -->
            <rect x="${ox+92}" y="${oy+55}" width="22" height="14" rx="1"
                  fill="#1A1A1A" stroke="#000" stroke-width="0.5"/>
            <circle cx="${ox+95}" cy="${oy+58}" r="0.8" fill="#555"/>
            <text x="${ox+103}" y="${oy+64}" text-anchor="middle" fill="#777" font-size="4.5" font-family="monospace">EL357N</text>

            <!-- ============ Пассивные компоненты (резисторы, диод) ============ -->
            <rect x="${ox+70}" y="${oy+78}" width="12" height="4" rx="0.5" fill="#F5F5F5" stroke="#999" stroke-width="0.3"/>
            <rect x="${ox+86}" y="${oy+78}" width="12" height="4" rx="0.5" fill="#F5F5F5" stroke="#999" stroke-width="0.3"/>
            <rect x="${ox+70}" y="${oy+86}" width="12" height="4" rx="0.5" fill="#F5F5F5" stroke="#999" stroke-width="0.3"/>
            <rect x="${ox+86}" y="${oy+86}" width="12" height="4" rx="0.5" fill="#F5F5F5" stroke="#999" stroke-width="0.3"/>

            <!-- ============ КАТУШКА РЕЛЕ (большой синий куб справа от центра) ============ -->
            <rect x="${ox+120}" y="${oy+22}" width="90" height="86" rx="2"
                  fill="#0D47A1" stroke="#061A4E" stroke-width="1.5"/>
            <!-- Выступ катушки (имитация 3D) -->
            <rect x="${ox+120}" y="${oy+22}" width="90" height="4"
                  fill="#1565C0"/>
            <!-- Надписи на катушке -->
            <text x="${ox+165}" y="${oy+50}" text-anchor="middle" fill="#fff"
                  font-family="monospace" font-size="8" font-weight="700">JQC-3FF-S-Z</text>
            <text x="${ox+165}" y="${oy+65}" text-anchor="middle" fill="#FFCDD2" font-size="6">10A 250VAC</text>
            <text x="${ox+165}" y="${oy+75}" text-anchor="middle" fill="#FFCDD2" font-size="6">15A 125VAC</text>
            <!-- Сертификация -->
            <text x="${ox+165}" y="${oy+90}" text-anchor="middle" fill="#FFCDD2" font-size="5">UL · CCC</text>
            <!-- Декоративные "ноги" катушки -->
            <circle cx="${ox+130}" cy="${oy+102}" r="1.5" fill="#C0C0C0"/>
            <circle cx="${ox+145}" cy="${oy+102}" r="1.5" fill="#C0C0C0"/>
            <circle cx="${ox+185}" cy="${oy+102}" r="1.5" fill="#C0C0C0"/>
            <circle cx="${ox+200}" cy="${oy+102}" r="1.5" fill="#C0C0C0"/>

            <!-- ============ ПРАВАЯ КЛЕММА (сила) ============ -->
            <rect x="${ox+w-60}" y="${oy+18}" width="45" height="94" rx="2"
                  fill="#1565C0" stroke="#0D47A1" stroke-width="1"/>

            <!-- NC винт сверху -->
            <circle cx="${ox+w-38}" cy="${oy+30}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+w-41}" y="${oy+27}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+w-41}" y1="${oy+30}" x2="${ox+w-35}" y2="${oy+30}" stroke="#333" stroke-width="1"/>
            <text x="${ox+w-38}" y="${oy+22}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">NC</text>

            <!-- COM винт в середине -->
            <circle cx="${ox+w-38}" cy="${oy+65}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+w-41}" y="${oy+62}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+w-41}" y1="${oy+65}" x2="${ox+w-35}" y2="${oy+65}" stroke="#333" stroke-width="1"/>
            <text x="${ox+w-38}" y="${oy+51}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">COM</text>

            <!-- NO винт снизу -->
            <circle cx="${ox+w-38}" cy="${oy+100}" r="6" fill="#E0E0E0" stroke="#757575" stroke-width="1"/>
            <rect x="${ox+w-41}" y="${oy+97}" width="6" height="6" fill="#9E9E9E"/>
            <line x1="${ox+w-41}" y1="${oy+100}" x2="${ox+w-35}" y2="${oy+100}" stroke="#333" stroke-width="1"/>
            <text x="${ox+w-38}" y="${oy+86}" text-anchor="middle" fill="#fff" font-size="7" font-weight="700">NO</text>

            <!-- ============ PWR LED (красный, с подписью) ============ -->
            <circle cx="${ox+75}" cy="${oy+118}" r="2.5" fill="#F44336" opacity="0.9"/>
            <circle cx="${ox+75}" cy="${oy+118}" r="3.5" fill="none" stroke="#F44336" stroke-width="0.3" opacity="0.5"/>
            <text x="${ox+84}" y="${oy+121}" fill="#fff" font-size="6" font-weight="600">PWR</text>

            <!-- ============ Status LED (зелёный, для состояния реле) ============ -->
            <circle cx="${ox+100}" cy="${oy+118}" r="2.2" fill="#4CAF50" opacity="0.6"/>

            <!-- ============ Подпись модуля снизу ============ -->
            <text x="${ox + w/2}" y="${oy + h + 18}" text-anchor="middle"
                  fill="#555" font-size="12" font-weight="600">
                Реле JQC-3FF-S-Z · 1 канал · джампер H
            </text>
        </g>`;
    }
};


// ─────────────────────────────────────────────
// COMPONENT: Raspberry Pi Pico (RP2040, no WiFi)
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["raspberry_pi_pico"] = {

    info: {
        name_en: "Raspberry Pi Pico",
        name_ru: "Raspberry Pi Pico (микроконтроллер)",
        model: "Pico (RP2040)",
        manufacturer: "Raspberry Pi Ltd",
        datasheet: "https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf",
        pinout_pdf: "https://datasheets.raspberrypi.com/pico/Pico-R3-A4-Pinout.pdf",
        aliexpress: "https://aliexpress.ru/item/raspberry-pi-pico.html",
        price_usd: 4.00,
        description: "Микроконтроллер на базе RP2040 с 40 пинами, USB Micro-B, 2MB флеш-памяти. Программируется на MicroPython через Thonny.",
        specs: {
            mcu: "RP2040 (dual Cortex-M0+, до 133 МГц)",
            ram: "264 КБ SRAM",
            flash: "2 МБ (W25Q16JV)",
            gpio: "26 (GP0..GP22, GP26..GP28; GP23-25 внутренние)",
            adc: "3 канала (GP26, GP27, GP28)",
            pwm: "16 каналов (любые GPIO)",
            logic_voltage: "3.3V (НЕ 5V-толерантный)",
            usb: "Micro-B 1.1",
            max_current_per_gpio: "12 мА (безопасно), 25 мА абсолютный максимум",
            total_gpio_budget: "50 мА суммарно",
            pcb_size: "51 × 21 × 1 мм",
            mass_g: 3
        },
        safety: [
            "НЕ подавать 5V или 12V на GPIO — моментальная поломка чипа",
            "НЕ коротить 3V3_OUT на GND напрямую",
            "НЕ отключать USB при горящем индикаторе записи — можно испортить прошивку",
            "ESD (статика) может повредить чип — держать за края"
        ]
    },

    size: "L",

    // Портретная ориентация: USB сверху, 20 пинов слева (1-20 сверху вниз),
    // 20 пинов справа (40-21 сверху вниз)
    bbox: { x: 0, y: 0, w: 140, h: 340 },

    // === ПИНЫ (все 40 + 3 SWD снизу) ===
    // Шаг пинов 14.7px. Первый на y=35, последний на y=314.
    pins: (function() {
        const p = {};
        const pitch = 14.7;
        const topY = 35;
        const xL = 5;   // левый край
        const xR = 135; // правый край

        // ЛЕВЫЙ РЯД (пины 1-20, сверху вниз)
        const leftPins = [
            "gp0", "gp1", "gnd_3", "gp2", "gp3", "gp4", "gp5", "gnd_8",
            "gp6", "gp7", "gp8", "gp9", "gnd_13", "gp10", "gp11", "gp12",
            "gp13", "gnd_18", "gp14", "gp15"
        ];
        const leftLabels = [
            "GP0", "GP1", "GND", "GP2", "GP3", "GP4", "GP5", "GND",
            "GP6", "GP7", "GP8", "GP9", "GND", "GP10", "GP11", "GP12",
            "GP13", "GND", "GP14", "GP15"
        ];

        // ПРАВЫЙ РЯД (пины 40..21, сверху вниз → пин 40 сверху, пин 21 снизу)
        const rightPins = [
            "vbus", "vsys", "gnd_38", "en", "v3v3_out", "vref",
            "gp28", "agnd", "gp27", "gp26", "run", "gp22",
            "gnd_28", "gp21", "gp20", "gp19", "gp18", "gnd_23",
            "gp17", "gp16"
        ];
        const rightLabels = [
            "VBUS", "VSYS", "GND", "3V3_EN", "3V3", "VREF",
            "GP28", "AGND", "GP27", "GP26", "RUN", "GP22",
            "GND", "GP21", "GP20", "GP19", "GP18", "GND",
            "GP17", "GP16"
        ];

        for (let i = 0; i < 20; i++) {
            const y = topY + i * pitch;
            p[leftPins[i]]  = { x: xL, y: Math.round(y), side: "left",  label: leftLabels[i],  pin_num: i + 1 };
            p[rightPins[i]] = { x: xR, y: Math.round(y), side: "right", label: rightLabels[i], pin_num: 40 - i };
        }

        // Типы пинов (нейтральная метаинформация для wire router, без цветов)
        p.v3v3_out.type = "power"; p.v3v3_out.voltage = 3.3;
        p.vbus.type     = "power"; p.vbus.voltage = 5.0;
        p.vsys.type     = "power";
        p.en.type       = "control";
        p.run.type      = "control";
        p.vref.type     = "ref";

        // GND пины
        ["gnd_3", "gnd_8", "gnd_13", "gnd_18", "gnd_23", "gnd_28", "gnd_38", "agnd"].forEach(k => {
            p[k].type = "ground";
        });

        // ADC пины (могут работать как цифровые GPIO тоже)
        ["gp26", "gp27", "gp28"].forEach(k => p[k].type = "adc");

        // Все GP пины без специальной роли — digital gpio
        for (let i = 0; i <= 22; i++) {
            if (p["gp" + i] && !p["gp" + i].type) p["gp" + i].type = "gpio";
        }

        return p;
    })(),

    // === ANCHORS (визуальные опорные точки для callouts) ===
    anchors: {
        "usb":     { x: 70,  y: 0   },   // USB Micro-B сверху
        "chip":    { x: 70,  y: 170 },   // RP2040 центр
        "led":     { x: 25,  y: 83  },   // бортовой LED (GP25)
        "bootsel": { x: 117, y: 85  },   // кнопка BOOTSEL
        "flash":   { x: 70,  y: 214 },   // W25Q16 флеш
        "swd":     { x: 70,  y: 325 }    // SWD панель снизу
    },

    renderSVG: function(origin) {
        const ox = origin?.x ?? this.bbox.x;
        const oy = origin?.y ?? this.bbox.y;
        const w = this.bbox.w;
        const h = this.bbox.h;

        // Генерируем 40 пинов + их подписи (нейтральный стиль, одинаковый для всех)
        let pinsSvg = '';
        Object.entries(this.pins).forEach(([key, pin]) => {
            const cx = ox + pin.x;
            const cy = oy + pin.y;

            // Медный пад (золотой, одинаковый для всех)
            pinsSvg += `<circle cx="${cx}" cy="${cy}" r="3" fill="#D4A017" stroke="#8B6F18" stroke-width="0.8"/>`;

            // Номер пина (1-40) внутри платы, silkscreen
            const numX = pin.side === "left" ? cx + 8 : cx - 8;
            const numAnchor = pin.side === "left" ? "start" : "end";
            pinsSvg += `<text x="${numX}" y="${cy + 2}" text-anchor="${numAnchor}" fill="#a8c5e0" font-size="5" font-family="monospace">${pin.pin_num}</text>`;

            // Подпись пина снаружи платы (одинаковый цвет и размер)
            const lblX = pin.side === "left" ? cx - 7 : cx + 7;
            const lblAnchor = pin.side === "left" ? "end" : "start";
            pinsSvg += `<text x="${lblX}" y="${cy + 3}" text-anchor="${lblAnchor}" fill="#1e2a4a" font-size="7" font-weight="500" font-family="sans-serif">${pin.label}</text>`;
        });

        return `
        <g id="comp-raspberry_pi_pico" class="component" data-component="raspberry_pi_pico">

            <!-- PCB (тёмно-зелёный, фирменный Pi) -->
            <rect x="${ox}" y="${oy}" width="${w}" height="${h}" rx="12" ry="12"
                  fill="#0F6B48" stroke="#083523" stroke-width="1.5"/>

            <!-- Декоративный внутренний контур -->
            <rect x="${ox+4}" y="${oy+4}" width="${w-8}" height="${h-8}" rx="9"
                  fill="none" stroke="#1B8A60" stroke-width="0.5" opacity="0.4"/>

            <!-- ============ USB MICRO-B (сверху) ============ -->
            <rect x="${ox + w/2 - 18}" y="${oy - 8}" width="36" height="18" rx="2"
                  fill="url(#picoUsbGrad)" stroke="#666" stroke-width="0.8"/>
            <rect x="${ox + w/2 - 12}" y="${oy - 4}" width="24" height="10" rx="1"
                  fill="#1A1A1A"/>
            <defs>
                <linearGradient id="picoUsbGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#F0F0F0"/>
                    <stop offset="0.5" stop-color="#B0B0B0"/>
                    <stop offset="1" stop-color="#808080"/>
                </linearGradient>
            </defs>
            <text x="${ox + w/2}" y="${oy + 22}" text-anchor="middle" fill="#a8c5e0" font-size="5">USB</text>

            <!-- ============ ЧИП RP2040 (центр) ============ -->
            <rect x="${ox + w/2 - 22}" y="${oy + h/2 - 22}" width="44" height="44" rx="2"
                  fill="#1A1A1A" stroke="#333" stroke-width="1"/>
            <!-- Метка pin1 (точка в углу) -->
            <circle cx="${ox + w/2 - 17}" cy="${oy + h/2 - 17}" r="1.2" fill="#888"/>
            <!-- Надпись чипа -->
            <text x="${ox + w/2}" y="${oy + h/2 - 2}" text-anchor="middle" fill="#A0A0A0"
                  font-family="monospace" font-size="6" font-weight="700">RP2040</text>
            <text x="${ox + w/2}" y="${oy + h/2 + 7}" text-anchor="middle" fill="#707070"
                  font-family="monospace" font-size="4">Dual M0+ · 133MHz</text>
            <text x="${ox + w/2}" y="${oy + h/2 + 15}" text-anchor="middle" fill="#606060"
                  font-family="monospace" font-size="3.5">264KB RAM</text>

            <!-- ============ FLASH (W25Q16JV) рядом с RP2040 ============ -->
            <rect x="${ox + w/2 - 14}" y="${oy + h/2 + 35}" width="28" height="14" rx="1"
                  fill="#1A1A1A" stroke="#333" stroke-width="0.5"/>
            <text x="${ox + w/2}" y="${oy + h/2 + 44}" text-anchor="middle" fill="#777"
                  font-family="monospace" font-size="4">W25Q16 · 2MB</text>

            <!-- ============ КРИСТАЛЛ (crystal oscillator) ============ -->
            <rect x="${ox + w/2 + 18}" y="${oy + h/2 - 5}" width="12" height="8" rx="1"
                  fill="#C0C0C0" stroke="#888" stroke-width="0.5"/>

            <!-- ============ БОРТОВОЙ LED (GP25, зелёный) ============ -->
            <g>
                <rect x="${ox + 20}" y="${oy + 80}" width="10" height="6" rx="1"
                      fill="#FFF8B0" stroke="#999" stroke-width="0.5"/>
                <circle cx="${ox + 25}" cy="${oy + 83}" r="2" fill="#6FAE5A"/>
                <text x="${ox + 37}" y="${oy + 85}" fill="#a8c5e0" font-size="4">LED·GP25</text>
            </g>

            <!-- ============ BOOTSEL КНОПКА ============ -->
            <g>
                <rect x="${ox + w - 30}" y="${oy + 80}" width="14" height="10" rx="1"
                      fill="#F5F5F5" stroke="#AAA" stroke-width="0.6"/>
                <circle cx="${ox + w - 23}" cy="${oy + 85}" r="3" fill="#D4A017" stroke="#8B6F18" stroke-width="0.5"/>
                <text x="${ox + w - 23}" y="${oy + 100}" text-anchor="middle" fill="#a8c5e0" font-size="4">BOOTSEL</text>
            </g>

            <!-- ============ 40 ПИНОВ ============ -->
            ${pinsSvg}

            <!-- ============ SWD (отладочные) — 3 пина снизу ============ -->
            <g>
                <circle cx="${ox + w/2 - 10}" cy="${oy + h - 15}" r="2" fill="#D4A017" stroke="#8B6F18" stroke-width="0.5"/>
                <circle cx="${ox + w/2}"      cy="${oy + h - 15}" r="2" fill="#D4A017" stroke="#8B6F18" stroke-width="0.5"/>
                <circle cx="${ox + w/2 + 10}" cy="${oy + h - 15}" r="2" fill="#D4A017" stroke="#8B6F18" stroke-width="0.5"/>
                <text x="${ox + w/2 - 10}" y="${oy + h - 5}" text-anchor="middle" fill="#a8c5e0" font-size="3.5">SWCLK</text>
                <text x="${ox + w/2}"      y="${oy + h - 5}" text-anchor="middle" fill="#a8c5e0" font-size="3.5">GND</text>
                <text x="${ox + w/2 + 10}" y="${oy + h - 5}" text-anchor="middle" fill="#a8c5e0" font-size="3.5">SWDIO</text>
            </g>

            <!-- ============ Надпись модуля внизу под платой ============ -->
            <text x="${ox + w/2}" y="${oy + h + 16}" text-anchor="middle"
                  fill="#555" font-size="12" font-weight="600">
                Raspberry Pi Pico · RP2040
            </text>
            <text x="${ox + w/2}" y="${oy + h + 28}" text-anchor="middle"
                  fill="#86868b" font-size="10">
                51 × 21 мм · 40 пинов
            </text>
        </g>`;
    }
};


// ─────────────────────────────────────────────
// COMPONENT: Digital Multimeter UNI-T UT33C+
// ─────────────────────────────────────────────
COMPONENT_LIBRARY["multimeter_ut33c_plus"] = {

    info: {
        name_en: "Digital Pocket Multimeter UNI-T UT33C+",
        name_ru: "Цифровой карманный мультиметр UNI-T UT33C+",
        model: "UT33C+",
        manufacturer: "UNI-Trend Technology",
        aliexpress: "https://aliexpress.ru/item/ut33c-plus.html",
        price_usd: 14.00,
        description: "Карманный цифровой мультиметр. Измеряет постоянное/переменное напряжение, сопротивление, ток, температуру, проверяет диоды и целостность цепи (прозвонка).",
        specs: {
            display: "LCD 3½ digits (1999 counts, back-lit)",
            dc_voltage: "200mV / 2V / 20V / 200V / 600V (±0.5%)",
            ac_voltage: "200V / 600V (±1%)",
            dc_current: "200µA / 2mA / 20mA / 10A (fused)",
            resistance: "200Ω / 2kΩ / 20kΩ / 200kΩ / 2MΩ / 20MΩ",
            continuity: "Buzzer on <50Ω",
            diode_test: "Forward voltage drop display",
            temperature: "−40°C to +1000°C (with K-type probe)",
            input_impedance: "10 MΩ",
            auto_power_off: "15 минут (APO)",
            features: ["HOLD/SEL", "Back-light", "Low-battery indicator"],
            power: "2 × AAA (1.5V)",
            size: "126 × 70 × 28 мм",
            fuses: "10A jack: 250V/10sec · VΩmA jack: 200mA CAT II 600V"
        },
        safety: [
            "Не измерять ток без соответствующего режима — можно спалить предохранитель или повредить прибор",
            "Красный щуп в VΩmA для напряжения и сопротивления, в 10A только для больших токов",
            "Не подавать напряжение выше 600V AC/DC",
            "Для режима прозвонки (🔊) цепь должна быть обесточена",
            "Перед переключением диапазонов — ОТСОЕДИНИТЬ щупы от цепи"
        ]
    },

    size: "M",

    // Портретная ориентация (~70×126мм с пропорциональным скейлом)
    bbox: { x: 0, y: 0, w: 200, h: 340 },

    // Три гнезда снизу прибора. Щупы выходят "вверх" (side:"top")
    // в схемах измерения где мультиметр снизу, а прибор сверху.
    pins: {
        "jack_10A":  { x: 50,  y: 310, side: "top", color: "#EF4444", label: "10A",   type: "input", rating: "10A DC, fused" },
        "jack_com":  { x: 100, y: 310, side: "top", color: "#1d1d1f", label: "COM",   type: "input", rating: "Common (black probe)" },
        "jack_vma":  { x: 150, y: 310, side: "top", color: "#EF4444", label: "VΩmA", type: "input", rating: "V/Ω/mA/μA (red probe)" }
    },

    // Якорные точки для выносок/подсветки внутренних элементов.
    // Используются вместо хардкода координат в circuit-HTML.
    anchors: {
        "logo":         { x: 22,  y: 35  },   // UNI-T
        "model":        { x: 178, y: 35  },   // UT33C+
        "screen":       { x: 100, y: 75  },   // центр LCD (цифры 1999)
        "hold_button":  { x: 44,  y: 124 },   // оранжевая HOLD/SEL
        "light_button": { x: 167, y: 124 },   // синяя подсветка
        "dial_center":  { x: 100, y: 200 },   // центр крутилки
        "dial_pointer": { x: 146, y: 200 },   // куда сейчас указывает стрелка (V=)
        "dial_off":     { x: 100, y: 138 },   // позиция OFF (12 часов)
        "dial_ohm":     { x: 54,  y: 200 },   // позиция Ω (9 часов)
        "dial_amp":     { x: 100, y: 262 },   // позиция A (6 часов)
        "jack_10A":     { x: 50,  y: 310 },   // (дублирует pin, для удобства выносок)
        "jack_com":     { x: 100, y: 310 },
        "jack_vma":     { x: 150, y: 310 }
    },

    renderSVG: function(origin) {
        const ox = origin?.x ?? this.bbox.x;
        const oy = origin?.y ?? this.bbox.y;
        const w = this.bbox.w;
        const h = this.bbox.h;

        // Положение поворотного переключателя
        const dialCx = ox + w/2;
        const dialCy = oy + 200;
        const dialR = 62;

        // Метки по окружности. Угол считаем от 12 часов (−90°), по часовой стрелке.
        // angle в градусах, label — подпись в том положении.
        const dialLabels = [
            { a: 0,    label: "OFF",    fs: 8, col: "#EFEFEF", bold: true },
            { a: 30,   label: "200m",  fs: 6, col: "#FDE68A" },
            { a: 55,   label: "2000m", fs: 6, col: "#FDE68A" },
            { a: 80,   label: "20",     fs: 7, col: "#FDE68A" },
            { a: 100,  label: "200",    fs: 7, col: "#FDE68A" },
            { a: 120,  label: "600",    fs: 7, col: "#FDE68A" },
            { a: 140,  label: "V~",     fs: 8, col: "#A78BFA", bold: true },
            { a: 160,  label: "200",    fs: 7, col: "#FDE68A" },
            { a: 180,  label: "°C",     fs: 7, col: "#FB923C" },
            { a: 200,  label: "°F",     fs: 7, col: "#FB923C" },
            { a: 220,  label: "10A",    fs: 7, col: "#EF4444" },
            { a: 240,  label: "20m",    fs: 6, col: "#EF4444" },
            { a: 258,  label: "2000μ",  fs: 6, col: "#EF4444" },
            { a: 275,  label: "🔊",     fs: 10, col: "#34D399" },
            { a: 290,  label: "200",    fs: 6, col: "#9CA3AF" },
            { a: 305,  label: "2000",   fs: 6, col: "#9CA3AF" },
            { a: 320,  label: "20k",    fs: 6, col: "#9CA3AF" },
            { a: 340,  label: "Ω",      fs: 10, col: "#9CA3AF", bold: true }
        ];

        let dialMarks = '';
        let dialText = '';
        dialLabels.forEach(m => {
            const rad = (m.a - 90) * Math.PI / 180;
            // Тик-метка на окружности
            const x1 = dialCx + (dialR - 2) * Math.cos(rad);
            const y1 = dialCy + (dialR - 2) * Math.sin(rad);
            const x2 = dialCx + (dialR + 2) * Math.cos(rad);
            const y2 = dialCy + (dialR + 2) * Math.sin(rad);
            dialMarks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#F3F4F6" stroke-width="1" opacity="0.6"/>`;

            // Подпись за пределами окружности
            const tx = dialCx + (dialR + 10) * Math.cos(rad);
            const ty = dialCy + (dialR + 10) * Math.sin(rad);
            dialText += `<text x="${tx.toFixed(1)}" y="${(ty + m.fs/3).toFixed(1)}" text-anchor="middle" fill="${m.col}" font-size="${m.fs}" font-weight="${m.bold ? 700 : 500}" font-family="sans-serif">${m.label}</text>`;
        });

        // Указатель стрелки — направлен на V= (110° по часовой от 12)
        const pointerAngle = 110;
        const pRad = (pointerAngle - 90) * Math.PI / 180;
        const px = dialCx + (dialR - 8) * Math.cos(pRad);
        const py = dialCy + (dialR - 8) * Math.sin(pRad);

        // Подпись V= (DC) отдельно — центральный активный режим
        const vdcMarker = `
            <g transform="translate(${dialCx + 45}, ${dialCy - 28})">
                <text text-anchor="end" fill="#FCD34D" font-size="11" font-weight="800" font-family="monospace">V<tspan dy="-3" font-size="8">=</tspan></text>
            </g>
        `;

        return `
        <g id="comp-multimeter_ut33c_plus" class="component" data-component="multimeter_ut33c_plus">

            <!-- Внешний красный корпус -->
            <rect x="${ox}" y="${oy}" width="${w}" height="${h}" rx="16" ry="16"
                  fill="#C62828" stroke="#7F1A1A" stroke-width="2"/>

            <!-- Чёрная передняя панель -->
            <rect x="${ox+10}" y="${oy+10}" width="${w-20}" height="${h-20}" rx="10"
                  fill="#1A1A1A" stroke="#000" stroke-width="1"/>

            <!-- Логотип UNI-T -->
            <text x="${ox+22}" y="${oy+35}" fill="#fff" font-family="sans-serif"
                  font-size="13" font-weight="800" font-style="italic">UNI-T</text>

            <!-- Модель UT33C+ -->
            <text x="${ox + w - 22}" y="${oy+35}" text-anchor="end" fill="#fff"
                  font-family="sans-serif" font-size="11" font-weight="700">UT33C+</text>

            <!-- LCD экран -->
            <rect x="${ox+22}" y="${oy+45}" width="${w-44}" height="60" rx="4"
                  fill="#B8D4A8" stroke="#5A7A5A" stroke-width="1.5"/>
            <!-- Digital "1999" (демо-показание) -->
            <text x="${ox + w - 30}" y="${oy+90}" text-anchor="end" fill="#1A3A1A"
                  font-family="monospace" font-size="30" font-weight="900"
                  font-style="italic">1999</text>
            <!-- Индикаторы на экране -->
            <text x="${ox+30}" y="${oy+60}" fill="#1A3A1A" font-family="monospace"
                  font-size="7" font-weight="600">APO</text>
            <text x="${ox+30}" y="${oy+75}" fill="#1A3A1A" font-family="monospace"
                  font-size="9" font-weight="700">DC</text>
            <text x="${ox+64}" y="${oy+57}" fill="#1A3A1A" font-family="monospace"
                  font-size="7">mA</text>

            <!-- Кнопки под экраном -->
            <!-- HOLD/SEL (оранжевая) -->
            <rect x="${ox+22}" y="${oy+115}" width="44" height="18" rx="3"
                  fill="#F59E0B" stroke="#B45309" stroke-width="1"/>
            <text x="${ox+44}" y="${oy+127}" text-anchor="middle" fill="#fff"
                  font-size="8" font-weight="700">HOLD/SEL</text>

            <!-- Подсветка (синяя) -->
            <rect x="${ox + w - 44}" y="${oy+115}" width="22" height="18" rx="3"
                  fill="#60A5FA" stroke="#1E40AF" stroke-width="1"/>
            <text x="${ox + w - 33}" y="${oy+127}" text-anchor="middle" fill="#fff"
                  font-size="10">☀</text>

            <!-- Надпись рядом с HOLD/SEL -->
            <text x="${ox+44}" y="${oy+145}" text-anchor="middle" fill="#9CA3AF"
                  font-size="6">HOLD/SEL</text>

            <!-- Поворотный переключатель: внешнее кольцо -->
            <circle cx="${dialCx}" cy="${dialCy}" r="${dialR + 14}"
                    fill="none" stroke="#333" stroke-width="0.5" opacity="0.4"/>
            <circle cx="${dialCx}" cy="${dialCy}" r="${dialR}"
                    fill="#0F0F0F" stroke="#444" stroke-width="1"/>

            <!-- Тики и подписи -->
            ${dialMarks}
            ${dialText}
            ${vdcMarker}

            <!-- Ручка переключателя (центральный чёрный диск) -->
            <circle cx="${dialCx}" cy="${dialCy}" r="30" fill="#1A1A1A" stroke="#333" stroke-width="1"/>
            <circle cx="${dialCx}" cy="${dialCy}" r="26" fill="#0A0A0A" stroke="#222" stroke-width="0.5"/>
            <!-- Указатель-стрелка -->
            <polygon points="${dialCx-3},${dialCy-26} ${dialCx+3},${dialCy-26} ${dialCx},${dialCy-40}"
                     fill="#EFEFEF" stroke="#888" stroke-width="0.5"
                     transform="rotate(${pointerAngle}, ${dialCx}, ${dialCy})"/>
            <circle cx="${dialCx}" cy="${dialCy}" r="3" fill="#333" stroke="#666"/>

            <!-- Три гнезда снизу -->
            <!-- 10A (слева, красный) -->
            <g>
                <circle cx="${ox+50}" cy="${oy+310}" r="11" fill="none" stroke="#EF4444" stroke-width="2.5"/>
                <circle cx="${ox+50}" cy="${oy+310}" r="6" fill="#1A1A1A" stroke="#666" stroke-width="1"/>
                <circle cx="${ox+50}" cy="${oy+310}" r="3" fill="#000"/>
                <text x="${ox+50}" y="${oy+290}" text-anchor="middle" fill="#EF4444"
                      font-size="9" font-weight="700">10A<tspan font-size="6">MAX</tspan></text>
                <text x="${ox+50}" y="${oy+328}" text-anchor="middle" fill="#9CA3AF" font-size="5">FUSED 250V</text>
                <text x="${ox+50}" y="${oy+335}" text-anchor="middle" fill="#9CA3AF" font-size="5">10 sec Max</text>
            </g>

            <!-- COM (центр, чёрный) -->
            <g>
                <circle cx="${ox+100}" cy="${oy+310}" r="11" fill="none" stroke="#E5E7EB" stroke-width="2.5"/>
                <circle cx="${ox+100}" cy="${oy+310}" r="6" fill="#1A1A1A" stroke="#666" stroke-width="1"/>
                <circle cx="${ox+100}" cy="${oy+310}" r="3" fill="#000"/>
                <text x="${ox+100}" y="${oy+290}" text-anchor="middle" fill="#fff"
                      font-size="10" font-weight="700">COM</text>
            </g>

            <!-- VΩmA (справа, красный) -->
            <g>
                <circle cx="${ox+150}" cy="${oy+310}" r="11" fill="none" stroke="#EF4444" stroke-width="2.5"/>
                <circle cx="${ox+150}" cy="${oy+310}" r="6" fill="#1A1A1A" stroke="#666" stroke-width="1"/>
                <circle cx="${ox+150}" cy="${oy+310}" r="3" fill="#000"/>
                <text x="${ox+150}" y="${oy+285}" text-anchor="middle" fill="#EF4444"
                      font-size="7" font-weight="700">✲·Ω·°F°C</text>
                <text x="${ox+150}" y="${oy+295}" text-anchor="middle" fill="#EF4444"
                      font-size="9" font-weight="700">VmAμA</text>
                <text x="${ox+150}" y="${oy+328}" text-anchor="middle" fill="#9CA3AF" font-size="5">FUSED 200mA</text>
                <text x="${ox+150}" y="${oy+335}" text-anchor="middle" fill="#9CA3AF" font-size="5">CAT II 600V</text>
            </g>

            <!-- Подпись модуля -->
            <text x="${ox + w/2}" y="${oy + h + 18}" text-anchor="middle"
                  fill="#555" font-size="12" font-weight="600">
                Мультиметр UNI-T UT33C+
            </text>
        </g>`;
    }
};


// ============================================
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COMPONENT_LIBRARY, SIZE_GRID, WIRE_COLORS, EXIT_OFFSET, WIRE_SPACING };
}
