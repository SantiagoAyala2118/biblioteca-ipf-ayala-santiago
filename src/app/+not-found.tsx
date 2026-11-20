import { Stack, router, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { EstadoVacio } from '../components/EmptyState';
import { colores, espaciado, fuente } from '../constants/tema';

export default function PantallaNoEncontrada() {
  const ruta = usePathname();

  return (
    <View style={estilos.contenedor}>
      <Stack.Screen options={{ title: 'Pagina no encontrada' }} />
      <Text style={estilos.codigo}>404</Text>
      <EstadoVacio
        icono="compass-outline"
        mensaje={`La direccion "${ruta}" no existe en la biblioteca.`}
        textoAccion="Ir al catalogo"
        alPresionar={() => router.replace('/')}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: espaciado.lg,
    gap: espaciado.lg,
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  codigo: {
    color: colores.acento,
    fontSize: fuente.hero,
    fontWeight: '700',
    textAlign: 'center',
  },
});
