# Flujo fijo de prueba en el telefono

Objetivo: validar en un telefono real lo que no se puede comprobar en web (camara, dialogos del sistema,
notificaciones, boton atras de Android) y sacar las capturas que pide la consigna (F2.4).

Como reportar un problema: numero de paso + que viste (y captura si se puede).

## Preparacion

1. En la PC, dentro del proyecto: `npx expo start`.
2. En el telefono, abrir Expo Go y escanear el QR.
3. Si la app ya estaba instalada en Expo Go con permisos dados, quitarlos desde Ajustes > Apps > Expo Go > Permisos
   (camara y notificaciones), para arrancar "de cero".

Marcas: **[CAPTURA]** = sacar captura para la entrega.

## A. Catalogo

| # | Hace esto | Deberias ver esto |
|---|---|---|
| A1 | Abri la app. | Durante menos de un segundo, "Cargando el catalogo..." **[CAPTURA cargando]**. Despues, la grilla de libros **[CAPTURA con datos]**. |
| A2 | Sacudi el telefono > "Reload" varias veces hasta que falle (1 de cada 5). | "No pudimos cargar el catalogo..." con boton "Reintentar" **[CAPTURA con error]**. |
| A3 | Toca "Reintentar". | Vuelve a cargar y aparece la grilla (si vuelve a fallar, toca de nuevo). |
| A4 | Abri 4 libros distintos (toca cada tarjeta y volve con atras). | "Vistos recientemente" muestra los 3 ultimos, el mas reciente primero. |

## B. Buscador

| # | Hace esto | Deberias ver esto |
|---|---|---|
| B1 | Toca "Buscar" y escribi rapido `borges`. | Solo "Ficciones" y "El Aleph" **[CAPTURA buscador]**. |
| B2 | Borra todo. | "Escribi un titulo o un autor para buscar." |
| B3 | Escribi `zzz`. | "No encontramos libros para "zzz"." |
| B4 | Toca atras (Android). | Vuelve al Catalogo de una sola vez (escribir no apilo pantallas). |

## C. Detalle y reservas

| # | Hace esto | Deberias ver esto |
|---|---|---|
| C1 | Toca "Ficciones" > "Reservar". | Modal: "Hay ejemplares disponibles... lo devolves el (hoy + 7 dias)". |
| C2 | Toca "Confirmar prestamo". | Se abre "Mis reservas" con el prestamo de Ficciones **[CAPTURA reserva con ejemplares]**. |
| C3 | Toca atras (Android). | No vuelve a la confirmacion. |
| C4 | Volve al Catalogo > "El Aleph" > "Reservar". | "No quedan ejemplares... posicion 3". |
| C5 | Toca "Confirmar lista de espera". | En "Mis reservas", El Aleph en posicion 3 **[CAPTURA reserva sin ejemplares]**. |
| C6 | Volve a El Aleph > "Reservar". | "Ya tenes este libro en prestamo o en lista de espera" y no deja confirmar. |

## D. Escaner (Android)

| # | Hace esto | Deberias ver esto | Captura |
|---|---|---|---|
| D1 | Catalogo > "Escanear". | Unos instantes "Consultando la camara..." y luego "Para escanear... necesitamos usar la camara" + "Activar camara". | **[CAPTURA cargando y preguntable]** |
| D2 | "Activar camara" > "Continuar" > en el dialogo del sistema "No permitir". | Vuelve al escaner, sigue en "Activar camara". | |
| D3 | "Activar camara" > "Continuar" > "No permitir" otra vez. | Ahora dice "La camara esta bloqueada..." con "Ver como habilitarla". | **[CAPTURA bloqueado]** |
| D4 | Escribi un ISBN a mano: `9789507001031`. | Abre "Rayuela". Atras vuelve al Catalogo (no al escaner). | |
| D5 | "Escanear" > "Ver como habilitarla" > "Abrir Ajustes" > habilita la camara > volve a la app. | El escaner pasa solo a mostrar la camara. | **[CAPTURA concedido]** |
| D6 | Apunta al codigo de barras de un libro que NO este en el catalogo y mantenelo. | Un unico aviso "El ISBN ... no esta en el catalogo" (no se repite). | |
| D7 | Apunta al codigo de uno de tus 2 libros reales del catalogo y mantenelo. | Abre su detalle una sola vez. | |

## E. Recordatorio (notificaciones)

| # | Hace esto | Deberias ver esto |
|---|---|---|
| E1 | "Mis reservas" > en el prestamo de Ficciones activa "Recordarme". | Pantalla previa de Notificaciones con "Continuar". |
| E2 | "Continuar" > "Permitir". | Vuelve a Mis reservas con el interruptor activado. |
| E3 | Espera 15 segundos (podes salir de la app). | Llega "Recordatorio de devolucion" **[CAPTURA notificacion recibida]**. |
| E4 | Activa "Recordarme" de nuevo y antes de 15 s toca "Devolver". | No llega ninguna notificacion. |

## F. Mostrador

| # | Hace esto | Deberias ver esto |
|---|---|---|
| F1 | Catalogo > "Personal". Usuario `biblioteca`, clave `mala` > Ingresar. | "Usuario o clave incorrectos..." |
| F2 | Clave `ipf2026` > Ingresar. | El modal se cierra solo. |
| F3 | "Personal" otra vez. | Mostrador con El Aleph, El principito y Estructuras **[CAPTURA mostrador antes]**. |
| F4 | En El Aleph, "Entregar al siguiente" 3 veces. | Entregado a Lucia, a Mateo y a Santiago; El Aleph desaparece de la lista **[CAPTURA mostrador despues]**. |
| F5 | Con notificaciones permitidas: al entregarte a vos llega "Tu libro te espera". Sin permiso: en Mis reservas aparece el aviso "Ya podes retirar..." | |
| F6 | "Cerrar sesion". Toca atras. | Vuelve al Catalogo y el mostrador ya no esta en el historial. |

## G. Deep links y 404

Con el telefono conectado por USB (depuracion USB activa) y la IP que muestra `npx expo start`:

```bash
adb shell am start -a android.intent.action.VIEW -d "exp://IP:8081/--/libro/123"
```

| # | Ruta (reemplaza el final del link) | Deberias ver esto |
|---|---|---|
| G1 | `/--/libro/9789507001017` | Detalle de Ficciones; atras vuelve al Catalogo. |
| G2 | `/--/libro/123` | "No es un ISBN valido" con boton al Catalogo **[CAPTURA detalle inexistente]**. |
| G3 | `/--/buscar?q=borges` | Buscador con resultados; atras deja las tabs. |
| G4 | `/--/mostrador` (sin sesion) | Redirige al Catalogo. |
| G5 | `/--/reserva` | Termina en Mis reservas. |
| G6 | `/--/escanear` (camara bloqueada) | Escaner con aviso de bloqueo e ingreso manual. |
| G7 | `/--/cualquier-cosa` | Pantalla 404 que muestra "/cualquier-cosa" **[CAPTURA 404]**. |
