// Contrato comun de Pila y Cola: lo que cualquier lector de la coleccion puede usar.
export interface EstructuraLineal<T> {
  readonly tamanio: number;
  estaVacia(): boolean;
  aArray(): T[];
}
