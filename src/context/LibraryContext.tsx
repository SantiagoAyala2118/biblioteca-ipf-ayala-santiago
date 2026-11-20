import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { CREDENCIALES_PERSONAL, DIAS_PRESTAMO, USUARIO_ACTUAL } from '../constants/app';
import { ESPERAS_INICIALES } from '../data/libros';
import { Pila } from '../estructuras/stack';
import { obtenerLibroPorIsbn } from '../lib/catalog';
import { sumarDias } from '../lib/dates';
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

type ValorBiblioteca = {
  prestamos: Prestamo[];
  esperas: Esperas;
  recientes: Pila<Libro>;
  sesion: boolean;
  avisos: Aviso[];
  reservar: (libro: Libro) => ResultadoReserva;
  devolver: (isbn: string) => void;
  agregarReciente: (libro: Libro) => void;
  entregarAlSiguiente: (isbn: string) => string | null;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  descartarAviso: (id: string) => void;
};

const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

let contadorAvisos = 0;

function crearAviso(texto: string): Aviso {
  contadorAvisos += 1;
  return { id: `aviso-${contadorAvisos}`, texto };
}

// El Context solo guarda estado: las decisiones las toman las funciones puras de lib/library.ts.
// Pila y Cola nunca se mutan: cada cambio crea una instancia nueva para que React vea otra referencia.
export function BibliotecaProvider({ children }: { children: ReactNode }) {
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

  const devolver = useCallback((isbn: string) => {
    setPrestamos((anteriores) => anteriores.filter((prestamo) => prestamo.isbn !== isbn));
  }, []);

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
        setAvisos((anteriores) => [...anteriores, crearAviso(`Ya podes retirar "${titulo}" en el mostrador.`)]);
      }
      return entrega.persona;
    },
    [esperas],
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
      agregarReciente,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    }),
    [prestamos, esperas, recientes, sesion, avisos, reservar, devolver, agregarReciente, entregarAlSiguiente, iniciarSesion, cerrarSesion, descartarAviso],
  );

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>;
}

export function useBiblioteca(): ValorBiblioteca {
  const valor = useContext(BibliotecaContext);
  if (!valor) {
    throw new Error('useBiblioteca debe usarse dentro de BibliotecaProvider');
  }
  return valor;
}
