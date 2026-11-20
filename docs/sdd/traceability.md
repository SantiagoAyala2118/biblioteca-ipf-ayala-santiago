# Matriz de trazabilidad

Documento fuente -> Spec -> Tarea -> Output esperado -> Validacion.

| Documento fuente | Spec | Tarea | Output esperado | Validacion |
|---|---|---|---|---|
| A5 proyecto, A4 limpieza | S01 | T02, T03 | template limpio, solo modulos permitidos | [C] doctor/grep, [W] |
| A5 app.json | S02 | T04 | scheme, plugins, sin RECORD_AUDIO | [C] config introspect |
| A2 tipos/API | S03 | T05 | archivos literales | [C] diff, [T] |
| A2 datos | S04 | T06 | >=15 libros, esperas iniciales | [U] |
| A5 estructuras, A3.2, A3.5 | S05 | T07 | Pila/Cola con #items, sin shift | [U], [C] |
| A4 estilos | S06 | T08 | tema.ts y constantes | [C], [T] |
| A5 Context, A3.5, A3.8 | S07 | T09, T10 | estado global sin mutacion, disponibles calculados | [U], [C], [W] |
| A1 rutas, A5 tabs/anchor | S08 | T12 | 11 URLs resuelven | [W], [D] |
| A1 404 | S09 | T13 | muestra URL inexistente | [W] |
| A1 /reserva | S10 | T13 | redirige a /reservas | [W] |
| A1 /, A3.1 | S11 | T14, T15 | cargando/error/vacio/lista | [W], [C] |
| A3.2 | S12 | T09, T15, T16 | 3 recientes sin duplicar tope | [U], [W] |
| A1 /buscar, A3.3, A6 | S13 | T17 | URL + solo ultima busqueda | [W] |
| A1 /libro, A3.4 | S14 | T09, T16 | detalle o mensaje + link | [U], [W] |
| A1 /reservar, A3.5 | S15 | T09, T18 | prestamo/espera/duplicado, atras sin modal | [U], [W], [D] |
| A1 /reservas | S16 | T19 | prestamos, esperas, avisos | [W] |
| A1 /permisos, A3.6, A3.9 | S17 | T20 | 4 estados, Continuar/Abrir Ajustes | [U], [W], [D] |
| A1 /escanear, A3.6 | S18 | T21 | navega una vez, aviso unico, manual | [W], [C], [D] |
| A3.7 | S19 | T22 | notificacion 15 s, cancelable | [C], [D] |
| A1 /login, A3.8 | S20 | T23 | login cierra solo, error claro | [W] |
| A1 /mostrador, A3.8 | S21 | T09, T24 | entrega, aviso/notificacion | [U], [W], [D] |
| A4 completa | S22 | T11, T25 | 0 violaciones | [C], [L], [T] |
| A6 pruebas | S23 | T03, T07, T09 | npm test verde | [U] |
| F2.3, F2.5, A5 | S24 | T26 | README completo | [C] |
| A4 Git, F1 | S25 | todas | >=15 commits | [C] |
| Pedido del alumno, A4, E2 | S26 | T07, T09-T11, T17, T20, T25 | SOLID con ejemplo citable por principio | [C] greps, [U] contrato |
| Pedido del alumno (plantilla), A4 | S27 | T08, T11, T15-T24 | UI uniforme con la paleta, contraste AA | [W] capturas, [C] colores solo en tema.ts |
