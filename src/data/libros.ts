import type { Libro } from '../types';

export const LIBROS: Libro[] = [
  { isbn: '9789507001017', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, ejemplares: 2 },
  { isbn: '9789507001024', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 0 },
  { isbn: '9789507001031', titulo: 'Rayuela', autor: 'Julio Cortazar', anio: 1963, ejemplares: 1 },
  { isbn: '9789507001048', titulo: 'Bestiario', autor: 'Julio Cortazar', anio: 1951, ejemplares: 3 },
  { isbn: '9789507001055', titulo: 'El principito', autor: 'Antoine de Saint-Exupery', anio: 1943, ejemplares: 0 },
  { isbn: '9789507001062', titulo: 'Martin Fierro', autor: 'Jose Hernandez', anio: 1872, ejemplares: 2 },
  { isbn: '9789507001079', titulo: 'Don Segundo Sombra', autor: 'Ricardo Guiraldes', anio: 1926, ejemplares: 1 },
  { isbn: '9789507001086', titulo: 'La invencion de Morel', autor: 'Adolfo Bioy Casares', anio: 1940, ejemplares: 0 },
  { isbn: '9789507001093', titulo: 'Codigo limpio', autor: 'Robert C. Martin', anio: 2008, ejemplares: 2 },
  { isbn: '9789507001109', titulo: 'Laboratorio de programacion en JavaScript', autor: 'Ana Gomez', anio: 2021, ejemplares: 1 },
  { isbn: '9789507001116', titulo: 'Estructuras de datos en TypeScript', autor: 'Carlos Ruiz', anio: 2022, ejemplares: 0 },
  { isbn: '9789507001123', titulo: 'React Native en accion', autor: 'Laura Diaz', anio: 2023, ejemplares: 2 },
  { isbn: '9789507001130', titulo: 'El tunel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 1 },
  { isbn: '9789507001147', titulo: 'Operacion Masacre', autor: 'Rodolfo Walsh', anio: 1957, ejemplares: 1 },
  { isbn: '9789507001154', titulo: 'Historia de la computacion', autor: 'Marta Lopez', anio: 2019, ejemplares: 2 },
];

export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789507001024': ['Lucia', 'Mateo'],
  '9789507001055': ['Valentina'],
  '9789507001116': ['Tomas', 'Sofia'],
};
