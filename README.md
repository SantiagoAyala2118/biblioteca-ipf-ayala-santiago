# Biblioteca IPF

App integradora del Taller Complementario React Native II (TP 4). Los alumnos consultan el catalogo,
reservan libros y reciben un recordatorio antes de devolverlos; el personal entrega los libros respetando
el orden de las reservas.

- Alumno: Santiago Ayala
- SDK de Expo: **58** (`expo ~58.0.26`, `expo-router ~58.0.32`, `react-native 0.88.1`, React 19.3)
- Proyecto creado con `npx create-expo-app@latest` (TypeScript + Expo Router). Paquetes instalados con `npx expo install`.

## Como ejecutarlo

```bash
npm install
npx expo start        # escanear el QR con Expo Go (Android o iOS)
```

Otros comandos:

```bash
npm test              # tests de Pila, Cola y reglas de negocio (jest-expo)
npx expo lint         # lint
npx tsc --noEmit      # chequeo de tipos
npx expo start --web  # version web (solo para revisar navegacion y estados; sin camara)
```

Credenciales del personal (fijas en `src/constants/app.ts`): usuario `biblioteca`, clave `ipf2026`.
La persona usuaria de la app es `Santiago` (`USUARIO_ACTUAL`).

## Rutas (`src/app`)

```
src/app/
|-- _layout.tsx                 Stack raiz (provee el Context; Stack.Protected; anchor '(tabs)')
|-- (tabs)/
|   |-- _layout.tsx             Tabs (Tabs de expo-router + Ionicons)
|   |-- (catalogo)/
|   |   |-- _layout.tsx         Stack propio de la tab Catalogo (anchor 'index', link "Personal")
|   |   |-- index.tsx           /                 Catalogo
|   |   `-- libro/[isbn].tsx    /libro/[isbn]     Detalle
|   `-- reservas.tsx            /reservas         Mis reservas
|-- buscar.tsx                  /buscar?q=        Buscador (Stack raiz)
|-- escanear.tsx                /escanear         Escaner (Stack raiz)
|-- reservar/[isbn].tsx         /reservar/[isbn]  Confirmacion (modal)
|-- permisos/[recurso].tsx      /permisos/[recurso] Pantalla previa (modal)
|-- login.tsx                   /login            Solo sin sesion (modal, Stack.Protected)
|-- mostrador.tsx               /mostrador        Solo con sesion (Stack.Protected)
|-- reserva.tsx                 /reserva          <Redirect href="/reservas" />
`-- +not-found.tsx              cualquier otra    404 con la URL inexistente
```

## Estructura del resto de `src`

| Carpeta | Contenido |
|---|---|
| `components/` | Componentes presentacionales, uno por archivo (botones, tarjetas, estados de pantalla) |
| `hooks/` | `useLibros`, `useBusqueda` (`useSearch.ts`), `usePermiso` (`usePermission.ts`) |
| `lib/` | `api.ts` (entregado), reglas de negocio puras (`library.ts`), catalogo, fechas, permisos, notificaciones |
| `context/` | Estado global: prestamos, listas de espera, recientes, sesion y avisos |
| `estructuras/` | Clases `Pila` y `Cola` con `#items`, `tamanio` y `aArray()` |
| `data/` | `libros.ts` (15 libros y listas de espera iniciales) |
| `types/` | Tipos de dominio |
| `constants/` | `tema.ts` (paleta, espaciados, tamanios), constantes de la app y de navegacion |

Regla de dependencias: `app -> components / hooks / context -> lib -> estructuras / data / types / constants`.
Ningun archivo fuera de `src/app` importa desde `src/app`.

## Plugins de `app.json`

```jsonc
"plugins": [
  // Rutas basadas en archivos.
  "expo-router",
  // Splash con el fondo de la paleta.
  ["expo-splash-screen", { "backgroundColor": "#1B1B1B", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
  ["expo-camera", {
    // Texto de proposito con el molde "Usamos tu [dato] para [beneficio concreto]".
    "cameraPermission": "Usamos tu camara para leer el codigo de barras del libro y abrir su ficha al instante",
    // Minimo privilegio: el escaner no graba video, asi que no se pide microfono.
    "microphonePermission": false,
    "recordAudioAndroid": false,
    // Lector de codigos de barras habilitado (EAN-13).
    "barcodeScannerEnabled": true
  }],
  // Notificaciones locales; color de acento en Android.
  ["expo-notifications", { "color": "#FC6E20" }]
]
```

## Permisos

| Recurso | Modulo | Cuando se pide | Alternativa si se niega |
|---|---|---|---|
| Camara | `expo-camera` (`useCameraPermissions`) | Al tocar "Activar camara" en `/escanear`, despues de la pantalla previa `/permisos/camara` | Escribir el ISBN a mano en la misma pantalla |
| Notificaciones | `expo-notifications` | Solo al activar "Recordarme" en un prestamo, despues de `/permisos/notificaciones` (el canal `prestamos` se crea antes de pedir) | Los avisos aparecen dentro de la app, en `/reservas` |

La app no usa `expo-permissions`, `expo-location` ni `expo-image-picker`.

### `blockedPermissions` (Android)

| Permiso bloqueado | Por que |
|---|---|
| `RECORD_AUDIO` | La camara solo lee codigos de barras; nunca graba video con audio. |
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | La app no necesita saber donde esta la persona. |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | No se leen ni guardan archivos o fotos. |
| `SYSTEM_ALERT_WINDOW` | La app no dibuja sobre otras apps. |

Verificado con `npx expo config --type introspect`: el manifest final declara `CAMERA` y marca los permisos anteriores con `tools:node="remove"`.

## Deep links de prueba

Con la app compilada se usa el esquema `bibliotecaipf://`. En Expo Go se usa `exp://IP:8081/--/` + la ruta.

| Link | Que deberia pasar |
|---|---|
| `bibliotecaipf://libro/9789507001017` | Detalle de "Ficciones", con el Catalogo debajo |
| `bibliotecaipf://libro/123` | Mensaje "No es un ISBN valido" con boton al Catalogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con los libros de Borges y las tabs debajo |
| `bibliotecaipf://mostrador` (sin sesion) | Redirige al Catalogo (Stack.Protected) |
| `bibliotecaipf://reserva` | Redirige a `/reservas` |
| `bibliotecaipf://escanear` (camara bloqueada) | Escaner con aviso y el ingreso manual del ISBN |

## Decisiones de diseno

- **Pila y Cola sin mutar el estado:** cada accion crea una instancia nueva desde `aArray()` (`src/lib/library.ts`) y el Context la guarda con `setState`.
- **Ejemplares disponibles calculados**, no guardados: `calcularDisponibles(libro, prestamos)`.
- **Buscador sin carreras:** el efecto de `useBusqueda` espera 300 ms (debounce) y en la limpieza cancela el temporizador y descarta la respuesta vieja.
- **SOLID:** cada archivo con una responsabilidad (S); los recursos de permiso se describen en `RECURSOS_PERMISO` (O); `Pila` y `Cola` cumplen `EstructuraLineal<T>` (L); componentes con props minimas (I); las pantallas dependen de hooks y de `lib`, nunca de `expo-notifications` ni de la API directamente (D).
- **Diseno visual:** tema oscuro con la paleta `#1B1B1B`, `#323232`, `#FFE7D0` y `#FC6E20`. Todos los textos superan el contraste 4.5:1; los botones naranjas usan texto oscuro.
- **Proceso:** desarrollo guiado por especificaciones y verificacion de resultados (SDD + ODD). Ver `docs/sdd/`.

## Calidad

Salida al cierre del desarrollo:

```text
$ npx expo lint
(sin errores ni advertencias)

$ npx tsc --noEmit
(sin errores)

$ npm test
Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total

$ npx expo-doctor
20/20 checks passed. No issues detected!
```
