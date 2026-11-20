import { useCallback, useEffect, useState } from 'react';

import { DEMORA_BUSQUEDA_MS } from '../constants/app';
import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

const MENSAJE_ERROR = 'No pudimos completar la busqueda. Intenta de nuevo.';

type Respuesta = {
  consulta: string;
  libros: Libro[];
  fallo: boolean;
};

type ResultadoBusqueda = {
  resultados: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useBusqueda(q: string): ResultadoBusqueda {
  const texto = q.trim();
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!texto) {
      return;
    }
    let cancelado = false;

    // Debounce: solo se busca si la persona deja de escribir durante 300 ms.
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(texto);
        if (!cancelado) {
          setRespuesta({ consulta: texto, libros, fallo: false });
        }
      } catch {
        if (!cancelado) {
          setRespuesta({ consulta: texto, libros: [], fallo: true });
        }
      }
    }, DEMORA_BUSQUEDA_MS);

    // Al cambiar el texto: se cancela el temporizador pendiente y se descarta
    // la respuesta de la busqueda anterior aunque llegue despues.
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [texto, intento]);

  const reintentar = useCallback(() => {
    setRespuesta(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  // Solo se muestra la respuesta que corresponde al texto actual.
  const vigente = respuesta !== null && respuesta.consulta === texto;

  return {
    resultados: vigente ? respuesta.libros : [],
    cargando: texto !== '' && !vigente,
    error: vigente && respuesta.fallo ? MENSAJE_ERROR : null,
    reintentar,
  };
}
