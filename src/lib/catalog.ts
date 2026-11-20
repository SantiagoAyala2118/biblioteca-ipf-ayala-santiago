import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

export type ResultadoBusquedaIsbn =
  | { estado: 'invalido' }
  | { estado: 'inexistente' }
  | { estado: 'encontrado'; libro: Libro };

export function esIsbnValido(isbn: string): boolean {
  return /^\d{13}$/.test(isbn);
}

export function obtenerLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}

export function resolverIsbn(isbn: string): ResultadoBusquedaIsbn {
  if (!esIsbnValido(isbn)) {
    return { estado: 'invalido' };
  }
  const libro = obtenerLibroPorIsbn(isbn);
  return libro ? { estado: 'encontrado', libro } : { estado: 'inexistente' };
}
