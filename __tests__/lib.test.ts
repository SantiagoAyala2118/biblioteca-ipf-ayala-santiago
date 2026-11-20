import { describe, expect, it } from '@jest/globals';

import { Cola } from '../src/estructuras/queue';
import { Pila } from '../src/estructuras/stack';
import { esIsbnValido, librosConEspera, resolverIsbn } from '../src/lib/catalog';
import { formatearFecha, sumarDias } from '../src/lib/dates';
import {
  apilarReciente,
  calcularDisponibles,
  describirDisponibles,
  encolarPersona,
  entregarSiguiente,
  evaluarReserva,
  obtenerRecientes,
  posicionEnCola,
} from '../src/lib/library';
import { parametroComoTexto } from '../src/lib/params';
import type { Libro, Prestamo } from '../src/types';

const conStock: Libro = { isbn: '1111111111111', titulo: 'A', autor: 'X', anio: 2000, ejemplares: 1 };
const sinStock: Libro = { isbn: '2222222222222', titulo: 'B', autor: 'Y', anio: 2001, ejemplares: 0 };
const otro: Libro = { isbn: '3333333333333', titulo: 'C', autor: 'Z', anio: 2002, ejemplares: 1 };
const libroD: Libro = { isbn: '4444444444444', titulo: 'D', autor: 'W', anio: 2003, ejemplares: 1 };
const hoy = new Date(2026, 10, 20);

function prestamo(isbn: string, origen: Prestamo['origen'] = 'estante'): Prestamo {
  return { isbn, vence: hoy, notificacionId: null, origen };
}

describe('catalog', () => {
  it('valida ISBN de exactamente 13 digitos', () => {
    expect(esIsbnValido('9789507001017')).toBe(true);
    expect(esIsbnValido('abc')).toBe(false);
    expect(esIsbnValido('123')).toBe(false);
    expect(esIsbnValido('978950700101x')).toBe(false);
  });

  it('distingue invalido, inexistente y encontrado', () => {
    expect(resolverIsbn('abc').estado).toBe('invalido');
    expect(resolverIsbn('1234567890123').estado).toBe('inexistente');
    expect(resolverIsbn('9789507001017').estado).toBe('encontrado');
  });
});

describe('libros con espera', () => {
  it('devuelve solo los libros con alguien esperando', () => {
    const libros = librosConEspera((isbn) => (isbn === '9789507001024' ? 2 : 0));
    expect(libros.map((libro) => libro.titulo)).toEqual(['El Aleph']);
  });
});

describe('params y fechas', () => {
  it('normaliza parametros de ruta', () => {
    expect(parametroComoTexto('a')).toBe('a');
    expect(parametroComoTexto(['b', 'c'])).toBe('b');
    expect(parametroComoTexto(undefined)).toBe('');
  });

  it('suma 7 dias y formatea la fecha', () => {
    expect(formatearFecha(sumarDias(hoy, 7))).toBe('27/11/2026');
  });
});

describe('reglas de reserva', () => {
  it('con ejemplares la reserva es un prestamo a 7 dias', () => {
    const resultado = evaluarReserva(conStock, [], undefined, 'Santiago', hoy);
    expect(resultado).toEqual({ tipo: 'prestamo', vence: sumarDias(hoy, 7) });
  });

  it('sin ejemplares entra a la lista de espera al final', () => {
    const cola = new Cola(['Lucia', 'Mateo']);
    expect(evaluarReserva(sinStock, [], cola, 'Santiago', hoy)).toEqual({ tipo: 'espera', posicion: 3 });
  });

  it('no permite reservar dos veces el mismo libro', () => {
    expect(evaluarReserva(conStock, [prestamo(conStock.isbn)], undefined, 'Santiago', hoy).tipo).toBe('duplicado');
    const cola = new Cola(['Santiago']);
    expect(evaluarReserva(sinStock, [], cola, 'Santiago', hoy).tipo).toBe('duplicado');
  });

  it('describe los disponibles en singular y plural', () => {
    expect(describirDisponibles(0)).toBe('Sin ejemplares');
    expect(describirDisponibles(1)).toBe('1 disponible');
    expect(describirDisponibles(3)).toBe('3 disponibles');
  });

  it('los prestamos del estante descuentan disponibles y los del mostrador no', () => {
    expect(calcularDisponibles(conStock, [prestamo(conStock.isbn)])).toBe(0);
    expect(calcularDisponibles(conStock, [prestamo(conStock.isbn, 'mostrador')])).toBe(1);
  });

  it('encolar devuelve una cola nueva sin modificar la anterior', () => {
    const original = new Cola(['Lucia']);
    const nueva = encolarPersona(original, 'Santiago');
    expect(original.aArray()).toEqual(['Lucia']);
    expect(nueva.aArray()).toEqual(['Lucia', 'Santiago']);
    expect(posicionEnCola(nueva, 'Santiago')).toBe(2);
    expect(posicionEnCola(nueva, 'Nadie')).toBeNull();
  });

  it('entregar al siguiente desencola al frente en una cola nueva', () => {
    const original = new Cola(['Lucia', 'Mateo']);
    const resultado = entregarSiguiente(original);
    expect(resultado?.persona).toBe('Lucia');
    expect(resultado?.cola.aArray()).toEqual(['Mateo']);
    expect(original.tamanio).toBe(2);
  });

  it('entregar con la cola vacia no hace nada', () => {
    expect(entregarSiguiente(new Cola<string>())).toBeNull();
    expect(entregarSiguiente(undefined)).toBeNull();
  });
});

describe('vistos recientemente', () => {
  it('muestra los 3 del tope del mas reciente al mas antiguo', () => {
    let pila = new Pila<Libro>();
    [conStock, sinStock, otro, libroD].forEach((libro) => {
      pila = apilarReciente(pila, libro);
    });
    expect(obtenerRecientes(pila, 3).map((l) => l.titulo)).toEqual(['D', 'C', 'B']);
  });

  it('no apila de nuevo el libro que ya esta en el tope', () => {
    const pila = apilarReciente(new Pila<Libro>(), conStock);
    const misma = apilarReciente(pila, conStock);
    expect(misma).toBe(pila);
    expect(misma.tamanio).toBe(1);
  });
});
