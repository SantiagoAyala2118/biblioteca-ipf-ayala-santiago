import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente } from '../constants/tema';

type Props = {
  mensaje: string;
};

export function EstadoCargando({ mensaje }: Props) {
  return (
    <View style={estilos.contenedor} accessibilityRole="progressbar" accessibilityLabel={mensaje}>
      <ActivityIndicator size="large" color={colores.acento} />
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: fuente.media,
  },
});
