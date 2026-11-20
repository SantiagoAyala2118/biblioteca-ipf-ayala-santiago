# Especificacion - Biblioteca IPF

Fuente unica de requisitos: consigna del TP4 "App integradora: Biblioteca IPF" (secciones A1-A6 y F2).
Cada spec define reglas y criterios ODD: output esperado, escenarios (OK exito / ERR error), evidencia y aceptacion.

Tipos de evidencia: [T] typecheck, [L] lint, [U] test unitario, [W] prueba en web hecha por el desarrollador,
[C] chequeo estatico o de configuracion, [D] prueba en telefono real (flujo fijo de `device-test-flow.md`).


Formato de cada spec: **Fuente** · **Reglas** · **Output esperado** · **Escenarios** (OK = exito, ERR = error) · **Evidencia** · **Aceptacion**.

### S01 Proyecto base limpio
- Fuente: A5, pedido del alumno, A4 "sin archivos sin usar".
- Reglas: borrar del template `src/app/explore.tsx`, `src/components/*`, `src/hooks/*`, `src/constants/theme.ts`, `src/global.css`, `scripts/reset-project.js` (y su script en package.json), assets de ejemplo (`react-logo*`, `expo-badge*`, `expo-logo`, `logo-glow`, `tabIcons/`, `tutorial-web`). Desinstalar `@expo/ui`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-web-browser`, `expo-device`. Instalar solo con `npx expo install`: `expo-camera`, `expo-notifications`, `@expo/vector-icons`. Prohibidos `expo-permissions`, `expo-location`, `expo-image-picker`.
- Output: `src/app/_layout.tsx` minimo que renderiza; package.json sin modulos sin uso.
- Escenarios: OK app abre en web. ERR si `expo-doctor` marca faltante -> se restaura ese paquete.
- Evidencia: [C] `npx expo-doctor` OK; [C] grep de imports de modulos borrados = 0; [T]; [W] app abre.
- Aceptacion: las 4 evidencias en verde.

### S02 Configuracion app.json y minimo privilegio
- Fuente: A5.
- Reglas: `"scheme": "bibliotecaipf"`, nombre "Biblioteca IPF"; plugin `expo-camera` con `cameraPermission: "Usamos tu camara para leer el codigo de barras del libro y abrir su ficha al instante"`, `microphonePermission: false`, `recordAudioAndroid: false`, `barcodeScannerEnabled: true`; plugin `expo-notifications`; `android.blockedPermissions` con `RECORD_AUDIO`, ubicacion fina/gruesa y almacenamiento; `typedRoutes: true`.
- Output: config publica e introspectada con esos valores.
- Escenarios: OK manifest final sin RECORD_AUDIO. ERR si `microphonePermission: false` no es aceptado en SDK 58 -> se ajusta segun doc versionada y se documenta.
- Evidencia: [C] `npx expo config --type public`; [C] `npx expo config --type introspect` (permisos Android finales); doc SDK 58 consultada.
- Aceptacion: scheme correcto, CAMERA presente, RECORD_AUDIO ausente/bloqueado, texto con el molde.

### S03 Tipos y API simulada literales
- Fuente: A2.
- Reglas: `src/types/index.ts` con `Libro` identico al PDF (+ tipos propios abajo: `Prestamo`, `Recurso`, `EstadoPermiso`, `ResultadoReserva`); `src/lib/api.ts` identico.
- Output: archivos que compilan.
- Evidencia: [C] comparacion linea a linea con el PDF; [T].
- Aceptacion: cero diferencias en lo provisto.

### S04 Datos del catalogo
- Fuente: A2.
- Reglas: `LIBROS` con >= 15 libros, ISBN de 13 digitos sin guiones, 2 con ISBN real (los pasas vos; mientras, ISBN validos de ejemplo), algunos con `ejemplares: 0`; `ESPERAS_INICIALES` con >= 2 libros (con 0 ejemplares) con 1-2 personas.
- Output: `src/data/libros.ts`.
- Evidencia: [U] test: >=15, todos `^\d{13}$`, ISBN unicos, >=1 con 0 ejemplares, >=2 esperas con 1-2 personas.
- Aceptacion: test verde.

### S05 Estructuras Pila y Cola
- Fuente: A5, A3.2, A3.5, A6 Pruebas.
- Reglas: clases en `src/estructuras/` con `#items`, getter `tamanio`, `aArray()`, constructor con items iniciales opcionales. Pila: `apilar`, `desapilar`, `verTope`, `estaVacia`. Cola: `encolar`, `desencolar` (devuelve `undefined` si esta vacia), `verFrente`, `estaVacia`; **sin `shift()`** (indice de frente).
- Output: dos clases tipadas genericas.
- Escenarios: OK LIFO/FIFO; ERR desapilar/desencolar vacia -> `undefined` sin romper.
- Evidencia: [U] >= 6 casos (incluye desencolar cola vacia); [C] grep `shift(` en estructuras = 0.
- Aceptacion: tests verdes.

### S06 Tema y constantes
- Fuente: A4 Estilos/Accesibilidad.
- Reglas: `tema.ts` con colores, espaciados, tamanios de fuente, radios y `AREA_TACTIL_MIN = 44`. `app.ts` con `USUARIO_ACTUAL`, credenciales del personal, `DIAS_PRESTAMO = 7`, `SEGUNDOS_RECORDATORIO = 15`, `CANAL_PRESTAMOS = 'prestamos'`.
- Evidencia: [C] grep de colores hex/numeros magicos fuera de `tema.ts` = 0 (al cierre, S22).

### S07 Estado global (Context) y reglas de negocio
- Fuente: A5 (Context en layout raiz), A3.2, A3.5, A3.8, B3 (no mutar).
- Reglas: `BibliotecaProvider` en el layout raiz con `prestamos`, `esperas: Record<isbn, Cola<string>>` (inicia con `ESPERAS_INICIALES`), `recientes: Pila<Libro>`, `sesion`, `avisos`. Nunca se muta una estructura guardada: cada accion crea una instancia nueva desde `aArray()` y hace `setState`. Ejemplares disponibles **se calculan** (`ejemplares - prestamos de origen "estante"`). Funciones puras en `lib/library.ts`: `calcularDisponibles`, `evaluarReserva` (prestamo / espera con posicion / duplicado), `posicionEnCola`, `apilarReciente` (no apila si ya es el tope), `entregarSiguiente`.
- Output: hook `useBiblioteca()` con estado + acciones (`reservar`, `devolver`, `activarRecordatorio`, `desactivarRecordatorio`, `agregarReciente`, `entregarAlSiguiente`, `iniciarSesion`, `cerrarSesion`, `descartarAviso`).
- Escenarios: OK reservar con stock -> prestamo 7 dias; OK sin stock -> espera posicion N; ERR reservar dos veces -> "duplicado"; ERR entregar con cola vacia -> sin cambios.
- Evidencia: [U] tests de `library.ts` (cada escenario); [C] grep de `.encolar(`/`.apilar(` sobre estado sin clonar = 0; [W] la UI se actualiza al reservar.
- Aceptacion: tests verdes + UI reactiva.

### S08 Navegacion y layouts
- Fuente: A1, A5 (tabs con icono, anchor).
- Reglas: arbol de la seccion 4. Tabs "Catalogo" y "Mis reservas" con Ionicons. Root `anchor: '(tabs)'`, Stack del catalogo `anchor: 'index'`. `reservar`, `permisos`, `login` con `presentation: 'modal'`. `login`/`mostrador` dentro de `Stack.Protected`.
- Output: cada URL de A1 resuelve a su pantalla.
- Escenarios: OK deep link `/buscar?q=borges` muestra boton atras hacia las tabs; OK `/libro/<isbn>` deja Catalogo debajo.
- Evidencia: [W] recorrer las 11 URLs de A1; [W] boton atras visible en deep links; [D] atras de Android.

### S09 Pantalla 404
- Fuente: A1. Reglas: `+not-found.tsx` muestra la URL inexistente (`usePathname`) + link al Catalogo.
- Evidencia: [W] `/no-existe` muestra "/no-existe" y el link funciona.

### S10 Redirect de URL vieja
- Fuente: A1. Reglas: `reserva.tsx` = `<Redirect href="/reservas" />`.
- Evidencia: [W] abrir `/reserva` termina en `/reservas`.

### S11 Catalogo con estados (useLibros)
- Fuente: A1 "/", A3.1, A4 Listas/Estados/Mensajes.
- Reglas: `useLibros()` devuelve `{ libros, cargando, error, reintentar }`; efecto con limpieza (bandera `cancelado`); reintentar via contador en dependencias; error traducido a mensaje amigable. Pantalla: indicador de carga, mensaje + "Reintentar", `ListEmptyComponent`, `FlatList` con `keyExtractor` = isbn; arriba "Vistos recientemente" y botones "Buscar" y "Escanear"; header con link "Personal" (`/login` sin sesion, `/mostrador` con sesion).
- Escenarios: OK carga y lista; ERR falla (`Math.random` forzado < 0.2) -> mensaje + Reintentar -> OK; vacio -> mensaje.
- Evidencia: [W] los 3 estados capturados (error forzado por consola); [C] keyExtractor isbn y ListEmptyComponent presentes; [C] limpieza en el efecto.

### S12 Vistos recientemente (Pila)
- Fuente: A3.2. Reglas: abrir un detalle apila el libro; el Catalogo muestra 3 del tope, del mas reciente al mas antiguo; si ya es el tope no se apila.
- Escenarios: OK abrir A,B,C,D -> muestra D,C,B; ERR reabrir D -> sigue D,C,B (sin duplicar).
- Evidencia: [U] `apilarReciente`; [W] secuencia real.

### S13 Buscador en la URL
- Fuente: A1 `/buscar?q=`, A3.3, A6 Debounce.
- Reglas: lee `q` con `useLocalSearchParams`, escribe con `router.setParams`; espera 300 ms sin escribir; limpieza con `clearTimeout` + descarte de respuestas viejas; estados: sin texto (indicacion), cargando, resultados, vacio ("No encontramos libros para ..."), error con accion.
- Escenarios: OK "borges" -> resultados; OK respuestas desordenadas -> solo la ultima; ERR sin coincidencias -> vacio.
- Evidencia: [W] la URL refleja `?q=`; [W] `history.length` no crece al escribir; [W] carrera forzada ("bor" lento via `Math.random`, "borges" rapido) -> nunca aparecen resultados de "bor".

### S14 Detalle validado
- Fuente: A1 `/libro/[isbn]`, A3.4.
- Reglas: valida `^\d{13}$` y existencia; muestra titulo, autor, anio, disponibles (calculado), personas en espera y "Reservar"; titulo del header = titulo del libro.
- Escenarios: OK ISBN existente; ERR `/libro/abc` -> "El ISBN debe tener 13 digitos" + link Catalogo; ERR `/libro/123...` inexistente -> "No encontramos ese libro" + link.
- Evidencia: [U] `esIsbnValido`, `obtenerLibroPorIsbn`; [W] los 3 casos.

### S15 Reservar (Cola) - modal de confirmacion
- Fuente: A1 `/reservar/[isbn]`, A3.5.
- Reglas: muestra antes de confirmar que pasara (prestamo hasta fecha X, o lista de espera en posicion N). Confirmar -> lleva a `/reservas` y "atras" no vuelve a la confirmacion (`router.dismissTo('/reservas')`, a validar). No se reserva dos veces el mismo libro.
- Escenarios: OK con stock -> prestamo +7 dias; OK sin stock -> posicion (ej. 3 si habia 2); ERR duplicado -> mensaje y sin cambios; ERR isbn invalido -> mensaje + volver.
- Evidencia: [U] `evaluarReserva`; [W] los 4 casos; [W] tras confirmar, atras no muestra el modal; [D] atras Android.

### S16 Mis reservas
- Fuente: A1 `/reservas`, A3.8, A3.9.
- Reglas: prestamos (titulo, fecha de devolucion, interruptor "Recordarme", "Devolver"), esperas con posicion, avisos dentro de la app, estado de notificaciones visible, estados vacios.
- Evidencia: [W] cada seccion con y sin datos; [W] devolver quita el prestamo y sube disponibles.

### S17 Permisos: usePermiso + pantalla previa
- Fuente: A1 `/permisos/[recurso]`, A3.6, A3.7, A3.9.
- Reglas: `usePermiso(recurso)` devuelve `{ estado, pedir, abrirAjustes }` con 4 estados (`cargando`, `concedido`, `preguntable`, `bloqueado`) via `aEstadoPermiso` (granted / canAskAgain); re-consulta al volver la app a primer plano (`AppState`). Camara usa `useCameraPermissions`. Para notificaciones, `pedir` crea el canal `"prestamos"` **antes** de pedir. Pantalla previa: beneficio en una frase + un unico boton "Continuar" o "Abrir Ajustes" si esta bloqueado. Recurso desconocido -> mensaje + volver.
- Escenarios: OK concedido; OK denegado una vez -> sigue preguntable (Android); ERR bloqueado -> Abrir Ajustes; OK vuelve de Ajustes habilitado -> se actualiza solo.
- Evidencia: [U] `aEstadoPermiso` (4 casos); [W] `/permisos/camara`, `/permisos/notificaciones`, `/permisos/xyz`; [D] dialogos reales.

### S18 Escaner
- Fuente: A1 `/escanear`, A3.6, A3.9.
- Reglas: 4 estados en pantalla; concedido -> `CameraView` con EAN-13; navega una sola vez (`useRef`) con `router.replace` al detalle; ISBN fuera del catalogo -> aviso sin repetirlo y sigue escaneando; ingreso manual siempre visible (valida 13 digitos).
- Escenarios: OK lectura -> detalle una vez; ERR desconocido -> aviso unico; ERR sin camara -> ingreso manual.
- Evidencia: [W] ingreso manual valido/invalido/desconocido; [C] ref de bloqueo y `replace`; [D] lectura real.

### S19 Recordatorio de devolucion
- Fuente: A3.7.
- Reglas: permiso pedido solo al activar "Recordarme"; canal antes de pedir; notificacion local a 15 s; id guardado en el prestamo; cancelada al desactivar o devolver; si no hay permiso, se ofrece la pantalla previa y nunca bloquea.
- Evidencia: [C] unico lugar que pide permiso de notificaciones = flujo del interruptor; [C] cancelacion en ambos caminos; [D] llega a los 15 s y no llega si se cancelo.

### S20 Login del personal
- Fuente: A1 `/login`, A3.8.
- Reglas: modal, solo existe sin sesion; usuario y clave fijos en `constants/app.ts`; al ingresar se cierra solo.
- Escenarios: OK credenciales -> modal cerrado, "Personal" lleva a `/mostrador`; ERR clave incorrecta -> "Usuario o clave incorrectos"; ERR `/login` con sesion -> no accesible.
- Evidencia: [W] los 3 casos.

### S21 Mostrador protegido
- Fuente: A1 `/mostrador`, A3.8, A3.9.
- Reglas: solo con sesion; lista libros con espera (quien esta al frente, cuantos esperan), "Entregar al siguiente" desencola; si el del frente es `USUARIO_ACTUAL` se le crea el prestamo y se decide **consultando el permiso en ese momento**: notificacion si concedido, aviso en `/reservas` si no. "Cerrar sesion" -> el mostrador desaparece del historial. Sin libros en espera -> estado vacio.
- Escenarios: OK entregar a otra persona; OK entregar a vos sin permiso -> aviso en `/reservas`; ERR cola vacia -> sin accion; ERR `/mostrador` sin sesion -> no accesible.
- Evidencia: [U] `entregarSiguiente`; [W] todos los casos; [D] notificacion con permiso.

### S22 Buenas practicas transversales
- Fuente: A4 completa.
- Reglas: `src/app` solo rutas; sin `any`; sin `console.log`; sin codigo comentado; `StyleSheet.create` en todos; sin estilos en linea; colores/tamanios solo en `tema.ts`; componentes a nivel modulo, uno por archivo; efectos con limpieza y deps completas; botones con `accessibilityRole="button"`, solo-icono con `accessibilityLabel`, minimo 44x44; mensajes en espaniol claro sin texto tecnico.
- Evidencia: [C] grep por cada regla = 0 violaciones; [L] sin `eslint-disable`; [T].

### S23 Tests unitarios (desafio opcional)
- Fuente: A6. Reglas: `jest-expo` via `npx expo install`; tests de Pila, Cola (>= 6, con cola vacia), datos, `library.ts`, `catalog.ts`, `permissions.ts`.
- Evidencia: [U] `npm test` verde.

### S24 README y evidencias de calidad
- Fuente: F2.3, F2.5, A5 (version SDK, justificacion blockedPermissions).
- Reglas: como ejecutar, version SDK 58, arbol de `src/app` con el navegador de cada `_layout`, bloque `plugins` comentado, tabla de permisos (recurso, modulo, cuando se pide, alternativa), justificacion de `blockedPermissions`, deep links de prueba, salida de `expo lint` y `tsc --noEmit`.
- Evidencia: [C] checklist de secciones completo; salidas reales pegadas.

### S25 Git
- Fuente: A4 Git, F1. Reglas: >= 15 commits chicos `tipo(modulo): accion`, `.gitignore` correcto (agrega `coverage/`), sin `node_modules`.
- Evidencia: [C] `git log --oneline | wc -l` >= 15; `git ls-files | grep node_modules` = 0.

### S26 Principios SOLID (aplicados sin sobreingenieria)
- Fuente: pedido del alumno; refuerza A4 (estructura, componentes) y E2 (acoplamiento).
- Reglas:
  - **S - Responsabilidad unica:** cada archivo hace una cosa. `api.ts` trae datos, `library.ts` decide reglas de negocio, `LibraryContext.tsx` solo guarda estado y llama a `library.ts`, los hooks encapsulan efectos, las pantallas orquestan (contenedor) y `components/` solo pinta (presentacional).
  - **O - Abierto/cerrado:** los recursos de permiso se describen en un mapa de configuracion (`RECURSOS_PERMISO` en `constants/app.ts`: beneficio, titulo). Agregar un recurso = agregar una entrada, sin tocar la pantalla `/permisos/[recurso]` ni `usePermiso`. Los componentes de estado (`LoadingState`, `ErrorState`, `EmptyState`) se reutilizan por props, no se copian.
  - **L - Sustitucion de Liskov:** `Pila` y `Cola` implementan la misma interfaz `EstructuraLineal<T>` (`tamanio`, `estaVacia()`, `aArray()`); cualquier codigo que solo necesite leer la coleccion funciona con cualquiera de las dos. Un test de contrato comun lo prueba.
  - **I - Segregacion de interfaces:** cada componente recibe solo las props que usa (ej. `FilaLibro` recibe `libro` y `alPresionar`, nunca el Context entero). Props tipadas y minimas.
  - **D - Inversion de dependencias:** pantallas y componentes no importan `expo-notifications` ni la API directamente: dependen de hooks (`useLibros`, `usePermiso`, `useBiblioteca`) y de `lib/notifications.ts`. Unica excepcion justificada: `CameraView` en `escanear.tsx` (es un componente visual).
- Output: la regla de dependencias de la seccion 4 se cumple y cada principio tiene un ejemplo concreto citable en la defensa.
- Evidencia: [C] grep `expo-notifications` solo en `lib/notifications.ts` y `hooks/usePermission.ts`; [C] grep `lib/api` solo en `hooks/useLibros.ts` y `hooks/useSearch.ts` (`useBusqueda`: el efecto con debounce y descarte vive en un hook, la pantalla solo pinta); [C] grep `useBiblioteca` = 0 dentro de `src/components`; [C] ningun import de `src/app` fuera de `src/app`; [U] test de contrato `EstructuraLineal`.
- Aceptacion: todos los greps en 0 violaciones; documentado brevemente en el README (seccion "Decisiones de diseno").


### S27 Sistema de diseno (plantilla visual)
- Fuente: pedido del alumno (plantilla de diseno + paleta); refuerza A4 Estilos y Accesibilidad.
- Reglas:
  - Distribucion tomada de la plantilla: tema oscuro; tarjeta "hero" arriba (titulo, bajada, boton con borde y boton-icono); titulo de seccion con acento lateral; grilla de 2 columnas de tarjetas redondeadas con "portada" arriba (icono de libro sobre bloque de color), titulo, descripcion (autor) y pie con un dato (disponibles) + boton-icono chico con borde.
  - Paleta: fondo `#1B1B1B`, superficie `#323232`, texto `#FFE7D0`, acento `#FC6E20`. Derivados para estados (texto secundario, borde, error, exito) definidos solo en `tema.ts`.
  - Accesibilidad: texto normal con contraste >= 4.5:1. El acento naranja sobre fondo da ~6.1:1 (OK). Texto crema sobre naranja da ~2.4:1 (NO): los botones con fondo naranja usan texto oscuro `#1B1B1B`.
  - Headers y tab bar usan el mismo tema (ThemeProvider de expo-router con colores propios). `userInterfaceStyle: "dark"`.
- Output: todas las pantallas comparten tarjetas, botones y titulos de seccion del mismo estilo.
- Evidencia: [W] capturas de Catalogo, Detalle, Mis reservas y Mostrador con el mismo lenguaje visual; [C] ningun color fuera de `tema.ts`.
- Aceptacion: UI uniforme y contrastes dentro de AA.
