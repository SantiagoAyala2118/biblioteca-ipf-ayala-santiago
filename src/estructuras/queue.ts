import type { EstructuraLineal } from './linear';

// FIFO: el primero en entrar es el primero en salir.
// En lugar de shift() (que reacomoda todo el array) se avanza un indice de frente.
export class Cola<T> implements EstructuraLineal<T> {
  #items: T[];
  #frente = 0;

  constructor(iniciales: T[] = []) {
    this.#items = [...iniciales];
  }

  encolar(item: T): void {
    this.#items.push(item);
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items[this.#frente];
    this.#frente += 1;
    return item;
  }

  verFrente(): T | undefined {
    return this.estaVacia() ? undefined : this.#items[this.#frente];
  }

  get tamanio(): number {
    return this.#items.length - this.#frente;
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  // Devuelve una copia desde el frente hasta el final.
  aArray(): T[] {
    return this.#items.slice(this.#frente);
  }
}
