import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Recurso } from '../types';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

export const USUARIO_ACTUAL = 'Santiago';

export const CREDENCIALES_PERSONAL = {
  usuario: 'biblioteca',
  clave: 'ipf2026',
} as const;

export const DIAS_PRESTAMO = 7;
export const SEGUNDOS_RECORDATORIO = 15;
export const CANAL_PRESTAMOS = 'prestamos';
export const CANTIDAD_RECIENTES = 3;
export const DEMORA_BUSQUEDA_MS = 300;

type DescripcionRecurso = {
  titulo: string;
  beneficio: string;
  icono: NombreIcono;
};

// Agregar un recurso nuevo es sumar una entrada aca, sin tocar la pantalla de permisos.
export const RECURSOS_PERMISO: Record<Recurso, DescripcionRecurso> = {
  camara: {
    titulo: 'Camara',
    beneficio: 'Con la camara lees el codigo de barras del libro y abris su ficha al instante.',
    icono: 'camera-outline',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Con las notificaciones te avisamos antes de que venza tu prestamo.',
    icono: 'notifications-outline',
  },
};
