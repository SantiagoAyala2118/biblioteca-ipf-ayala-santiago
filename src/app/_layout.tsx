import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { opcionesHeader, temaNavegacion } from '../constants/navigation';
import { BibliotecaContext, useEstadoBiblioteca } from '../context/LibraryContext';

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
