# Tareas - Biblioteca IPF

Cada tarea indica la spec que implementa, el output que produce, la validacion que la cierra y la evidencia observada.
Toda tarea suma [T] + [L] desde T03. Ruta de implementacion: inline en todas (sin escritores delegados).

| ID | Tarea | Spec | Output | Validacion | Estado |
|---|---|---|---|---|---|
| T01 | Artefactos SDD | todas | `docs/sdd/*` | [C] consistencia | hecha |
| T02 | Limpiar template y dependencias | S01 | `src` minimo, package.json limpio | [C] doctor + grep, [W] abre | hecha |
| T03 | Instalar modulos, lint y tests | S01, S23 | camera, notifications, vector-icons, jest-expo, eslint | [C] versiones, [L] corre | hecha |
| T04 | Configurar app.json | S02, S27 | scheme, plugins, blockedPermissions, tema oscuro | [C] config public + introspect | hecha |
| T05 | Tipos y API literal | S03 | `types/index.ts`, `lib/api.ts` | [C] diff con consigna, [T] | hecha |
| T06 | Datos del catalogo | S04 | `data/libros.ts` | [U] test de datos | hecha (ISBN reales pendientes) |
| T07 | Clases Pila y Cola | S05, S23, S26 | `estructuras/*` + tests | [U] >= 6 casos + contrato, [C] sin shift | hecha |
| T08 | Tema y constantes | S06, S27 | `constants/tema.ts`, `constants/app.ts` | [T], [C] contraste | hecha |
| T09 | Logica pura | S07, S12, S14, S15, S21 | `lib/catalog.ts`, `dates.ts`, `library.ts` + tests | [U] escenarios OK/ERR | hecha |
| T10 | Context de biblioteca | S07 | `context/LibraryContext.tsx` | [T], [C] sin mutacion | hecha |
| T11 | Componentes base de UI | S22, S27 | botones, estados, tarjetas, titulos | [C] a11y y estilos | hecha |
| T12 | Layouts, tabs, protected, modales | S08 | `_layout.tsx` x3 | [W] URLs de A1 | hecha |
| T13 | 404 y Redirect | S09, S10 | `+not-found.tsx`, `reserva.tsx` | [W] | hecha |
| T14 | Hook useLibros | S11 | `hooks/useLibros.ts` | [W] error forzado + reintentar | hecha |
| T15 | Catalogo + recientes + Personal | S11, S12, S27 | `(catalogo)/index.tsx` | [W] 3 estados, recientes | hecha |
| T16 | Detalle validado | S14, S12 | `libro/[isbn].tsx` | [W] 3 casos + apila | hecha |
| T17 | Buscador | S13, S26 | `hooks/useSearch.ts`, `buscar.tsx` | [W] URL, historial, carrera | hecha |
| T18 | Modal reservar | S15 | `reservar/[isbn].tsx` | [W] 4 casos + atras | hecha |
| T19 | Mis reservas | S16 | `(tabs)/reservas.tsx` | [W] secciones y devolver | hecha |
| T20 | usePermiso + pantalla previa | S17, S26 | `usePermission.ts`, `permissions.ts`, `permisos/[recurso].tsx` | [U] mapeo, [W] 3 URLs | hecha |
| T21 | Escaner | S18 | `escanear.tsx`, `IsbnInput` | [W] manual, una sola tab bar | hecha ([D] bloqueado y concedido en el telefono) |
| T22 | Recordatorios | S19 | `lib/notifications.ts`, interruptor | [C] pedido y cancelaciones | hecha ([D] notificacion recibida en el telefono) |
| T23 | Login | S20 | `login.tsx` | [W] casos | hecha |
| T24 | Mostrador | S21 | `mostrador.tsx` | [W] casos, aviso sin permiso | hecha |
| T25 | Auditoria de practicas y SOLID | S22, S25, S26 | correcciones | [C] greps = 0, [L], [T], [U] | hecha |
| T26 | README | S24 | `README.md` | [C] checklist + salidas reales | hecha (18 capturas y faltantes explicadas) |
| T27 | Flujo de prueba en telefono | S08-S21 [D] | `docs/sdd/device-test-flow.md` | prueba del alumno | hecha (ver L9-L11) |

## Evidencia observada

- T01: `docs/sdd/spec.md` (S01-S27), `plan.md`, `tasks.md`, `traceability.md`; cada spec tiene al menos una tarea en la matriz.
- T02: `npx expo-doctor`: 20/20 checks passed; grep de imports de modulos borrados: 0; [W] `/` renderiza.
- T03: `npx expo install --check`: Dependencies are up to date; `npx expo lint` configurado y sin errores.
- T04: `npx expo config --type public`: scheme `bibliotecaipf`, `microphonePermission: false`, `recordAudioAndroid: false`; `--type introspect`: `CAMERA` declarado, `RECORD_AUDIO`, ubicacion, almacenamiento y `SYSTEM_ALERT_WINDOW` con `tools:node="remove"`, sin `NSMicrophoneUsageDescription`.
- T05: `api.ts` y `Libro` identicos a la consigna; `npx tsc --noEmit`: sin errores.
- T06: `__tests__/libros.test.ts`: 4 tests verdes (15 libros, ISBN de 13 digitos unicos, libros sin ejemplares, 3 esperas iniciales de 1-2 personas).
- T07: `__tests__/estructuras.test.ts`: 10 tests verdes (incluye desencolar cola vacia y contrato `EstructuraLineal`); grep `.shift(` en src: 0.
- T08: contrastes medidos: texto/fondo 14.43, textoSecundario/superficie 6.81, acento/fondo 6.06, acento/superficie 4.51, textoSobreAcento/acento 6.06 (texto crema sobre acento 2.38: descartado).
- T09: `__tests__/lib.test.ts`: prestamo a 7 dias, espera en posicion 3, duplicado, disponibles por origen, encolar sin mutar, entregar y cola vacia, recientes D-C-B y tope sin duplicar, singular/plural, libros con espera.
- T10: grep de `.encolar(`/`.apilar(` sobre estado en el Context: 0; el layout raiz crea el estado con `useEstadoBiblioteca` y lo provee.
- T11: todo `Pressable` con `accessibilityRole="button"`; botones de icono con `accessibilityLabel`; minimo 44x44 via `tamanios.areaTactilMin`.
- T12: [W] `/`, `/reservas`, `/buscar`, `/escanear`, `/reservar/...`, `/permisos/...`, `/libro/...` renderizan; `/mostrador` sin sesion redirige a `/`; `/login` abre modal.
- T13: [W] `/no-existe` muestra "La direccion "/no-existe" no existe" y "Ir al catalogo" vuelve a `/`; `/reserva` termina en `/reservas`.
- T14/T15: [W] "Cargando el catalogo..." visible al iniciar; error natural (1 de 5) con "Reintentar"; reintento forzado a fallar (`Math.random = () => 0.1`) muestra cargando y luego error; forzado a funcionar carga la lista; recientes tras abrir Ficciones, El Aleph, Rayuela, Bestiario, Bestiario: Bestiario / Rayuela / El Aleph.
- T16: [W] `/libro/abc`: "no es un ISBN valido"; `/libro/1234567890123`: "No encontramos ningun libro"; `/libro/9789507001024`: titulo del header "El Aleph", 0 disponibles, 2 en espera; deep link con boton atras.
- T17: [W] escribir "bor" (respuesta forzada lenta, 1488 ms) y luego "borges" (forzada rapida, 300 ms): URL `?q=borges`, `history.length` 16 -> 16, los resultados de "bor" nunca aparecieron; vacio y sin texto verificados; resultado -> detalle -> atras conserva `?q=rayuela`.
- T18: [W] Ficciones: "lo devolves el 27/11/2026"; confirmar -> `/reservas`; atras no muestra el modal. El Aleph: "posicion 3". Repetir: mensaje de duplicado sin boton de confirmar.
- T19: [W] prestamo con fecha, interruptor y Devolver; espera en posicion 3; sin permiso el interruptor abre `/permisos/notificaciones?isbn=...`; Devolver quita el prestamo.
- T20: `__tests__/permissions.test.ts`: 5 tests verdes; [W] `/permisos/camara` "Continuar", `/permisos/notificaciones` (navegador denegado) "Abrir Ajustes", `/permisos/xyz` "Ese permiso no existe" + Volver.
- T21: [W] ingreso manual "123" -> error de 13 digitos; "9780000000002" -> aviso de ISBN fuera del catalogo; "9789507001031" -> detalle de Rayuela con 1 sola tab bar y atras al Catalogo.
- T22: [C] el permiso de notificaciones solo se pide desde `pedir()` de `usePermiso`, invocado por la pantalla previa a la que lleva el interruptor; `cancelarRecordatorio` en `devolver` y `desactivarRecordatorio`; canal creado antes de pedir.
- T23: [W] clave incorrecta: "Usuario o clave incorrectos..."; correcta: el modal se cierra solo; "Personal" con sesion lleva a `/mostrador`.
- T24: [W] El Aleph: entregado a Lucia, Mateo y Santiago; la fila desaparece; aviso "Ya podes retirar "El Aleph"" en Mis reservas (sin permiso); "Cerrar sesion" vuelve a `/` sin mostrador.
- T25: greps: `any` 0, `console.` 0, `style={{` 0, `eslint-disable` 0, hex fuera de tema 0, tildes solo en los 2 archivos literales de la consigna, `expo-notifications` solo en `lib/notifications.ts`, `lib/api` solo en hooks, `useBiblioteca` en components 0, imports desde `src/app` 0.
- Cierre: `npx expo lint` exit 0; `npx tsc --noEmit` exit 0; `npm test` 34/34; `npx expo-doctor` 20/20.

## Log

- L1 (pedido original, 2026-11-20): "Quiero que me ayudes a completarlo... Nombres de archivos en ingles y funciones en espaniol. Sin caracteres especiales (tildes, enie, etc). No te pongas como Co-Autor. Commits con la convencion tipo(modulo): accion."
- L2: enfoque hibrido SDD + ODD; las verificaciones de salida las ejecuta el desarrollador; el alumno solo corre un flujo fijo en el telefono; las preguntas B-E quedan para despues.
- L3: aplicar principios SOLID (S26).
- L4: plantilla de diseno: distribucion de la primera imagen, paleta `#1B1B1B`, `#323232`, `#FFE7D0`, `#FC6E20` adaptada y accesible (S27).
- L5 (decision): el layout raiz crea el estado con `useEstadoBiblioteca` y lo provee con el Context en el mismo componente, para tener Provider y `Stack.Protected` en el layout raiz con un componente por archivo.
- L6 (decision): `web.output` pasa a `single` para poder verificar en web; con `server` el render del servidor impedia aplicar la proteccion de rutas.
- L7 (decision): del escaner al detalle se usa `router.dismiss()` + `router.push()` en lugar de `router.replace()`. Evidencia: con `replace` el DOM tenia 2 tab bars (se creaba una segunda instancia de las tabs); con `dismiss` + `push` queda 1 y "atras" vuelve al Catalogo. S18 actualizada.
- L8 (fix): `usePermiso` reconsulta al enfocar la pantalla (`useFocusEffect`) ademas de `AppState`; sin esto el escaner podia quedar con el estado viejo al cerrar el modal de permisos.
- L9 (fix, prueba en telefono): en Expo Go para Android, `setNotificationChannelAsync` fallaba con `NullPointerException` y cortaba el pedido de permiso de notificaciones. `crearCanalPrestamos` ahora atrapa el error y sigue; la notificacion usa el canal de respaldo de `expo-notifications` (verificado en `BaseNotificationBuilder.kt`). Evidencia: notificacion "Recordatorio de devolucion" recibida en el telefono a los 15 s (`docs/screenshots/18-notification-received.jpg`).
- L10 (evidencia [D]): 18 capturas del telefono en `docs/screenshots/` y en la seccion "Capturas" del README. Deep links probados con codigos QR escaneados desde Expo Go (sin USB). Faltan el escaner en "cargando" (dura menos de 1 s y el telefono no graba pantalla) y el panel "preguntable" del escaner; la pantalla previa con el dialogo cubre ese estado. La vista de la camara concedida sale negra en la captura.
- L11 (verificacion para RESPUESTAS.md): con `console.log` temporales (borrados despues) se comprobo en web que el Catalogo no se desmonta al cambiar de tab ni al abrir un detalle, y se registro el estado de navegacion de C1: tras confirmar, `[*__root[*(tabs)[(catalogo)[index, *libro/[isbn]], *reservas]]]`; un segundo toque en la tab Catalogo vuelve a `[index]`.
- Pendientes: 2 ISBN reales del alumno en `libros.ts`; development build para ver el texto de proposito de la camara (desafio opcional).
