# Respuestas - TP 4 Biblioteca IPF

Santiago Ayala. Todas las respuestas hablan de mi app tal como esta en este repositorio. Cuando cito codigo pongo el archivo y la linea para que se pueda ir a mirarlo.

Una aclaracion antes de empezar: las preguntas de la Parte C y la B1 piden comprobar cosas en ejecucion. Para eso agregue `console.log` temporales (en la limpieza del efecto de `useLibros` y en el layout raiz, imprimiendo el estado de navegacion con `useRootNavigationState`), recorri la app y despues los borre. Los resultados que copio abajo salen de esos logs.

---

## Parte B - Estado, efectos y renderizado

### B1. El ciclo de vida de useLibros

**a) Render por render**

`useLibros` (`src/hooks/useLibros.ts`) arranca con `libros = []`, `cargando = true` y `error = null`. El pedido se hace dentro de un efecto que depende de `intento`.

Caso en que todo sale bien:

| Render | libros | cargando | error | Que lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | El Catalogo se monta. Despues de pintar corre el efecto y llama a `obtenerLibros()`. En pantalla se ve "Cargando el catalogo...". |
| 2 | los 15 libros | `false` | `null` | A los 800 ms llega la respuesta. Se ejecutan `setLibros(datos)` y, en el `finally`, `setCargando(false)`. React junta las dos actualizaciones en un solo render (batching), asi que es un render y no dos. |

Total: 2 renders. Lo comprobe con el log: el efecto corrio una sola vez con `intento 0`.

Caso en que `obtenerLibros()` falla y toco "Reintentar":

| Render | libros | cargando | error | Que lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | Montaje. Corre el efecto con `intento = 0`. |
| 2 | `[]` | `false` | mensaje amigable | La promesa se rechaza: `setError(...)` en el `catch` y `setCargando(false)` en el `finally`, juntos en un render. Se ve el mensaje y el boton "Reintentar". |
| 3 | `[]` | `true` | `null` | Toco "Reintentar": `setError(null)`, `setCargando(true)` y `setIntento(1)` en un solo render. Como cambio `intento`, React ejecuta la limpieza del efecto anterior y vuelve a correr el efecto. |
| 4 | los 15 libros | `false` | `null` | Llega la respuesta del segundo pedido. |

Total: 4 renders.

**b) Se desmonta el Catalogo?**

No, en ninguno de los dos casos. Puse un `console.log` en la limpieza del efecto y nunca aparecio:

- Al cambiar a "Mis reservas" y volver, el log de limpieza no se imprimio y el efecto no volvio a correr. Las tabs dejan montadas las pantallas que ya se visitaron, solo las esconden.
- Al abrir un libro, el detalle se apila encima del Catalogo dentro del Stack de la tab. El Catalogo queda abajo, montado. Tampoco hubo limpieza.

Entonces mi limpieza se ejecuta en dos situaciones reales:

1. Cuando toco "Reintentar": cambia `intento` y React limpia el efecto viejo antes de correr el nuevo. Ahi la bandera `cancelado = true` hace que, si la respuesta vieja llega tarde, se ignore.
2. Cuando la pantalla se desmonta de verdad. Por ejemplo, si se recarga la app o si el Catalogo se cierra mientras todavia esta cargando. Es raro, pero si pasa, evita que un `setState` llegue a un componente que ya no existe.

**c) Por que no puedo pasar una funcion async directo a useEffect**

Porque una funcion `async` siempre devuelve una promesa, y `useEffect` espera que lo que devuelvo sea la funcion de limpieza (o nada). Si le paso una promesa, React no la puede usar como limpieza y la limpieza que yo quiero escribir se pierde.

Lo resolvi declarando una funcion async adentro del efecto y llamandola (`src/hooks/useLibros.ts:26-43`):

```ts
useEffect(() => {
  let cancelado = false;

  async function cargar() {
    try {
      const datos = await obtenerLibros();
      if (!cancelado) setLibros(datos);
    } catch {
      if (!cancelado) setError(MENSAJE_ERROR);
    } finally {
      if (!cancelado) setCargando(false);
    }
  }

  cargar();

  return () => {
    cancelado = true;
  };
}, [intento]);
```

**d) Como implemente reintentar**

Con un contador en el estado (`intento`) que esta en el array de dependencias del efecto. `reintentar` hace `setIntento((anterior) => anterior + 1)` (`src/hooks/useLibros.ts:50-54`). Cuando el numero cambia, React ve una dependencia distinta, limpia el efecto anterior y lo vuelve a ejecutar, y eso dispara un nuevo `obtenerLibros()`.

Elegi un contador y no otro valor por esto:

- No sirve usar `error` como dependencia, porque el efecto volveria a correr cada vez que cambia el error, incluso cuando se setea por el fallo mismo. Eso puede terminar en un bucle de pedidos.
- No sirve `cargando`, por lo mismo: el propio efecto lo cambia.
- El contador solo cambia cuando la persona toca "Reintentar". Es un valor que existe solamente para decir "quiero otro intento", y es facil de explicar.

### B2. La condicion de carrera del buscador

Primero una aclaracion: mi buscador tiene debounce de 300 ms (`src/hooks/useSearch.ts:34-45`). Eso significa que no se pide nada hasta que la persona deja de escribir 300 ms. Por eso, con mi codigo, en este ejemplo "bor" ni siquiera llega a pedirse.

| Momento | Que pasa | Sin limpieza: que se ve | Con mi codigo: que se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor". Se pide `buscarLibros("bor")`, que tarda 1.400 ms. | En el campo dice "bor" y se ve el estado de carga o la lista vacia. | En el campo dice "bor" y se ve "Buscando...". Todavia no se pidio nada: arranca un temporizador de 300 ms. |
| t = 200 ms | Escribe "borges". Se pide `buscarLibros("borges")`, que tarda 300 ms. | En el campo dice "borges" y sigue cargando. Hay dos pedidos en vuelo. | En el campo dice "borges". La limpieza borro el temporizador de "bor", asi que ese pedido nunca sale. Arranca un temporizador nuevo para "borges". |
| t = 500 ms | Llega la respuesta de "borges". | Se ve Ficciones y El Aleph. Esta bien por ahora. | Sigue "Buscando...": recien a los 500 ms sale el pedido de "borges" (200 + 300 de debounce). |
| t = 1.400 ms | Llega la respuesta de "bor". | La respuesta vieja pisa a la nueva. En el campo dice "borges" pero la lista muestra Ficciones, El Aleph y "Laboratorio de programacion en JavaScript" (que tiene "bor" en el titulo). Es un resultado que no corresponde a lo que esta escrito. | No llega nada de "bor". Los resultados de "borges" ya estan en pantalla desde que respondio su pedido, y se quedan. |

Si "bor" hubiera llegado a pedirse (por ejemplo, si la persona hace una pausa de mas de 300 ms antes de seguir escribiendo), igual no se mostraria. Lo explico en el punto a.

Esto lo probe en el navegador forzando que "bor" tarde mucho y "borges" poco. Nunca aparecieron los resultados de "bor".

**a) Que hace exactamente mi limpieza**

La limpieza esta en `src/hooks/useSearch.ts:49-52` y hace dos cosas:

1. `clearTimeout(temporizador)`: si el temporizador de 300 ms todavia no se disparo, lo cancela y ese pedido no sale.
2. `cancelado = true`: si el pedido ya salio, cuando la respuesta llegue va a encontrar `cancelado` en `true` y no va a llamar a `setRespuesta`. La respuesta vieja se descarta.

Ademas tengo una tercera proteccion: guardo la respuesta junto con el texto que se busco (`{ consulta, libros, fallo }`) y solo la muestro si `consulta === texto` (linea 61). Asi, aunque algo raro se filtre, nunca muestro resultados de otro texto.

La limpieza se ejecuta cada vez que cambia `texto` (o `intento`), justo antes de correr el efecto con el valor nuevo. Tambien se ejecuta si la pantalla se desmonta.

**b) La propuesta de comparar `if (texto === q)` dentro del `.then()`**

No funciona. La funcion del `.then()` es una clausura: se creo en un render concreto y "recuerda" los valores de ese render. Cuando se pidio "bor", tanto `texto` como `q` valian "bor" en ese render. Cuando la respuesta llega a los 1.400 ms, esa funcion sigue viendo `q = "bor"`, no el valor actual "borges". Entonces `texto === q` da `true` y se pisa el resultado igual.

Para que funcione habria que comparar contra el valor actual, no contra el de la clausura. Por ejemplo con una `ref` que guarde el ultimo texto, o con la bandera `cancelado` de la limpieza, que es lo que yo hice.

**c) La URL y el boton atras**

Mientras escribo, la URL se va actualizando: `/buscar?q=b`, `/buscar?q=bo`, ..., `/buscar?q=borges`. Uso `router.setParams` (`src/app/buscar.tsx:40`), que cambia el parametro de la pantalla actual sin agregar una entrada nueva al historial. Lo comprobe en web: `history.length` no crecio mientras escribia. El boton atras me lleva directo al Catalogo.

Si usara `router.push`, cada letra apilaria una pantalla de busqueda nueva. Para volver al Catalogo tendria que tocar atras una vez por cada letra que escribi ("borges" son 6 toques). Ademas, cada pantalla nueva arrancaria con el teclado cerrado y el foco perdido.

### B3. Mutar o reemplazar

**a) Que muestra el texto despues de tocar "Anotarme" tres veces**

Sigue mostrando "Personas en espera: 0". `espera.encolar('Ana')` cambia los datos adentro del objeto, pero el objeto es el mismo y no hay ningun `setState`. React no se entera de que algo cambio, asi que no vuelve a renderizar y el texto queda con el valor viejo.

**b) Por que "salta" a 3 al escribir en el TextInput**

Al escribir en un `TextInput` controlado se llama a su `setState`, y eso hace que todo el componente se vuelva a renderizar. En ese render nuevo se vuelve a leer `espera.tamanio`, que ahora vale 3 porque la cola fue mutada tres veces. El numero aparece de golpe por un motivo que no tiene nada que ver con la cola.

Un error que aparece "a veces" es peor que uno que aparece siempre por estas razones:

- Si aparece siempre, lo veo la primera vez que pruebo y lo arreglo.
- Si aparece a veces, depende de que otra cosa provoque un render. Puedo probar la app, ver que "funciona" y entregarla rota.
- Es dificil de reproducir. Alguien me dice "el numero estaba mal" y cuando yo lo pruebo anda bien.
- Hace que desconfie de partes del codigo que estan bien (el TextInput no tiene la culpa).

**c) Como lo resolvi y comparacion con otras opciones**

En mi app nunca muto una Pila o una Cola que esta guardada en el estado. Cada cambio crea una instancia nueva a partir de la anterior con `aArray()` y despues hago `setState` con esa instancia nueva:

```ts
// src/lib/library.ts:49-53
export function encolarPersona(cola: Cola<string> | undefined, persona: string): Cola<string> {
  const nueva = new Cola(cola ? cola.aArray() : []);
  nueva.encolar(persona);
  return nueva;
}

// src/context/LibraryContext.tsx:73-76
setEsperas((anteriores) => ({
  ...anteriores,
  [libro.isbn]: encolarPersona(anteriores[libro.isbn], USUARIO_ACTUAL),
}));
```

Lo mismo hago con `entregarSiguiente` y `apilarReciente`. Como la referencia cambia, React ve que hay algo nuevo y renderiza.

| Opcion | Ventaja | Costo |
|---|---|---|
| Crear una cola nueva a partir de la anterior (la mia) | El estado nunca se rompe. Cada render ve una foto fija de los datos. Las funciones son puras y las pude testear sin React. | Copio el array en cada cambio. En mi app son 2 o 3 personas por cola, asi que no se nota. Ademas hay que acordarse de no llamar a `encolar` sobre la instancia guardada. |
| Contador de version (`setVersion(v + 1)` despues de mutar) | Es muy rapido de escribir y no copia nada. | Sigue mutando. Si me olvido de subir el contador en un lugar, vuelve el error de "a veces". Y un render viejo puede ver datos que ya cambiaron, porque todos comparten el mismo objeto. |
| `useReducer` | Todas las acciones (encolar, desencolar) quedan en un solo lugar y el reducer se puede testear. | Hay mas codigo (acciones, tipos, switch). Y adentro del reducer igual tengo que devolver una cola nueva: no me ahorra el problema de fondo, solo lo ordena. |

### B4. Donde vive cada dato?

| Dato | Donde vive en mi app | Por que ahi y no en otro lugar |
|---|---|---|
| Texto del buscador | En la URL (`/buscar?q=...`) | Asi un link como `bibliotecaipf://buscar?q=borges` abre la busqueda hecha, y atras/adelante funcionan bien. Solo lo usa la pantalla de busqueda, no tiene sentido ponerlo en el Context. |
| Prestamos y reservas | Context (`prestamos`) | Lo usan muchas pantallas: el Catalogo y el detalle (para calcular disponibles), la confirmacion de reserva, "Mis reservas" y el mostrador. Si fuera estado local de una pantalla, las otras no se enterarian. |
| Listas de espera | Context (`esperas`, un objeto ISBN -> Cola) | Las modifica la reserva (encolar) y el mostrador (desencolar), y las leen el detalle y "Mis reservas". Son pantallas distintas que tienen que ver lo mismo. |
| Vistos recientemente | Context (`recientes`, una Pila) | Lo escribe el detalle y lo lee el Catalogo. Son dos pantallas distintas. |
| Sesion del personal | Context (`sesion`) | La necesita el layout raiz para el `Stack.Protected` y el header del Catalogo para decidir si "Personal" va a `/login` o a `/mostrador`. |
| Ejemplares disponibles de un libro | Se calcula con `calcularDisponibles(libro, prestamos)` | Sale de dos datos que ya tengo: los ejemplares del libro y los prestamos. Si lo guardara aparte tendria el mismo dato en dos lugares y se podrian desincronizar (lo explico en E4 d). |
| Estado del permiso de camara | En el sistema operativo. Mi app lo consulta con `useCameraPermissions` dentro de `usePermiso` | El que manda es el sistema: la persona lo puede cambiar en Ajustes sin pasar por mi app. Si lo guardara en el Context, quedaria viejo. Por eso lo vuelvo a consultar al enfocar la pantalla y al volver a la app. |
| Identificador de la notificacion programada | Context, dentro de cada prestamo (`notificacionId`) | Va pegado al prestamo porque lo necesito para cancelar ese recordatorio al desactivar "Recordarme" o al devolver ese libro. La notificacion en si la guarda el sistema operativo. |

**Que componentes se re-renderizan cuando cambia el value del Context**

Todos los que llaman a `useBiblioteca()`. El `useContext` no mira que parte del valor uso cada componente: si cambia el objeto `value`, se vuelve a renderizar todo el que lo consume.

En mi app el value esta envuelto en `useMemo`, pero cambia cada vez que cambia cualquiera de sus partes. Al activar un recordatorio cambia `prestamos` (se guarda el `notificacionId`), entonces cambia el value. Aunque el Catalogo solo usara `recientes`, se volveria a renderizar igual. En mi caso el Catalogo ademas usa `prestamos` para mostrar los disponibles, asi que ese render si le sirve.

Formas de evitarlo:

- Separar el Context en varios mas chicos (uno para recientes, otro para prestamos y esperas, otro para la sesion). Asi cada pantalla solo escucha lo que usa.
- Usar una libreria de selectores para leer solo una parte del estado.
- Envolver los componentes hijos pesados para que no se repinten si sus props no cambiaron.

No vale la pena en una app de este tamanio. Son pocas pantallas, las listas tienen 15 libros y el React Compiler (activado en `app.json`) ya memoriza los componentes hijos. Partir el Context haria el codigo mas dificil de seguir por una mejora que no se nota. Si algun dia la app crece, primero lo mediria con el Profiler y despues decidiria.

---

## Parte C - Navegacion y rutas

### C1. La pila en mi app

Esto lo saque de los logs de `useRootNavigationState` que puse temporalmente en el layout raiz. Escribo cada pila de base a tope.

| # | Accion | Pilas resultantes |
|---|---|---|
| 1 | Abre la app. | Stack raiz: `[(tabs)]`. Tab activa: Catalogo. Stack de la tab Catalogo: `[index]`. |
| 2 | Toca un libro del Catalogo. | Stack raiz: `[(tabs)]`. Stack de la tab Catalogo: `[index, libro/9789507001017]`. |
| 3 | Toca "Reservar". | Stack raiz: `[(tabs), reservar/[isbn]]` (el modal se abre en el Stack raiz, encima de las tabs). Stack de la tab Catalogo: `[index, libro/...]`, sin cambios. |
| 4 | Toca "Confirmar". | Stack raiz: `[(tabs)]` (el modal se cerro). Tab activa: Mis reservas. Stack de la tab Catalogo: `[index, libro/...]`, sigue igual. |
| 5 | Toca atras (Android). | Stack raiz: `[(tabs)]`. Tab activa: Catalogo, porque las tabs por defecto vuelven a la primera tab al tocar atras (`backBehavior: 'firstRoute'`). Stack de la tab Catalogo: `[index, libro/...]`. La persona ve el detalle de Ficciones. |
| 6 | Toca la tab "Catalogo". | Stack raiz: `[(tabs)]`. Stack de la tab Catalogo: `[index]`. Como la tab ya estaba activa, tocarla otra vez vuelve al principio de su pila. |

**a) Que metodo use en el paso 4**

Use `router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx:27-29`). Que habria pasado con los otros:

- **push:** abriria `/reservas` encima del modal. El modal quedaria debajo en la pila y, al tocar atras, la persona volveria a la pantalla de confirmacion. Podria confirmar dos veces el mismo libro.
- **replace:** cambia el modal por `/reservas`, pero lo hace en el Stack raiz. Como `/reservas` vive adentro de las tabs, se crea una segunda copia del navegador de tabs encima de la primera. Esto lo vi en mi app cuando probe `replace` en el escaner: aparecian dos barras de tabs.
- **dismissTo:** cierra el modal y navega a la ruta que ya existe debajo, la tab "Mis reservas". No duplica nada y "atras" no vuelve a la confirmacion.

Elegi `dismissTo` porque deja la pila limpia y la confirmacion no queda en el historial.

**b) En el paso 6, que ve la persona?**

Depende de desde donde toque. Si viene de "Mis reservas" y toca la tab Catalogo, ve el detalle de Ficciones, porque la pila de esa tab sigue siendo `[index, libro]`: las tabs recuerdan donde quedo cada una. Si ya esta en la tab Catalogo (como despues del paso 5) y la toca otra vez, la pila vuelve a `[index]` y ve el Catalogo. Lo probe en web y pasa exactamente asi.

Me parece correcto, porque es lo que hacen casi todas las apps (Instagram, YouTube, la Play Store):

- Si cambio de tab y vuelvo, quiero seguir donde estaba, no perder lo que estaba mirando.
- Si quiero volver al principio, toco la tab de nuevo.

### C2. El escaner que dispara de mas

**a) Que pasaria con `router.push` sin proteccion**

La camara llama a `onBarcodeScanned` varias veces por segundo mientras el codigo sigue enfocado. Cada llamado haria un `router.push` al detalle. Como vimos en el TP 2, las acciones de navegacion entran en una cola y se procesan una detras de otra, sin juntar las repetidas. El resultado seria el mismo detalle apilado cinco o diez veces, y la persona tendria que tocar atras muchas veces para salir.

**b) useState o useRef?**

Use `useRef` (`src/app/escanear.tsx:18`, `yaNavego`).

Un `useState` puesto en `true` no alcanza porque `setYaNavego(true)` no cambia la variable en el momento. Pide un render nuevo, y recien en ese render nuevo la variable vale `true`. Mientras tanto, todos los llamados a `onBarcodeScanned` que llegan antes de ese render usan la funcion del render viejo, donde la variable sigue en `false`. Pasan todos y navegan todos.

Con `useRef`, `yaNavego.current = true` cambia el valor al instante y lo ve cualquier llamado siguiente, porque la ref es el mismo objeto en todos los renders.

**c) Por que conviene replace para ir del escaner al detalle**

Para que el escaner no quede debajo del detalle. Si usara `push`, al tocar atras desde el detalle la persona volveria a la camara. Como el libro probablemente sigue frente a la camara, se podria leer otra vez y volver a abrir el detalle: un ida y vuelta sin fin. O, con mi ref ya en `true`, veria una camara que no hace nada.

En mi app la idea es la de `replace`, pero lo hago en dos pasos: `router.dismiss()` cierra el escaner y despues `router.push(...)` abre el libro adentro de la tab Catalogo (`src/app/escanear.tsx:31-32`). Lo hice asi porque `replace` desde el escaner, que esta en el Stack raiz, creaba una segunda copia de las tabs. Con dismiss y push queda una sola barra de tabs y atras desde el detalle vuelve al Catalogo, que es lo que esperaria la persona.

**d) Si el ISBN leido no esta en el catalogo**

Muestro un aviso: "El ISBN ... no esta en el catalogo. Proba con otro libro." y la camara sigue escaneando (`src/app/escanear.tsx:26-28`).

Para que el mismo aviso no aparezca diez veces seguidas, guardo el ultimo codigo desconocido en otra ref, `ultimoDesconocido` (lineas 19 y 36-42). Si llega el mismo codigo otra vez, lo ignoro. Si llega un codigo desconocido distinto, actualizo el aviso. Si la persona cierra el aviso y apunta a otro libro, todo sigue funcionando.

### C3. Deep links y rutas protegidas

Los probe en Expo Go con `exp://IP:8081/--/...`. Para abrirlos desde afuera de la app genere codigos QR con esos links y los escanee con Expo Go.

| Link | Que ve la persona | Que queda debajo en la pila | Que parte de mi codigo lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9789507001017` (existe) | El detalle de Ficciones, con el titulo en el header. | El Catalogo (index) en el Stack de la tab, y las tabs en el Stack raiz. Atras vuelve al Catalogo. | `unstable_settings = { anchor: 'index' }` en `src/app/(tabs)/(catalogo)/_layout.tsx:8-10` y `anchor: '(tabs)'` en `src/app/_layout.tsx:11-13`. El contenido lo decide `src/app/(tabs)/(catalogo)/libro/[isbn].tsx`. |
| `bibliotecaipf://libro/123` | "\"123\" no es un ISBN valido: tiene que tener 13 digitos, sin guiones." con el boton "Volver al catalogo". | El Catalogo, igual que arriba. | La validacion en `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:29-44`, que usa `resolverIsbn` de `src/lib/catalog.ts:17-23`. |
| `bibliotecaipf://buscar?q=borges` | El buscador con "borges" escrito y los resultados Ficciones y El Aleph. | Las tabs con el Catalogo. Atras vuelve al Catalogo. | `anchor: '(tabs)'` en `src/app/_layout.tsx` y la lectura de `q` con `useLocalSearchParams` en `src/app/buscar.tsx:17-18`. |
| `bibliotecaipf://mostrador` (sin sesion) | El Catalogo. La pantalla del mostrador no existe para alguien sin sesion. | Nada mas: queda el Catalogo como primera pantalla. | `<Stack.Protected guard={biblioteca.sesion}>` en `src/app/_layout.tsx:31-33`. |
| `bibliotecaipf://reserva` | Termina en la tab "Mis reservas". | Las tabs, con el Catalogo como primera tab. | `<Redirect href="/reservas" />` en `src/app/reserva.tsx`. |
| `bibliotecaipf://escanear` (camara bloqueada) | El escaner con "La camara esta bloqueada. Podes habilitarla desde Ajustes o escribir el ISBN mas abajo.", el boton "Ver como habilitarla" y el ingreso manual del ISBN. | Las tabs con el Catalogo. | El estado `bloqueado` que devuelve `usePermiso` y el bloque de `src/app/escanear.tsx:63-76`. |

**Por que `/libro/123` llega a la pantalla de detalle?**

Porque el router solo mira la forma de la URL, no los datos. La ruta es `libro/[isbn]`, y `[isbn]` es un segmento dinamico que acepta cualquier texto: "123", "abc" o un ISBN real. El router no sabe que libros existen, solo sabe que esa URL tiene la forma de esa pantalla.

La responsabilidad de responder bien es de la pantalla de detalle. Ella recibe el parametro y tiene que validarlo: si no tiene 13 digitos, muestra que el ISBN no es valido; si tiene 13 digitos pero no esta en el catalogo, muestra que no lo encontro. En los dos casos ofrece volver al Catalogo, nunca deja a la persona en una pantalla rota.

### C4. Foco, montaje y primer plano

**a) Que evento detecta cada herramienta**

- **`useEffect` con `[]`:** el montaje. Corre una sola vez, cuando el componente aparece por primera vez. Si la pantalla queda montada (como las tabs), no vuelve a correr.
- **`useFocusEffect`:** que la pantalla gana el foco dentro de la navegacion. Por ejemplo al cambiar de tab y volver, o al cerrar un modal o una pantalla que estaba encima.
- **`AppState`:** que la app entera cambia de estado: pasa a segundo plano (`background`) o vuelve a primer plano (`active`). Por ejemplo al ir a Ajustes y volver.

**b) Quien se entera en cada caso**

- **La persona va a Ajustes, habilita las notificaciones y vuelve:** solo `AppState`. Desde el punto de vista de la navegacion, "Mis reservas" nunca perdio el foco, asi que `useFocusEffect` no corre. Y el componente no se desmonto, asi que el `useEffect` con `[]` tampoco.
- **La persona va a la tab Catalogo y vuelve a "Mis reservas":** solo `useFocusEffect`. La app nunca salio de primer plano, asi que `AppState` no cambia. Y "Mis reservas" sigue montada (lo comprobe en B1 b), asi que el `useEffect` con `[]` no vuelve a correr.

**c) Cual use y por que**

Use las dos: `useFocusEffect` y, adentro de el, una suscripcion a `AppState`. Esta todo en el hook `usePermiso` (`src/hooks/usePermission.ts:23-50`). Asi el estado del permiso se actualiza tanto al volver de Ajustes como al volver de otra pantalla.

Al principio solo usaba `AppState`, y probando encontre justamente un caso con estado viejo: abria el escaner, iba a la pantalla previa de permisos (`/permisos/camara`), concedia el permiso y cerraba el modal. El escaner seguia mostrando "Activar camara" porque nunca se entero, ya que la app no salio a segundo plano. Ahi agregue `useFocusEffect`, y ahora al cerrar el modal el escaner vuelve a consultar el permiso y muestra la camara.

---

## Parte D - Permisos en mi app

### D1. Recorrido completo de la camara

Android 14, app recien instalada.

| # | Accion | Que muestra mi app | status | canAskAgain |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez. | Un instante "Consultando la camara..." y despues "Para escanear el codigo de barras necesitamos usar la camara." con el boton "Activar camara". | `undetermined` | `true` |
| 2 | "Continuar" -> "No permitir". | Vuelve al escaner y sigue mostrando "Activar camara". | `denied` | `true` |
| 3 | Toca "Escanear" otra vez. | Lo mismo: "Activar camara". Si toca el boton ve la pantalla previa con "Continuar". | `denied` | `true` |
| 4 | "Continuar" -> "No permitir". | Ahora muestra "La camara esta bloqueada. Podes habilitarla desde Ajustes o escribir el ISBN mas abajo." | `denied` | `false` |
| 5 | Toca "Escanear" otra vez. | Lo mismo que en el paso 4. En la pantalla previa el unico boton es "Abrir Ajustes". Siempre esta el ingreso manual del ISBN. | `denied` | `false` |
| 6 | "Abrir Ajustes" -> habilita la camara -> vuelve a la app. | La pantalla previa pasa sola a "El permiso ya esta activado" con "Continuar", y al volver al escaner se ve la camara. | `granted` | `true` |

En Android, la segunda vez que la persona dice "No permitir", el sistema deja de mostrar el dialogo para siempre. Por eso `canAskAgain` pasa a `false` recien en el paso 4.

Una aclaracion de lo que vi en mi celular: en Expo Go el dialogo no es el de Android sino uno de Expo Go ("Biblioteca IPF needs permissions for accessing camera...", esta en la captura `11-permission-camera-dialog.jpg`). El recorrido de estados es el mismo, pero el texto del dialogo no es el mio. Lo explico en D3 c.

**a) El mismo recorrido en iOS**

No tengo iPhone, asi que lo razono. En iOS el dialogo del sistema aparece una sola vez. Si la persona dice "No permitir", iOS no lo vuelve a mostrar nunca mas.

El resultado cambia en el paso 2: despues del primer "No permitir" ya queda `status: denied` y `canAskAgain: false`. Mi app muestra "La camara esta bloqueada..." ya en el paso 2, y desde el paso 3 la pantalla previa ofrece "Abrir Ajustes". Los pasos 4 y 5 son iguales al 3. El paso 6 funciona igual que en Android.

**b) La linea que decide entre "Continuar" y "Abrir Ajustes"**

```ts
// src/lib/permissions.ts:17
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

Usa el campo `canAskAgain`. Despues, `PedidoPermiso` (`src/components/PermissionPrompt.tsx:32-34`) muestra "Abrir Ajustes" cuando el estado es `bloqueado`.

No alcanza con mirar `status`, porque `status: 'denied'` significa dos cosas distintas:

- En el paso 2 de Android esta denegado, pero todavia se puede preguntar. Si muestro "Abrir Ajustes", hago dar una vuelta innecesaria.
- En el paso 4 esta denegado y el sistema ya no deja preguntar. Si muestro "Continuar", el boton no hace nada: el dialogo no aparece y la persona queda trabada.

`canAskAgain` es lo que distingue esos dos casos.

**c) En el paso 6, que parte de mi codigo se entera?**

La suscripcion a `AppState` dentro de `usePermiso` (`src/hooks/usePermission.ts:39-43`). Cuando la app vuelve a `active`, vuelvo a consultar el permiso. La pantalla previa ve el permiso concedido y, al cerrarla, el escaner tambien lo vuelve a consultar por el `useFocusEffect`.

Si esa parte no existiera, la app seguiria mostrando "La camara esta bloqueada" y el boton "Abrir Ajustes", aunque el permiso ya este concedido. La persona tendria que cerrar la app y abrirla de nuevo para que funcione, y probablemente pensaria que la app esta rota.

### D2. Notificaciones y consistencia

**a) Activa "Recordarme" y devuelve antes de los 15 segundos**

Si no cancelara la notificacion, a los 15 segundos llegaria "Acordate de devolver Ficciones a la biblioteca" por un libro que ya devolvio. Eso confunde, y hace que la persona deje de confiar en los avisos de la app.

En mi app, `devolver` busca el `notificacionId` del prestamo y llama a `cancelarRecordatorio` antes de borrarlo (`src/context/LibraryContext.tsx:94-103`). Lo mismo hago al apagar el interruptor (lineas 117-126).

**b) Donde guardo el identificador y que pasa si la app se cierra**

Lo guardo en el Context, adentro del prestamo, en el campo `notificacionId`. Es memoria de la app: no lo guardo en el disco.

Si la app se cierra antes de que llegue:

- **La notificacion** llega igual. La programo con el sistema operativo, y el sistema la muestra aunque mi app este cerrada.
- **El identificador** se pierde, junto con todo el estado del Context (prestamos incluidos), porque no tengo persistencia.

El problema: cuando vuelvo a abrir la app, ya no se que notificaciones programe. Si la persona devuelve el libro, no tengo el id para cancelarla. Y si hubiera guardado los prestamos pero no el id, la app mostraria el prestamo con "Recordarme" apagado mientras hay un recordatorio pendiente.

Como lo resolveria:

1. Guardar los prestamos con su `notificacionId` en AsyncStorage (es uno de los desafios opcionales) y cargarlos al iniciar.
2. Al arrancar, comparar contra lo que el sistema tiene programado (`getAllScheduledNotificationsAsync`). Si hay una notificacion que no corresponde a ningun prestamo, la cancelo. Si un prestamo tiene un id que ya no existe, lo pongo en `null`.

**c) Por que en Android 13 o superior el canal se crea antes de pedir el permiso**

En Android 13 aparecio el permiso `POST_NOTIFICATIONS`, que se pide en tiempo de ejecucion como el de la camara. Android solo muestra el dialogo de ese permiso si la app ya tiene al menos un canal de notificaciones creado. Si pido el permiso sin canal, el dialogo puede no aparecer y la respuesta vuelve como denegada. Por eso `pedirPermisoNotificaciones` primero llama a `crearCanalPrestamos()` y despues pide (`src/lib/notifications.ts`).

En Android 12 no existe ese permiso: las notificaciones vienen permitidas por defecto y no aparece ningun dialogo. Pedir el permiso devuelve concedido directamente. El canal sigue siendo necesario (desde Android 8 toda notificacion va en un canal), pero ya no importa si se crea antes o despues de pedir.

Algo que me paso en la prueba: en mi celular, con Expo Go, crear el canal tiraba un error de Android (`NullPointerException` dentro de `setNotificationChannelAsync`). Ese error cortaba todo y el permiso nunca se pedia. Lo corregi envolviendo la creacion del canal en un `try/catch`. Si el canal falla, la app sigue, pide el permiso, y la notificacion sale por el canal de respaldo que trae `expo-notifications`. Revise el codigo nativo de la libreria para confirmar que usa ese canal cuando el pedido no existe. Despues de eso la notificacion llego bien (captura `18-notification-received.jpg`).

**d) Permiso denegado y me entregan un libro desde el mostrador**

Me entero por un aviso dentro de la app, en la pantalla "Mis reservas": "Ya podes retirar ... en el mostrador." Esa pantalla tambien muestra arriba "Notificaciones bloqueadas: los avisos te van a aparecer en esta pantalla".

El codigo que decide esta en `src/context/LibraryContext.tsx:129-143`:

```ts
const avisarEntrega = useCallback(
  async (titulo: string) => {
    if (await tienePermisoNotificaciones()) {
      try {
        await notificarEntrega(titulo);
        return;
      } catch {
        agregarAviso(`Ya podes retirar "${titulo}" en el mostrador.`);
        return;
      }
    }
    agregarAviso(`Ya podes retirar "${titulo}" en el mostrador.`);
  },
  [agregarAviso],
);
```

Consulta el permiso en ese momento: `tienePermisoNotificaciones()` llama a `getPermissionsAsync()` cada vez. No uso un valor guardado.

Importa porque el permiso puede cambiar en cualquier momento desde Ajustes, sin pasar por mi app:

- Si uso un valor viejo que dice "concedido" pero la persona lo desactivo, programo una notificacion que el sistema no muestra. La persona no se entera de nada y el aviso se pierde.
- Si el valor viejo dice "denegado" pero lo habilito, muestro un aviso dentro de la app cuando podria haber mandado la notificacion.

Ademas, si mandar la notificacion falla por otro motivo, caigo igual en el aviso dentro de la app. La persona siempre se entera por algun lado.

### D3. Lo que mi app pide y lo que no

Lo saque de `npx expo config --type introspect` (el AndroidManifest y el Info.plist que se generan) y de los manifest de las librerias nativas.

| Plataforma | Permiso o clave declarada | Funcion de la app que lo justifica | Quien lo agrega |
|---|---|---|---|
| Android | `android.permission.CAMERA` | El escaner de codigo de barras. | El plugin de `expo-camera` (y el manifest de la libreria). |
| Android | `android.permission.POST_NOTIFICATIONS` | El recordatorio de devolucion y el aviso de "tu libro te espera" (Android 13+). | El manifest de la libreria `expo-notifications`. |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Que una notificacion programada siga programada si el telefono se reinicia. | El manifest de la libreria `expo-notifications`. |
| Android | `android.permission.VIBRATE` | Que la notificacion pueda vibrar. | La plantilla base de Expo. |
| Android | `android.permission.INTERNET` | Conectarse al servidor de desarrollo y, a futuro, a una API real. | La plantilla base de Expo. |
| iOS | `NSCameraUsageDescription` = "Usamos tu camara para leer el codigo de barras del libro y abrir su ficha al instante" | El escaner. Es el texto que aparece en el dialogo de iOS. | El plugin de `expo-camera`, con el texto que escribi en `app.json`. |
| iOS | (sin clave para notificaciones) | Las notificaciones locales en iOS no necesitan clave en el Info.plist: se piden en tiempo de ejecucion. | No aplica. |

Ademas bloqueo de forma explicita `RECORD_AUDIO`, ubicacion fina y gruesa, lectura y escritura de almacenamiento y `SYSTEM_ALERT_WINDOW`. En el manifest final aparecen con `tools:node="remove"`. La justificacion de cada uno esta en el README.

**a) Por que mi app no declara RECORD_AUDIO aunque usa expo-camera**

`expo-camera` tambien sirve para grabar video con sonido, y por eso agrega `RECORD_AUDIO` si no le digo lo contrario. Yo solo leo codigos de barras, no grabo nada, asi que no lo necesito. Lo saco de dos formas:

```json
[
  "expo-camera",
  {
    "cameraPermission": "Usamos tu camara para leer el codigo de barras del libro y abrir su ficha al instante",
    "microphonePermission": false,
    "recordAudioAndroid": false,
    "barcodeScannerEnabled": true
  }
]
```

- `"recordAudioAndroid": false` le dice al plugin que no agregue el permiso de audio en Android.
- `"microphonePermission": false` hace lo mismo con la clave del microfono en iOS.

Y como segunda capa, en `"android"`:

```json
"blockedPermissions": [
  "android.permission.RECORD_AUDIO",
  ...
]
```

`blockedPermissions` lo quita aunque alguna libreria lo agregue por su cuenta.

**b) Si manana me piden "elegir una foto de portada desde la galeria"**

Usaria `expo-image-picker`, instalado con `npx expo install expo-image-picker`, y llamaria a `launchImageLibraryAsync` recien cuando la persona toca "Elegir portada".

Permisos:

- **Android:** no necesito ninguno. En las versiones actuales usa el selector de fotos del sistema (Photo Picker), que le da a la app solo la foto elegida. No tengo que sacar `READ_EXTERNAL_STORAGE` de `blockedPermissions`.
- **iOS:** con el selector moderno tampoco hace falta pedir acceso a toda la galeria, pero el plugin agrega la clave `NSPhotoLibraryUsageDescription`. Escribiria un texto de proposito como "Usamos tus fotos para que elijas la portada del libro".

No alcanza con una actualizacion OTA (`eas update`), hace falta una build nueva. Una OTA solo cambia el JavaScript y los assets. `expo-image-picker` trae codigo nativo que no esta adentro de la app instalada, y ademas cambia la configuracion nativa (el plugin y la clave en el Info.plist). Si mandara solo el JavaScript por OTA, la app intentaria usar un modulo nativo que no existe y fallaria.

**c) Que partes no pude verificar del todo en Expo Go**

- **Mi texto de proposito de la camara.** En Expo Go el dialogo que aparece es el de Expo Go, en ingles ("Biblioteca IPF needs permissions for accessing camera. You've already granted permission to another Expo experience..."), no el que escribi en `app.json`. Se ve en mi captura. Pasa porque Expo Go es una app ya compilada, con su propio Info.plist y su propio manifest, y no usa los de mi proyecto.
- **`blockedPermissions` y `recordAudioAndroid`.** Por la misma razon, Expo Go declara sus propios permisos (incluido el microfono, porque otras apps lo usan). Lo que hice fue comprobar el manifest generado con `npx expo config --type introspect`, pero no lo vi instalado.
- **El canal de Android "prestamos".** En Expo Go la creacion del canal fallo, y por eso la notificacion salio en el canal de respaldo. No pude ver mi canal en Ajustes > Notificaciones.
- **El nombre y el color de la notificacion.** La notificacion dice "Expo Go" y no "Biblioteca IPF", y no usa el naranja que puse en el plugin.

Como lo verificaria: hago un development build con `npx expo run:android` (o `eas build --profile development`) y lo instalo en el celular. Ahi:

- El dialogo de la camara tiene que mostrar mi texto.
- Con `adb shell dumpsys package` veo los permisos reales instalados y confirmo que no esta `RECORD_AUDIO`.
- En Ajustes > Apps > Biblioteca IPF > Notificaciones tiene que aparecer el canal "Prestamos".
- La notificacion tiene que llegar con el nombre "Biblioteca IPF".

---

## Parte E - Buenas practicas y decisiones de diseno

### E1. Revision de codigo

**a) Problemas encontrados**

| # | Linea | Clasificacion | Por que sucede | Como lo corrijo |
|---|---|---|---|---|
| 1 | 18-20 | Error de ejecucion / rendimiento | El efecto no tiene array de dependencias, entonces corre despues de cada render. Cada `setLibros` provoca un render y otro pedido: un bucle infinito (lo detallo en el punto b). | Ponerle dependencias. Mejor todavia, usar mi hook `useLibros`, que tiene el array `[intento]`. |
| 2 | 19 | Error de ejecucion | No hay `catch`. `obtenerLibros()` falla 1 de cada 5 veces, y la promesa rechazada queda sin manejar: en desarrollo aparece el error rojo y la persona no ve ningun mensaje ni puede reintentar. | Manejar el error y mostrar un mensaje con "Reintentar". |
| 3 | 19 | Mala practica | No hay limpieza: si la pantalla se desmonta antes de que llegue la respuesta, igual se llama a `setLibros`. Tampoco hay estado de carga, asi que mientras tanto la pantalla esta vacia sin explicacion. | Bandera `cancelado` en la limpieza y estados `cargando`/`error`, como en `useLibros`. |
| 4 | 13-16 | Mala practica | Pide camara y notificaciones apenas se abre la app, sin contexto. La persona no sabe para que son y lo mas probable es que diga que no; en Android, a la segunda negativa queda bloqueado para siempre. | Pedir la camara recien al tocar "Escanear" y las notificaciones al activar "Recordarme", con una pantalla previa que explique el beneficio. |
| 5 | 15 | Advertencia | `requestPermissionsAsync()` devuelve una promesa que nadie espera ni maneja. Si falla, queda un rechazo sin manejar. | Moverlo a donde corresponde (punto 4) y manejar el resultado. |
| 6 | 16 | Advertencia | El array `[]` no incluye `pedirPermiso`, que se usa adentro. El linter de hooks (`react-hooks/exhaustive-deps`) lo marca. | Incluir la dependencia. En este caso igual desaparece al aplicar el punto 4. |
| 7 | 10 y 22 | Mala practica | `any[]` y `libro: any` apagan TypeScript. Si escribo `libro.titlo` no me avisa y en pantalla aparece vacio. | Usar el tipo `Libro` de `src/types`. |
| 8 | 22-30 | Rendimiento | `Fila` esta definida adentro de `Catalogo`. En cada render se crea un componente nuevo, y React desmonta y vuelve a montar todas las filas aunque los datos no cambien. | Sacar `Fila` a su propio archivo en `src/components` (en mi app es `TarjetaLibro`). |
| 9 | 33-36 | Rendimiento | `ScrollView` con `.map` renderiza todos los libros a la vez, aunque no se vean. Con un catalogo grande se pone lento. | Usar `FlatList`, que solo renderiza lo visible. |
| 10 | 35 | Mala practica | `key={i}` usa el indice. Si la lista cambia de orden o se filtra, React confunde una fila con otra. | Usar un dato unico y estable: `keyExtractor={(libro) => libro.isbn}`. |
| 11 | 24 | Mala practica | `'/libro/' + libro.isbn` arma la ruta concatenando texto. Con rutas tipadas se pierde el chequeo y un error de tipeo pasa sin aviso. | `router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } })`. |
| 12 | 25 | Mala practica | Estilos en linea y un color magico (`'#333'`). Se crea un objeto de estilo en cada render y el color no sale del tema; en un fondo oscuro ese gris ni se leeria. | `StyleSheet.create` con colores y tamanios de `src/constants/tema.ts`. |
| 13 | 37-39 | Mala practica (accesibilidad) | Es un boton que solo tiene un icono: sin `accessibilityLabel` ni `accessibilityRole`, un lector de pantalla no sabe que hace. El icono mide 28 y no llega al minimo de 44 x 44 para tocarlo con el dedo. | Agregar `accessibilityRole="button"` y `accessibilityLabel="Escanear codigo de barras"`, y un area tactil de al menos 44 x 44. |
| 14 | 6 | Mala practica (acoplamiento) | La pantalla importa `expo-notifications` directamente. Si manana cambio la forma de notificar, tengo que tocar pantallas. | Que la pantalla dependa de un hook o de `lib/notifications.ts`, como en mi app. |

**b) El efecto sin array de dependencias durante el primer minuto**

1. Primer render: `libros = []`. Despues de pintar corre el efecto y llama a `obtenerLibros()`.
2. A los 800 ms llega la respuesta y se hace `setLibros(datos)`. Como `obtenerLibros()` devuelve una copia nueva cada vez (`LIBROS.map((libro) => ({ ...libro }))`), React ve un array distinto y vuelve a renderizar.
3. Despues de ese render el efecto corre de nuevo, porque no tiene dependencias, y hace otro pedido.
4. A los 800 ms llega, otro `setLibros` con otra copia, otro render, otro pedido. Y asi sin parar.

En un minuto son unos 75 pedidos, uno cada 800 ms. Ademas, 1 de cada 5 falla y, como no hay `catch`, en desarrollo aparece el error rojo una y otra vez (unos 15 en el minuto). La lista se vuelve a dibujar cada 800 ms, el telefono gasta bateria y datos, y con una API real estaria bombardeando al servidor.

Si `obtenerLibros()` devolviera siempre el mismo array, el bucle se cortaria solo:

- El primer `setLibros` cambia de `[]` al array, asi que hay un render y un segundo pedido.
- El segundo `setLibros` recibe exactamente el mismo array. React compara con `Object.is`, ve que es el mismo valor y no renderiza.
- Sin render no hay efecto nuevo, y se queda en 2 pedidos.

El codigo seguiria estando mal, pero el problema quedaria escondido. Eso es peligroso: el dia que la API devuelva copias (como cualquier API real), aparece el bucle.

**c) La pantalla reescrita con lo de mi app**

```tsx
import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { TarjetaLibro } from '../../../components/BookCard';
import { EstadoCargando } from '../../../components/LoadingState';
import { EstadoError } from '../../../components/ErrorState';
import { EstadoVacio } from '../../../components/EmptyState';
import { BotonPrincipal } from '../../../components/PrimaryButton';
import { colores, espaciado } from '../../../constants/tema';
import { useBiblioteca } from '../../../context/LibraryContext';
import { useLibros } from '../../../hooks/useLibros';
import { calcularDisponibles, describirDisponibles } from '../../../lib/library';
import type { Libro } from '../../../types';

function abrirLibro(libro: Libro) {
  router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } });
}

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { prestamos } = useBiblioteca();

  let sinLibros = <EstadoVacio mensaje="Todavia no hay libros en el catalogo." />;
  if (cargando) {
    sinLibros = <EstadoCargando mensaje="Cargando el catalogo..." />;
  } else if (error) {
    sinLibros = <EstadoError mensaje={error} textoAccion="Reintentar" alPresionar={reintentar} />;
  }

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      data={cargando || error ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={
        <BotonPrincipal texto="Escanear" icono="barcode-outline" alPresionar={() => router.push('/escanear')} />
      }
      ListEmptyComponent={sinLibros}
      renderItem={({ item }) => (
        <TarjetaLibro
          libro={item}
          detalle={describirDisponibles(calcularDisponibles(item, prestamos))}
          alPresionar={() => abrirLibro(item)}
        />
      )}
    />
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espaciado.lg, gap: espaciado.md },
});
```

Que cambio:

- **Los datos:** el pedido, la carga, el error y el reintento estan en `useLibros`, con su limpieza.
- **La lista:** `FlatList` con `keyExtractor` por ISBN y un mensaje para cada estado.
- **Los componentes:** la tarjeta es un componente aparte (`TarjetaLibro`), y el boton de escanear tiene texto, rol y tamanio minimo, porque `BotonPrincipal` ya los trae.
- **Los estilos:** salen del tema.
- **Los permisos:** no se piden al abrir. Se piden cuando hacen falta (camara en el escaner, notificaciones en "Recordarme").

La version completa, con el hero, los vistos recientemente y la grilla, es `src/app/(tabs)/(catalogo)/index.tsx`.

**d) Rechazo en la tienda y desinstalacion**

- **El que podria provocar el rechazo en una tienda:** pedir permisos al abrir la app sin contexto (lineas 13-16). Apple revisa que los permisos se pidan cuando la funcion los necesita y que se explique para que son. Pedir camara y notificaciones en la primera pantalla, sin que la persona haya tocado nada relacionado, es un motivo de rechazo conocido en la revision de privacidad. Google Play tambien pide justificar cada permiso sensible.
- **El que haria que una persona la desinstale primero:** el efecto sin dependencias (lineas 18-20). No lo ve como un error claro, pero la app se siente lenta, el telefono se calienta, gasta bateria y datos todo el tiempo, y en algunas versiones aparecen errores. Ademas se suma a lo anterior: lo primero que ve al abrir son dos dialogos de permisos sin explicacion. Es una mala primera impresion que hace que mucha gente la borre en el primer minuto.

### E2. Organizacion y acoplamiento

**a) Que carpetas importan a cuales**

```
app ---------> components, hooks, context, lib, constants, types
components --> hooks (solo PermissionPrompt usa usePermiso), constants, types
context -----> lib, estructuras, data, constants, types
hooks -------> lib, constants, types
lib ---------> data, estructuras, constants, types
estructuras -> (nada)
data --------> types
constants ---> types
types -------> (nada)
```

Las flechas siempre van hacia abajo: de lo que se ve (pantallas) hacia lo que no depende de nada (tipos y datos). Lo revise con grep: ningun archivo fuera de `src/app` importa algo de `src/app`, y ningun componente usa el Context directamente (reciben todo por props).

No hay importaciones "hacia arriba". Si un hook importara algo de `src/app` seria un problema por varias razones:

- Todo archivo dentro de `src/app` es una ruta para Expo Router: importar desde ahi mezcla pantallas con logica.
- Se puede armar un ciclo (la pantalla usa el hook y el hook usa la pantalla), con errores raros de carga.
- El hook ya no se podria reutilizar ni testear solo, porque arrastraria una pantalla entera.

**b) Si el catalogo viniera de una API real**

Siendo honesto, cambiarian mas de dos archivos:

- **`src/lib/api.ts`:** `obtenerLibros` y `buscarLibros` harian `fetch` a la API en lugar de leer `LIBROS`. Este cambio es el esperado.
- **`src/lib/catalog.ts`:** `obtenerLibroPorIsbn`, `resolverIsbn` y `librosConEspera` leen `LIBROS` directamente y de forma sincronica. Con una API tendrian que ser asincronicas.
- **Las pantallas que usan esas funciones sincronicas:** el detalle (`libro/[isbn].tsx`), la confirmacion (`reservar/[isbn].tsx`), el escaner, el mostrador y "Mis reservas" (para el titulo de cada prestamo). Tendrian que esperar una respuesta y mostrar carga y error, como el Catalogo.
- **`src/context/LibraryContext.tsx`:** usa `obtenerLibroPorIsbn` para armar el titulo de las notificaciones.
- **`src/data/libros.ts`:** quedaria solo como dato de prueba.

Eso me dice que el Catalogo y el buscador estan bien desacoplados (dependen de `useLibros` y `useBusqueda`, que dependen de `api.ts`), pero el resto de la app esta acoplado a que los datos esten en memoria y lleguen al instante. La forma de arreglarlo seria que todas las pantallas pidan los libros por un mismo hook, por ejemplo `useLibro(isbn)`, que hoy lee el array local y manana la API. Asi el cambio quedaria en ese hook y en `api.ts`.

**c) Reemplazar usePermiso y la pantalla previa por `<ConPermiso recurso="camara">`**

Que ganaria:

- Menos codigo en cada pantalla: envuelvo la camara y listo.
- Los cuatro estados (cargando, preguntable, bloqueado, concedido) se manejarian siempre igual en todos lados.
- Seria muy facil de leer en el JSX: "esto solo se muestra si hay permiso".

Que perderia:

- El control de cuando y como se pide. El componente decide la interfaz de cada estado, y si una pantalla quiere algo distinto hay que llenarlo de props.
- La pantalla previa como ruta propia (`/permisos/camara`), que hoy se puede abrir desde varios lugares y hasta por deep link.
- La posibilidad de usar el estado del permiso fuera de un bloque de interfaz, por ejemplo para mostrar el texto "Notificaciones permitidas" en "Mis reservas".

Para las notificaciones no me serviria. No hay ninguna pantalla para "envolver": el permiso se pide cuando la persona toca un interruptor, y despues hay que activar el recordatorio de ese prestamo en particular. Ahi necesito un estado y una funcion `pedir()` que pueda llamar desde el `onValueChange`, que es lo que me da `usePermiso`.

Una opcion intermedia que me parece mejor: mantener `usePermiso` como base y construir `<ConPermiso>` arriba de el, solo para la camara. Asi tengo las dos cosas.

### E3. Mapa de fallas

| Situacion | Que ve la persona | Donde se maneja (archivo y linea) |
|---|---|---|
| `obtenerLibros()` falla | "No pudimos cargar el catalogo. Revisa tu conexion e intenta de nuevo." y el boton "Reintentar" (captura `02-catalog-error.jpg`). | `src/hooks/useLibros.ts:32-35` (catch) y `src/app/(tabs)/(catalogo)/index.tsx:46-47` (muestra el error). |
| Se abre `/libro/abc` | "\"abc\" no es un ISBN valido: tiene que tener 13 digitos, sin guiones." con "Volver al catalogo" (igual que la captura de `/libro/123`). | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:29-44` y `src/lib/catalog.ts:17-23`. |
| Se escanea un ISBN que no esta en el catalogo | "El ISBN ... no esta en el catalogo. Proba con otro libro." La camara sigue funcionando y el mismo codigo no repite el aviso. | `src/app/escanear.tsx:26-28` (aviso) y `src/app/escanear.tsx:36-42` (ref que evita repetirlo). |
| La camara esta bloqueada | "La camara esta bloqueada. Podes habilitarla desde Ajustes o escribir el ISBN mas abajo." con "Ver como habilitarla", que lleva a "Abrir Ajustes". El ingreso manual del ISBN siempre esta (captura `12-scanner-blocked.jpg`). | `src/app/escanear.tsx:63-76`, `src/components/PermissionPrompt.tsx:32-34` y `src/lib/permissions.ts:17`. |
| Las notificaciones estan denegadas | En "Mis reservas", el texto "Notificaciones bloqueadas: los avisos te van a aparecer en esta pantalla". Si activa "Recordarme", va a la pantalla previa con "Abrir Ajustes". Las entregas del mostrador llegan como aviso dentro de la app. | `src/app/(tabs)/reservas.tsx:29-34` y `51-55`, y `src/context/LibraryContext.tsx:129-143`. |
| Se intenta reservar un libro ya reservado | "Ya tenes este libro en prestamo o en lista de espera. No hace falta reservarlo de nuevo." con el boton "Ver mis reservas". No se reserva dos veces. | `src/lib/library.ts:39-42` (regla) y `src/app/reservar/[isbn].tsx:23` y `72-73` (pantalla). |
| "Entregar al siguiente" con la lista de espera vacia | El libro deja de aparecer en el mostrador cuando su cola se vacia. Si no queda ninguno: "No hay libros con lista de espera." (captura `15-counter-after.jpg`). Si igual se llegara a llamar con la cola vacia, no cambia nada y muestra "No hay nadie esperando ...". | `src/lib/catalog.ts:26-28` (solo lista libros con espera), `src/app/mostrador.tsx:44` (vacio), `src/lib/library.ts:58-60` (devuelve `null`) y `src/app/mostrador.tsx:23`. |
| Login con clave incorrecta | "Usuario o clave incorrectos. Revisalos e intenta de nuevo." El modal no se cierra. | `src/app/login.tsx:16-20` y `src/context/LibraryContext.tsx:167-173`. |

En ninguna situacion la respuesta es "nada" o "la app se rompe". La unica que encontre rota durante la prueba en el celular fue la del canal de notificaciones en Expo Go (D2 c), y la corregi antes de entregar.

### E4. Decisiones con argumentos

**a) Identificador: ISBN o un id numerico propio**

Me quedo con el ISBN, como parametro de ruta y como `key`.

- Es el dato que tiene el libro impreso en el codigo de barras. El escaner lee el ISBN y lo uso directo en la URL (`/libro/9789507001017`), sin tener que traducirlo a otro id. Lo mismo con los deep links: se entienden a simple vista.
- Dos ediciones del mismo titulo tienen ISBN distintos. Para una biblioteca eso esta bien, porque los ejemplares de cada edicion son distintos (otra editorial, otra traduccion, otras paginas). Si quisiera agruparlas para mostrar "El Aleph" una sola vez, eso seria un dato aparte, no el identificador.
- `useLocalSearchParams` siempre me devuelve texto (o una lista de textos). El ISBN lo trato como texto y lo valido con una expresion regular de 13 digitos (`src/lib/catalog.ts:10`). Con un id numerico tendria que convertir con `Number()`, controlar `NaN`, y cuidar casos como "007" que se convierte en 7. Tratarlo como texto me ahorra eso.

El punto debil son los libros sin ISBN (libros viejos, donaciones, apuntes). Hoy mi app no los soporta. Si aparecieran, agregaria un id interno y dejaria el ISBN como dato opcional para el escaner. Para este catalogo, donde todos tienen ISBN, agregar un id ahora seria complicar sin necesidad.

**b) Estructuras: clase Pila con `#items` o un array en el estado**

Use la clase, con `#items` privado.

Lo que me dio:

- La regla queda garantizada: nadie puede sacar un elemento del medio de la Pila ni meter algo al principio de la Cola, porque `#items` no se puede tocar desde afuera.
- Los nombres (`apilar`, `verTope`, `encolar`, `verFrente`) dicen lo que hago mejor que un `slice(-3)` suelto.
- Pude hacer tests de las estructuras solas, sin React (34 tests en total, varios de Pila y Cola).
- La Cola usa un indice de frente en vez de `shift()`, y eso queda escondido adentro de la clase.

Lo que me complico al combinarla con React:

- Los metodos mutan. Si llamo a `encolar` sobre la cola guardada en el estado, React no se entera: es el problema de la B3. Tuve que escribir funciones (`encolarPersona`, `entregarSiguiente`, `apilarReciente`) que copian la estructura con `aArray()` antes de cambiarla.
- No puedo usar spread (`{ ...cola }`) para copiarla, porque los campos privados no se copian.
- En las herramientas de desarrollo la clase aparece "vacia", porque `#items` no se muestra, y eso hace mas dificil depurar.

Con un array y `[...pila, x]` todo eso sale natural con React. Pero pierdo la garantia de que solo se use como pila. Para este trabajo, donde las estructuras eran parte de lo que habia que mostrar, la clase valio la pena.

**c) Memorizacion: useMemo y useCallback**

Si, los use en el Context.

- **Donde aportan:** el `value` del Context esta envuelto en `useMemo` (`src/context/LibraryContext.tsx:181-214`) y las acciones en `useCallback`. Sin eso, cada render del layout raiz crearia un objeto `value` nuevo, y todas las pantallas que usan `useBiblioteca()` se volverian a renderizar aunque nada haya cambiado. Tambien aporta en `agregarReciente`: el detalle la usa como dependencia de su efecto (`libro/[isbn].tsx:23-27`). Si fuera una funcion nueva en cada render, el efecto correria de nuevo y apilaria el libro otra vez.
- **Donde serian ruido:** por ejemplo, envolver en `useMemo` el calculo de `describirDisponibles(calcularDisponibles(item, prestamos))` de cada tarjeta. Es un `filter` sobre un par de prestamos: memorizarlo cuesta mas (guardar el valor, comparar dependencias) que calcularlo de nuevo. Lo mismo con `useCallback` en un `onPress` que se pasa a un `Pressable` comun, que igual no evita ningun render.

Algo que tengo que aclarar: mi proyecto tiene el React Compiler activado (`"reactCompiler": true` en `app.json`), que agrega memorizacion automatica. Por eso parte de lo que escribi a mano probablemente sea redundante. Lo deje porque hace explicito, para quien lee el codigo, que el `value` del Context tiene que ser estable.

Para comprobarlo en lugar de suponerlo:

- Abriria el Profiler de React DevTools y grabaria una accion (por ejemplo activar un recordatorio), para ver que componentes se renderizaron y por que.
- Otra forma mas simple: un `console.log` temporal en cada pantalla, contando renders con y sin el `useMemo`, como hice en B1 para ver la limpieza.

Si los numeros no cambian, la memorizacion era ruido.

**d) Datos duplicados: ejemplares disponibles**

Los calculo: `calcularDisponibles(libro, prestamos)` resta a los ejemplares del libro los prestamos de ese ISBN que salieron del estante (`src/lib/library.ts:19-24`). No guardo "disponibles" en ningun lado.

El error que aparece cuando un mismo dato vive en dos lugares es que se desincronizan. Por ejemplo, si guardara `disponibles` en el estado:

- al reservar tendria que restar 1 y al devolver sumar 1;
- el dia que me olvide de sumar en algun camino (el mostrador, un error a mitad de camino, un reintento), el numero queda mal para siempre;
- el detalle diria "0 disponibles" con el libro en el estante, o "2 disponibles" con los dos prestados;
- encima no hay forma de saber cual de los dos datos es el correcto.

Mi diseno lo evita porque hay una sola fuente de verdad: la lista de prestamos. Los disponibles se recalculan en cada render a partir de ella, asi que es imposible que no coincidan. Por eso, ademas, los prestamos tienen el campo `origen`: los que vienen del mostrador (un ejemplar devuelto que se entrega al siguiente de la cola) no se restan, porque ese ejemplar no salio del estante.
