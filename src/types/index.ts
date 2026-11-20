export type Libro = {
  isbn: string;        // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;  // ejemplares en el estante al iniciar la app
};

export type OrigenPrestamo = 'estante' | 'mostrador';

export type Prestamo = {
  isbn: string;
  vence: Date;
  notificacionId: string | null;
  origen: OrigenPrestamo;
};

export type Recurso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: Date }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'duplicado' };
