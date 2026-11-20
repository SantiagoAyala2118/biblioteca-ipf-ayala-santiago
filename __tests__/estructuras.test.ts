import { describe, expect, it } from '@jest/globals';

import type { EstructuraLineal } from '../src/estructuras/linear';
import { Cola } from '../src/estructuras/queue';
import { Pila } from '../src/estructuras/stack';

describe('Pila', () => {
  it('devuelve los elementos en orden LIFO', () => {
    const pila = new Pila<number>();
    pila.apilar(1);
    pila.apilar(2);
    pila.apilar(3);
    expect(pila.desapilar()).toBe(3);
    expect(pila.desapilar()).toBe(2);
    expect(pila.tamanio).toBe(1);
  });

  it('verTope no quita el elemento', () => {
    const pila = new Pila(['a', 'b']);
    expect(pila.verTope()).toBe('b');
    expect(pila.tamanio).toBe(2);
  });

  it('desapilar una pila vacia devuelve undefined', () => {
    const pila = new Pila<string>();
    expect(pila.desapilar()).toBeUndefined();
    expect(pila.estaVacia()).toBe(true);
  });

  it('aArray devuelve una copia que no modifica la pila', () => {
    const pila = new Pila([1, 2]);
    const copia = pila.aArray();
    copia.push(99);
    expect(pila.aArray()).toEqual([1, 2]);
  });
});

describe('Cola', () => {
  it('devuelve los elementos en orden FIFO', () => {
    const cola = new Cola<string>();
    cola.encolar('Ana');
    cola.encolar('Beto');
    cola.encolar('Caro');
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.desencolar()).toBe('Beto');
    expect(cola.aArray()).toEqual(['Caro']);
  });

  it('desencolar una cola vacia devuelve undefined y no rompe el tamanio', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
    cola.encolar('Ana');
    expect(cola.tamanio).toBe(1);
  });

  it('verFrente muestra al primero sin quitarlo', () => {
    const cola = new Cola(['Lucia', 'Mateo']);
    expect(cola.verFrente()).toBe('Lucia');
    expect(cola.tamanio).toBe(2);
  });

  it('el tamanio se mantiene correcto al mezclar encolar y desencolar', () => {
    const cola = new Cola([1, 2]);
    cola.desencolar();
    cola.encolar(3);
    cola.desencolar();
    expect(cola.tamanio).toBe(1);
    expect(cola.aArray()).toEqual([3]);
  });
});

describe('contrato EstructuraLineal', () => {
  const casos: [string, EstructuraLineal<number>][] = [
    ['Pila', new Pila([1, 2, 3])],
    ['Cola', new Cola([1, 2, 3])],
  ];

  it.each(casos)('%s cumple el contrato de lectura', (_nombre, estructura) => {
    expect(estructura.tamanio).toBe(3);
    expect(estructura.estaVacia()).toBe(false);
    expect(estructura.aArray()).toHaveLength(3);
  });
});
