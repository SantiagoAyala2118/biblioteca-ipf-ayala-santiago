import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '../constants/app';
import type { RespuestaPermiso } from './permissions';

// Unico archivo que conoce expo-notifications: el resto de la app usa estas funciones.

export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// En Android 8+ toda notificacion necesita un canal. En Android 13+ el dialogo de permiso
// recien aparece cuando existe al menos un canal, por eso se crea antes de pedir.
// Si crear el canal falla (pasa en algunos Android con Expo Go), se sigue igual:
// la notificacion usa el canal de respaldo de expo-notifications y el pedido de permiso no se corta.
export async function crearCanalPrestamos(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
      name: 'Prestamos',
      importance: AndroidImportance.HIGH,
    });
  } catch {
    // Sin canal propio, Android muestra la notificacion en el canal de respaldo.
  }
}

export async function obtenerPermisoNotificaciones(): Promise<RespuestaPermiso> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted, canAskAgain };
}

export async function pedirPermisoNotificaciones(): Promise<RespuestaPermiso> {
  await crearCanalPrestamos();
  const { granted, canAskAgain } = await Notifications.requestPermissionsAsync();
  return { granted, canAskAgain };
}

// Se consulta en el momento: el permiso pudo cambiar en Ajustes desde la ultima vez.
export async function tienePermisoNotificaciones(): Promise<boolean> {
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

// Modo demostracion: el recordatorio llega a los 15 segundos. Devuelve el identificador.
export async function programarRecordatorio(titulo: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolucion',
      body: `Acordate de devolver "${titulo}" a la biblioteca.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(identificador: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identificador);
  } catch {
    // Si ya se mostro o no existe, no hay nada que cancelar.
  }
}

export async function notificarEntrega(titulo: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu libro te espera',
      body: `Ya podes retirar "${titulo}" en el mostrador.`,
    },
    trigger: { channelId: CANAL_PRESTAMOS },
  });
}
