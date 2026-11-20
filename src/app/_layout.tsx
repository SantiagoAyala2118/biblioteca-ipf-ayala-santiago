import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { opcionesHeader, temaNavegacion } from '../constants/navigation';
import { BibliotecaContext, useEstadoBiblioteca } from '../context/LibraryContext';
import { configurarNotificaciones } from '../lib/notifications';

configurarNotificaciones();

// Si se entra por un deep link (por ejemplo /buscar), las tabs quedan debajo en la pila.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  const biblioteca = useEstadoBiblioteca();

  return (
    <BibliotecaContext.Provider value={biblioteca}>
      <ThemeProvider value={temaNavegacion}>
        <StatusBar style="light" />
        <Stack screenOptions={opcionesHeader}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
          <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
          <Stack.Screen name="reservar/[isbn]" options={{ title: 'Confirmar reserva', presentation: 'modal' }} />
          <Stack.Screen name="permisos/[recurso]" options={{ title: 'Permiso', presentation: 'modal' }} />
          <Stack.Protected guard={!biblioteca.sesion}>
            <Stack.Screen name="login" options={{ title: 'Ingreso del personal', presentation: 'modal' }} />
          </Stack.Protected>
          <Stack.Protected guard={biblioteca.sesion}>
            <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </BibliotecaContext.Provider>
  );
}
