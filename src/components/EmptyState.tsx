import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';
import { BotonPrincipal } from './PrimaryButton';

type Props = {
  mensaje: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
  textoAccion?: string;
  alPresionar?: () => void;
};

export function EstadoVacio({ mensaje, icono = 'library-outline', textoAccion, alPresionar }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={tamanios.iconoPortada} color={colores.textoSecundario} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {textoAccion && alPresionar ? (
        <BotonPrincipal texto={textoAccion} alPresionar={alPresionar} variante="borde" />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
    borderRadius: radio.medio,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.bordeSuave,
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: fuente.media,
    textAlign: 'center',
  },
});
