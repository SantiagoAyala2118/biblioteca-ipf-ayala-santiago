import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colores, opacidad, radio, tamanios } from '../constants/tema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string;
  alPresionar: () => void;
};

// Boton que solo muestra un icono: la etiqueta es lo que lee el lector de pantalla.
export function BotonIcono({ icono, etiqueta, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Ionicons name={icono} size={tamanios.icono} color={colores.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    width: tamanios.areaTactilMin,
    height: tamanios.areaTactilMin,
    borderRadius: radio.chico,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: opacidad.presionado,
  },
});
