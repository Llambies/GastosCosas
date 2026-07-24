# GastoCosas

Gestor de gastos local-first para Android (Tauri 2 + React/TypeScript/Vite).

## Características

- CRUD de gastos (suscripciones y pagos fijos) con icono, color y etiquetas
- **Gastado** y **Previsto** prorrateados por días del mes
- Cancelación efectiva al final del ciclo, con deshacer
- Pill de ciclo de renovación / fin
- SQLite local + avisos nativos programados
- UI en español, sin red, cuenta ni telemetría

## Requisitos

- Node.js 20+
- Rust (stable)
- Para Android: Android Studio / SDK / NDK / JDK 17+
- Linux desktop (opcional): `webkit2gtk` y `librsvg2` para `tauri dev`

## Desarrollo

```bash
npm install
npm run test
npm run typecheck
npm run dev          # UI web (SQLite en memoria de respaldo)
npm run tauri dev    # escritorio con plugins nativos
npm run tauri android init
npm run tauri android dev
```

Package id: `com.adrian.gastocosas`

## Canales de notificación Android

- `gastos-proximos` — próximos cobros
- `suscripciones-fin` — caducidad / fin de ciclo
