# GastoCosas Design System

## North star
Cuaderno de caja: superficie clara de trabajo, tipografía sobria, acento de tinta óxido solo donde hay acción o dinero. Nada de neón ni “dashboard SaaS”.

## Mode
Operate

## Color
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#E7ECF0` | App wash (cool paper, no cream) |
| `--surface` | `#F7F9FA` | Content plane |
| `--ink` | `#14201C` | Primary text (green-black) |
| `--ink-muted` | `#3F534C` | Secondary text (tinted from ink) |
| `--line` | `#C5D0D6` | Hairline rules |
| `--accent` | `#B83218` | Primary actions, money emphasis |
| `--accent-soft` | `#F4E4DF` | Selected / soft accent wash |
| `--ok` | `#1F6B4A` | Positive / renewing |
| `--warn` | `#9A5B14` | Ending soon |
| `--danger` | `#A11C2E` | Destructive |

## Typography
- Family: **IBM Plex Sans** (single family for product UI)
- Scale (rem): 0.75 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25
- Amounts: `font-variant-numeric: tabular-nums`
- Brand wordmark: 1.75rem / 650 weight, no italic serif

## Layout
- Max content width 480px
- Lists with hairline dividers — not card stacks
- Metrics as typography split by a rule, not twin cards
- Spacing: tight within rows (8–12), generous between sections (28–36)
- Corner radius: 6–10px (no pill-full except true toggle tracks if needed)

## Motion
- 160–220ms ease-out cubic `[0.22, 1, 0.36, 1]`
- No spring bounce, no pulsing markers
- Motion only for state (amount count-up, route fade)

## Components
- Primary button: solid `--accent` on light text
- Secondary: surface + line border
- Icon button: 44px hit target, line border, no soft glow
- FAB: solid accent square-ish (10px radius)
- Chips: 6px radius, tinted fill, no 999px pills
- Progress: flat track + solid fill, static marker

## Android chrome
Status / nav bar: `#E7ECF0`, light icons (`windowLightStatusBar=true`)
