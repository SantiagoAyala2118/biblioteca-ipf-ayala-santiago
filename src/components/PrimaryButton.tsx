import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, opacidad, espaciado, fuente, radio, tamanios } from '../constants/tema';

type Props = {
  texto: string;
  alPresionar: () => void;
  variante?: 'relleno' | 'borde';
  icono?: ComponentProps<typeof Ionicons>['name'];
  deshabilitado?: boolean;
};

export function BotonPrincipal({ texto, alPresionar, variante = 'relleno', icono, deshabilitado = false }: Props) {
  const relleno = variante === 'relleno';
  const colorTexto = relleno ? colores.textoSobreAcento : colores.texto;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.base,
        relleno ? estilos.relleno : estilos.borde,
        pressed && estilos.presionado,
        deshabilitado && estilos.deshabilitado,
      ]}
    >
      {icono ? <Ionicons name={icono} size={tamanios.icono} color={colorTexto} /> : null}
      <Text style={[estilos.texto, relleno ? estilos.textoRelleno : estilos.textoBorde]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: tamanios.areaTactilMin,
    paddingHorizontal: espaciado.lg,
    borderRadius: radio.chico,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
  },
  relleno: {
    backgroundColor: colores.acento,
  },
  borde: {
    borderWidth: tamanios.bordeFino,
    borderColor: colores.borde,
  },
  presionado: {
    opacity: opacidad.presionado,
  },
  deshabilitado: {
    opacity: opacidad.deshabilitado,
  },
  texto: {
    fontSize: fuente.media,
    fontWeight: '600',
  },
  textoRelleno: {
    color: colores.textoSobreAcento,
  },
  textoBorde: {
    color: colores.texto,
  },
});
