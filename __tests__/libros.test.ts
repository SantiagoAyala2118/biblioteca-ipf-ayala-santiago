import { describe, expect, it } from '@jest/globals';

import { ESPERAS_INICIALES, LIBROS } from '../src/data/libros';

describe('catalogo de libros', () => {
  it('tiene al menos 15 libros', () => {
    expect(LIBROS.length).toBeGreaterThanOrEqual(15);
  });

  it('usa ISBN de 13 digitos sin guiones y sin repetir', () => {
    const isbns = LIBROS.map((libro) => libro.isbn);
    isbns.forEach((isbn) => expect(isbn).toMatch(/^\d{13}$/));
    expect(new Set(isbns).size).toBe(isbns.length);
  });

  it('incluye libros sin ejemplares', () => {
    expect(LIBROS.some((libro) => libro.ejemplares === 0)).toBe(true);
  });

  it('tiene al menos dos listas de espera iniciales de una o dos personas en libros sin ejemplares', () => {
    const entradas = Object.entries(ESPERAS_INICIALES);
    expect(entradas.length).toBeGreaterThanOrEqual(2);
    entradas.forEach(([isbn, personas]) => {
      const libro = LIBROS.find((l) => l.isbn === isbn);
      expect(libro?.ejemplares).toBe(0);
      expect(personas.length).toBeGreaterThanOrEqual(1);
      expect(personas.length).toBeLessThanOrEqual(2);
    });
  });
});
