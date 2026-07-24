# Requisitos del entorno

## Verificado en este entorno

| Herramienta | Estado |
|-------------|--------|
| Node.js 22 | OK |
| npm | OK |
| Rust stable | OK (`rustup` → stable) |
| JDK 21 | OK |
| webkit2gtk / GTK | OK (desktop `cargo check`) |
| Android SDK + NDK 27 | OK (`ANDROID_HOME`) |
| `tauri android init` | OK |
| APK debug universal | OK (`app-universal-debug.apk`) |

## Pendiente fuera de este entorno

| Ítem | Notas |
|------|-------|
| Emulador / dispositivo físico | Smoke test interactivo (CRUD, avisos con app cerrada) |
| Iconos mipmap personalizados | Usa los generados por el scaffold; se pueden regenerar con `tauri icon` |

## Comandos

```bash
export ANDROID_HOME=~/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/27.0.12077973

npm install
npm run test
npm run typecheck
npm run build
npm run tauri android dev    # emulador/dispositivo
npm run tauri android build  # APK/AAB
```

Package id: `com.adrian.gastocosas`
