import { useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { obtenerPermisoNotificaciones, pedirPermisoNotificaciones } from '../lib/notifications';
import { aEstadoPermiso, type RespuestaPermiso } from '../lib/permissions';
import type { EstadoPermiso, Recurso } from '../types';

type ResultadoPermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
};

export function usePermiso(recurso: Recurso): ResultadoPermiso {
  const [respuestaCamara, pedirCamara, consultarCamara] = useCameraPermissions();
  const [respuestaNotificaciones, setRespuestaNotificaciones] = useState<RespuestaPermiso | null>(null);

  // Se vuelve a consultar el permiso en dos momentos:
  // 1. cuando la pantalla gana el foco (por ejemplo, al cerrar el modal /permisos/...);
  // 2. cuando la app vuelve a primer plano (por ejemplo, al regresar de Ajustes).
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function consultar() {
        if (recurso === 'camara') {
          await consultarCamara();
          return;
        }
        const respuesta = await obtenerPermisoNotificaciones();
        if (activo) {
          setRespuestaNotificaciones(respuesta);
        }
      }

      consultar();
      const suscripcion = AppState.addEventListener('change', (estadoApp) => {
        if (estadoApp === 'active') {
          consultar();
        }
      });

      return () => {
        activo = false;
        suscripcion.remove();
      };
    }, [recurso, consultarCamara]),
  );

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    if (recurso === 'camara') {
      return aEstadoPermiso(await pedirCamara());
    }
    const respuesta = await pedirPermisoNotificaciones();
    setRespuestaNotificaciones(respuesta);
    return aEstadoPermiso(respuesta);
  }, [recurso, pedirCamara]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  const respuesta = recurso === 'camara' ? respuestaCamara : respuestaNotificaciones;
  return { estado: aEstadoPermiso(respuesta), pedir, abrirAjustes };
}
