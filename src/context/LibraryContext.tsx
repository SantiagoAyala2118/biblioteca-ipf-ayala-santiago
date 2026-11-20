import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CREDENCIALES_PERSONAL, DIAS_PRESTAMO, USUARIO_ACTUAL } from '../constants/app';
import { ESPERAS_INICIALES } from '../data/libros';
import { Pila } from '../estructuras/stack';
import { obtenerLibroPorIsbn } from '../lib/catalog';
import { sumarDias } from '../lib/dates';
import {
  cancelarRecordatorio,
  notificarEntrega,
  programarRecordatorio,
  tienePermisoNotificaciones,
} from '../lib/notifications';
import {
  apilarReciente,
  crearEsperas,
  encolarPersona,
  entregarSiguiente,
  evaluarReserva,
  type Esperas,
} from '../lib/library';
import type { Libro, Prestamo, ResultadoReserva } from '../types';

export type Aviso = {
  id: string;
  texto: string;
};

export type ValorBiblioteca = {
  prestamos: Prestamo[];
  esperas: Esperas;
  recientes: Pila<Libro>;
  sesion: boolean;
  avisos: Aviso[];
  reservar: (libro: Libro) => ResultadoReserva;
  devolver: (isbn: string) => void;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => void;
  agregarReciente: (libro: Libro) => void;
  entregarAlSiguiente: (isbn: string) => string | null;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  descartarAviso: (id: string) => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

let contadorAvisos = 0;

function crearAviso(texto: string): Aviso {
  contadorAvisos += 1;
  return { id: `aviso-${contadorAvisos}`, texto };
}

// Crea el estado global. Lo usa una sola vez el layout raiz, que lo provee con BibliotecaContext.
// Solo guarda estado: las decisiones las toman las funciones puras de lib/library.ts.
// Pila y Cola nunca se mutan: cada cambio crea una instancia nueva para que React vea otra referencia.
export function useEstadoBiblioteca(): ValorBiblioteca {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [esperas, setEsperas] = useState<Esperas>(() => crearEsperas(ESPERAS_INICIALES));
  const [recientes, setRecientes] = useState(() => new Pila<Libro>());
  const [sesion, setSesion] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const reservar = useCallback(
    (libro: Libro): ResultadoReserva => {
      const resultado = evaluarReserva(libro, prestamos, esperas[libro.isbn], USUARIO_ACTUAL, new Date());
      if (resultado.tipo === 'prestamo') {
        const nuevo: Prestamo = { isbn: libro.isbn, vence: resultado.vence, notificacionId: null, origen: 'estante' };
        setPrestamos((anteriores) => [...anteriores, nuevo]);
      }
      if (resultado.tipo === 'espera') {
        setEsperas((anteriores) => ({
          ...anteriores,
          [libro.isbn]: encolarPersona(anteriores[libro.isbn], USUARIO_ACTUAL),
        }));
      }
      return resultado;
    },
    [prestamos, esperas],
  );

  const agregarAviso = useCallback((texto: string) => {
    setAvisos((anteriores) => [...anteriores, crearAviso(texto)]);
  }, []);

  const guardarIdentificador = useCallback((isbn: string, notificacionId: string | null) => {
    setPrestamos((anteriores) =>
      anteriores.map((prestamo) => (prestamo.isbn === isbn ? { ...prestamo, notificacionId } : prestamo)),
    );
  }, []);

  // Al devolver se cancela el recordatorio pendiente: si no, llegaria un aviso de un libro ya devuelto.
  const devolver = useCallback(
    (isbn: string) => {
      const identificador = prestamos.find((prestamo) => prestamo.isbn === isbn)?.notificacionId;
      if (identificador) {
        cancelarRecordatorio(identificador);
      }
      setPrestamos((anteriores) => anteriores.filter((prestamo) => prestamo.isbn !== isbn));
    },
    [prestamos],
  );

  const activarRecordatorio = useCallback(
    async (isbn: string) => {
      const titulo = obtenerLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
      try {
        guardarIdentificador(isbn, await programarRecordatorio(titulo));
      } catch {
        agregarAviso(`No pudimos programar el recordatorio de "${titulo}". Revisa la fecha en esta pantalla.`);
      }
    },
    [guardarIdentificador, agregarAviso],
  );

  const desactivarRecordatorio = useCallback(
    (isbn: string) => {
      const identificador = prestamos.find((prestamo) => prestamo.isbn === isbn)?.notificacionId;
      if (identificador) {
        cancelarRecordatorio(identificador);
      }
      guardarIdentificador(isbn, null);
    },
    [prestamos, guardarIdentificador],
  );

  // Decide entre notificacion y aviso dentro de la app consultando el permiso en este momento.
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

  const agregarReciente = useCallback((libro: Libro) => {
    setRecientes((anterior) => apilarReciente(anterior, libro));
  }, []);

  const entregarAlSiguiente = useCallback(
    (isbn: string): string | null => {
      const entrega = entregarSiguiente(esperas[isbn]);
      if (!entrega) {
        return null;
      }
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: entrega.cola }));
      if (entrega.persona === USUARIO_ACTUAL) {
        const titulo = obtenerLibroPorIsbn(isbn)?.titulo ?? 'tu libro';
        const vence = sumarDias(new Date(), DIAS_PRESTAMO);
        setPrestamos((anteriores) => [...anteriores, { isbn, vence, notificacionId: null, origen: 'mostrador' }]);
        avisarEntrega(titulo);
      }
      return entrega.persona;
    },
    [esperas, avisarEntrega],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const correcto = usuario.trim() === CREDENCIALES_PERSONAL.usuario && clave === CREDENCIALES_PERSONAL.clave;
    if (correcto) {
      setSesion(true);
    }
    return correcto;
  }, []);

  const cerrarSesion = useCallback(() => setSesion(false), []);

  const descartarAviso = useCallback((id: string) => {
    setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id));
  }, []);

  const valor = useMemo(
    () => ({
      prestamos,
      esperas,
      recientes,
      sesion,
      avisos,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      agregarReciente,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    }),
    [
      prestamos,
      esperas,
      recientes,
      sesion,
      avisos,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      agregarReciente,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    ],
  );

  return valor;
}

export function useBiblioteca(): ValorBiblioteca {
  const valor = useContext(BibliotecaContext);
  if (!valor) {
    throw new Error('useBiblioteca debe usarse dentro de BibliotecaContext');
  }
  return valor;
}
