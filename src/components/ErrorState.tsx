import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';
import { BotonPrincipal } from './PrimaryButton';

type Props = {
  mensaje: string;
  textoAccion: string;
  alPresionar: () => void;
};

// Todo error ofrece una accion para salir de el.
export function EstadoError({ mensaje, textoAccion, alPresionar }: Props) {
  return (
    <View style={estilos.contenedor} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={tamanios.iconoPortada} color={colores.error} />
      <Text style={estilos.texto}>{mensaje}</Text>
      <BotonPrincipal texto={textoAccion} alPresionar={alPresionar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    padding: espaciado.xl,
    gap: espaciado.lg,
    backgroundColor: colores.superficie,
    borderRadius: radio.medio,
  },
  texto: {
    color: colores.texto,
    fontSize: fuente.media,
    textAlign: 'center',
  },
});
