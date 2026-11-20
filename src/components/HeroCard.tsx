import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';

type Props = {
  titulo: string;
  descripcion: string;
  children?: ReactNode;
};

// Tarjeta destacada de la parte superior: titulo, bajada y fila de acciones.
export function TarjetaHero({ titulo, descripcion, children }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={estilos.descripcion}>{descripcion}</Text>
      {children ? <View style={estilos.acciones}>{children}</View> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    padding: espaciado.xl,
    gap: espaciado.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.hero,
    fontWeight: '700',
  },
  descripcion: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    marginTop: espaciado.md,
  },
});
