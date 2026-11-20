# Plan - Biblioteca IPF (SDD + ODD)

Objetivo: app "Biblioteca IPF" con Expo SDK 58 y Expo Router que integra componentes, estado y efectos, navegacion,
Pila/Cola y permisos moviles. Las preguntas de las Partes B-E se resuelven despues de aceptar la app.

## Flujo de trabajo

```
Requisito (consigna, seccion)  ->  Spec S## (reglas + output + evidencia)   [spec.md]
   ->  Implementacion (tarea T##, un commit chico)                          [tasks.md]
   ->  Verificacion de Output (la ejecuta el desarrollador y la registra)   [tasks.md]
   ->  Aceptacion (todas las evidencias de la spec en verde; [D] con el flujo en telefono)
```

## Tipos de evidencia

- **[T]** `npx tsc --noEmit` sin errores.
- **[L]** `npx expo lint` sin errores ni warnings, sin `eslint-disable`.
- **[U]** test unitario con `jest-expo` (`npm test`) sobre logica pura.
- **[W]** prueba en ejecucion con `npx expo start --web` en un navegador: navegar URLs, tocar botones, leer pantalla.
  Los casos aleatorios (falla 1 de 5, demoras del buscador) se fuerzan sobreescribiendo `Math.random` desde la consola, sin tocar el codigo.
- **[C]** chequeo estatico: busquedas en el codigo y `npx expo config`.
- **[D]** solo verificable en telefono (camara, notificacion real, dialogos del sistema, atras de Android): `device-test-flow.md`.

## Definicion de terminado (por tarea)

1. Leer la spec.
2. Implementar.
3. Correr [T] + [L] y las evidencias propias de la tarea.
4. Registrar en `tasks.md` "comando: resultado observado".
5. Commit `tipo(modulo): accion`.

Si una evidencia falla se corrige dentro de la misma tarea; no se avanza con algo en rojo.

## Gate final

[T][L][U][W][C] en verde -> flujo fijo en telefono -> correcciones -> aceptacion -> Partes B-E.

## Convenciones

- Archivos en ingles; funciones, componentes y variables en espaniol; sin tildes ni enie.
- Excepciones fijadas por la consigna: rutas de `src/app`, `src/types/index.ts`, `src/lib/api.ts`, `src/data/libros.ts`,
  `src/hooks/useLibros.ts`, `src/constants/tema.ts`, carpeta `src/estructuras/`. `api.ts` y `Libro` se copian literal.

## Arquitectura

```
src/app/
  _layout.tsx                        Stack raiz + BibliotecaProvider + Stack.Protected; anchor '(tabs)'
  (tabs)/_layout.tsx                 Tabs con Ionicons
  (tabs)/(catalogo)/_layout.tsx      Stack de la tab Catalogo; anchor 'index'; link "Personal"
  (tabs)/(catalogo)/index.tsx        /
  (tabs)/(catalogo)/libro/[isbn].tsx /libro/[isbn]
  (tabs)/reservas.tsx                /reservas
  buscar.tsx                         /buscar?q=
  escanear.tsx                       /escanear
  reservar/[isbn].tsx                /reservar/[isbn] (modal)
  permisos/[recurso].tsx             /permisos/[recurso] (modal)
  login.tsx                          /login (modal, solo sin sesion)
  mostrador.tsx                      /mostrador (solo con sesion)
  reserva.tsx                        /reserva -> Redirect a /reservas
  +not-found.tsx                     404
src/types        tipos de dominio
src/data         catalogo y esperas iniciales
src/lib          api simulada, reglas de negocio puras, fechas, permisos, notificaciones
src/estructuras  Pila y Cola
src/hooks        useLibros, useBusqueda, usePermiso
src/context      BibliotecaProvider
src/constants    tema y constantes de la app
src/components   componentes presentacionales (uno por archivo)
```

Regla de dependencias: `app -> components / hooks / context -> lib -> estructuras / data / types / constants`.
Nada importa de `src/app`.

## SOLID (resumen, detalle en S26)

- S: cada archivo una responsabilidad (datos, reglas, estado, efectos, vista).
- O: recursos de permiso descritos en un mapa de configuracion.
- L: `Pila` y `Cola` cumplen el contrato `EstructuraLineal<T>`.
- I: componentes con props minimas.
- D: pantallas dependen de hooks y de `lib`, no de los modulos de Expo directamente.
