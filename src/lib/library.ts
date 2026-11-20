import { DIAS_PRESTAMO } from '../constants/app';
import { Cola } from '../estructuras/queue';
import { Pila } from '../estructuras/stack';
import type { Libro, Prestamo, ResultadoReserva } from '../types';
import { sumarDias } from './dates';

// Reglas de negocio puras: reciben datos y devuelven datos nuevos, nunca mutan lo que reciben.

export type Esperas = Record<string, Cola<string>>;

export function crearEsperas(iniciales: Record<string, string[]>): Esperas {
  const esperas: Esperas = {};
  Object.entries(iniciales).forEach(([isbn, personas]) => {
    esperas[isbn] = new Cola(personas);
  });
  return esperas;
}

export function calcularDisponibles(libro: Libro, prestamos: Prestamo[]): number {
  const prestadosDelEstante = prestamos.filter(
    (prestamo) => prestamo.isbn === libro.isbn && prestamo.origen === 'estante',
  ).length;
  return Math.max(0, libro.ejemplares - prestadosDelEstante);
}

// Posicion empezando en 1, o null si la persona no esta en la cola.
export function posicionEnCola(cola: Cola<string> | undefined, persona: string): number | null {
  const indice = cola ? cola.aArray().indexOf(persona) : -1;
  return indice === -1 ? null : indice + 1;
}

export function evaluarReserva(
  libro: Libro,
  prestamos: Prestamo[],
  cola: Cola<string> | undefined,
  persona: string,
  hoy: Date,
): ResultadoReserva {
  const yaTienePrestamo = prestamos.some((prestamo) => prestamo.isbn === libro.isbn);
  if (yaTienePrestamo || posicionEnCola(cola, persona) !== null) {
    return { tipo: 'duplicado' };
  }
  if (calcularDisponibles(libro, prestamos) > 0) {
    return { tipo: 'prestamo', vence: sumarDias(hoy, DIAS_PRESTAMO) };
  }
  return { tipo: 'espera', posicion: (cola?.tamanio ?? 0) + 1 };
}

export function encolarPersona(cola: Cola<string> | undefined, persona: string): Cola<string> {
  const nueva = new Cola(cola ? cola.aArray() : []);
  nueva.encolar(persona);
  return nueva;
}

export function entregarSiguiente(
  cola: Cola<string> | undefined,
): { cola: Cola<string>; persona: string } | null {
  if (!cola || cola.estaVacia()) {
    return null;
  }
  const nueva = new Cola(cola.aArray());
  const persona = nueva.desencolar();
  return persona === undefined ? null : { cola: nueva, persona };
}

// Si el libro ya esta en el tope se devuelve la misma pila (sin cambios, sin re-render).
export function apilarReciente(pila: Pila<Libro>, libro: Libro): Pila<Libro> {
  if (pila.verTope()?.isbn === libro.isbn) {
    return pila;
  }
  const nueva = new Pila(pila.aArray());
  nueva.apilar(libro);
  return nueva;
}

// Los ultimos del tope, del mas reciente al mas antiguo.
export function obtenerRecientes(pila: Pila<Libro>, cantidad: number): Libro[] {
  return pila.aArray().slice(-cantidad).reverse();
}
