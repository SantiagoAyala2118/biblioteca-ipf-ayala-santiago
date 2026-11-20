import type { EstadoPermiso, Recurso } from '../types';

// Lo minimo que necesitamos de la respuesta de cualquier permiso de Expo.
export type RespuestaPermiso = {
  granted: boolean;
  canAskAgain: boolean;
};

// granted decide si se puede usar; canAskAgain decide entre "Continuar" y "Abrir Ajustes".
export function aEstadoPermiso(respuesta: RespuestaPermiso | null): EstadoPermiso {
  if (!respuesta) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function esRecurso(valor: string): valor is Recurso {
  return valor === 'camara' || valor === 'notificaciones';
}
