# Tareas - Biblioteca IPF

Cada tarea indica la spec que implementa, el output que produce, la validacion que la cierra y la evidencia observada.
Toda tarea suma [T] + [L] desde T03. Estados: pendiente / en curso / hecha.

| ID | Tarea | Spec | Output | Validacion | Estado |
|---|---|---|---|---|---|
| T01 | Artefactos SDD | todas | `docs/sdd/*` | [C] consistencia | hecha |
| T02 | Limpiar template y dependencias | S01 | `src` minimo, package.json limpio | [C] doctor + grep, [W] abre | pendiente |
| T03 | Instalar modulos, lint y tests | S01, S23 | camera, notifications, vector-icons, jest-expo, eslint | [C] versiones, [L] corre | pendiente |
| T04 | Configurar app.json | S02, S27 | scheme, plugins, blockedPermissions, tema oscuro | [C] config public + introspect | pendiente |
| T05 | Tipos y API literal | S03 | `types/index.ts`, `lib/api.ts` | [C] diff con consigna, [T] | pendiente |
| T06 | Datos del catalogo | S04 | `data/libros.ts` | [U] test de datos | pendiente |
| T07 | Clases Pila y Cola | S05, S23, S26 | `estructuras/*` + tests | [U] >= 6 casos + contrato, [C] sin shift | pendiente |
| T08 | Tema y constantes | S06, S27 | `constants/tema.ts`, `constants/app.ts` | [T], [C] contraste | pendiente |
| T09 | Logica pura | S07, S12, S14, S15, S21 | `lib/catalog.ts`, `dates.ts`, `library.ts` + tests | [U] escenarios OK/ERR | pendiente |
| T10 | Context de biblioteca | S07 | `context/LibraryContext.tsx` | [T], [C] sin mutacion | pendiente |
| T11 | Componentes base de UI | S22, S27 | botones, estados, tarjetas, titulos | [C] a11y y estilos | pendiente |
| T12 | Layouts, tabs, protected, modales | S08 | `_layout.tsx` x3 | [W] URLs de A1 | pendiente |
| T13 | 404 y Redirect | S09, S10 | `+not-found.tsx`, `reserva.tsx` | [W] | pendiente |
| T14 | Hook useLibros | S11 | `hooks/useLibros.ts` | [W] error forzado + reintentar | pendiente |
| T15 | Catalogo + recientes + Personal | S11, S12, S27 | `(catalogo)/index.tsx` | [W] 3 estados, recientes | pendiente |
| T16 | Detalle validado | S14, S12 | `libro/[isbn].tsx` | [W] 3 casos + apila | pendiente |
| T17 | Buscador | S13, S26 | `hooks/useSearch.ts`, `buscar.tsx` | [W] URL, historial, carrera | pendiente |
| T18 | Modal reservar | S15 | `reservar/[isbn].tsx` | [W] 4 casos + atras | pendiente |
| T19 | Mis reservas | S16 | `(tabs)/reservas.tsx` | [W] secciones y devolver | pendiente |
| T20 | usePermiso + pantalla previa | S17, S26 | `usePermission.ts`, `permissions.ts`, `permisos/[recurso].tsx` | [U] mapeo, [W] 3 URLs | pendiente |
| T21 | Escaner | S18 | `escanear.tsx`, `IsbnInput` | [W] manual, [C] ref + replace | pendiente |
| T22 | Recordatorios | S19 | `lib/notifications.ts`, interruptor | [C] pedido y cancelaciones | pendiente |
| T23 | Login | S20 | `login.tsx` | [W] 3 casos | pendiente |
| T24 | Mostrador | S21 | `mostrador.tsx` | [W] casos, aviso sin permiso | pendiente |
| T25 | Auditoria de practicas y SOLID | S22, S25, S26 | correcciones | [C] greps = 0, [L], [T], [U] | pendiente |
| T26 | README | S24 | `README.md` | [C] checklist + salidas reales | pendiente |
| T27 | Flujo de prueba en telefono | S08-S21 [D] | `docs/sdd/device-test-flow.md` | prueba del alumno | pendiente |

## Evidencia observada

- T01: `docs/sdd/spec.md` (S01-S27), `plan.md`, `tasks.md`, `traceability.md` creados; cada spec tiene al menos una tarea en la matriz.
