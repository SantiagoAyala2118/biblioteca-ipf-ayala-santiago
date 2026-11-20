import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

const MENSAJE_ERROR = 'No pudimos cargar el catalogo. Revisa tu conexion e intenta de nuevo.';

type ResultadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): ResultadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este numero es lo que vuelve a disparar el efecto.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si la pantalla se desmonta (o hay un nuevo intento) antes de que llegue la respuesta, se ignora.
    let cancelado = false;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (!cancelado) {
          setLibros(datos);
        }
      } catch {
        if (!cancelado) {
          setError(MENSAJE_ERROR);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setError(null);
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
