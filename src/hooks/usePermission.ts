import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
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

    // La camara se consulta sola al montar (useCameraPermissions); las notificaciones, aca.
    if (recurso === 'notificaciones') {
      consultar();
    }

    // Al volver de Ajustes la app pasa a "active": se vuelve a consultar el permiso.
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar();
      }
    });

    return () => {
      activo = false;
      suscripcion.remove();
    };
  }, [recurso, consultarCamara]);

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
