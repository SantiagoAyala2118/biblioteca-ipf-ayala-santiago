import type { EstructuraLineal } from './linear';

// LIFO: el ultimo en entrar es el primero en salir.
export class Pila<T> implements EstructuraLineal<T> {
  #items: T[];

  constructor(iniciales: T[] = []) {
    this.#items = [...iniciales];
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  verTope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  get tamanio(): number {
    return this.#items.length;
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  // Devuelve una copia desde la base hasta el tope.
  aArray(): T[] {
    return [...this.#items];
  }
}
