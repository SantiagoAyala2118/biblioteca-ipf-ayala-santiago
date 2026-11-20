import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EstadoVacio } from '../../components/EmptyState';
import { PedidoPermiso } from '../../components/PermissionPrompt';
import { RECURSOS_PERMISO } from '../../constants/app';
import { colores, espaciado } from '../../constants/tema';
import { useBiblioteca } from '../../context/LibraryContext';
import { parametroComoTexto } from '../../lib/params';
import { esRecurso } from '../../lib/permissions';
import type { EstadoPermiso } from '../../types';

export default function PantallaPermiso() {
  const parametros = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const recurso = parametroComoTexto(parametros.recurso);
  const isbn = parametroComoTexto(parametros.isbn);
  const { activarRecordatorio } = useBiblioteca();

  if (!esRecurso(recurso)) {
    return (
      <View style={estilos.pantalla}>
        <Stack.Screen options={{ title: 'Permiso' }} />
        <EstadoVacio
          icono="help-circle-outline"
          mensaje="Ese permiso no existe en la app."
          textoAccion="Volver"
          alPresionar={() => router.back()}
        />
      </View>
    );
  }

  // Si se llego desde el interruptor "Recordarme" y el permiso quedo concedido, se activa el recordatorio.
  function terminar(estado: EstadoPermiso) {
    if (recurso === 'notificaciones' && estado === 'concedido' && isbn) {
      activarRecordatorio(isbn);
    }
    router.back();
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: RECURSOS_PERMISO[recurso].titulo }} />
      <PedidoPermiso recurso={recurso} alTerminar={terminar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
});
