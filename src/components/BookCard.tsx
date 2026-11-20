import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, opacidad, espaciado, fuente, radio, tamanios } from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
  detalle: string;
  alPresionar: () => void;
};

// Tarjeta de la grilla: portada arriba, titulo, autor y un pie con un dato.
export function TarjetaLibro({ libro, detalle, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}. ${detalle}`}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
    >
      <View style={estilos.portada}>
        <Ionicons name="book" size={tamanios.iconoPortada} color={colores.acento} />
      </View>
      <Text style={estilos.titulo} numberOfLines={2}>
        {libro.titulo}
      </Text>
      <Text style={estilos.autor} numberOfLines={1}>
        {libro.autor}
      </Text>
      <View style={estilos.pie}>
        <Text style={estilos.detalle}>{detalle}</Text>
        <View style={estilos.flecha}>
          <Ionicons name="chevron-forward" size={fuente.media} color={colores.texto} />
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderRadius: radio.medio,
    padding: espaciado.md,
    gap: espaciado.xs,
  },
  presionada: {
    opacity: opacidad.presionado,
  },
  portada: {
    height: tamanios.alturaPortada,
    borderRadius: radio.chico,
    backgroundColor: colores.portada,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.media,
    fontWeight: '600',
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: fuente.chica,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaciado.sm,
  },
  detalle: {
    color: colores.texto,
    fontSize: fuente.normal,
    fontWeight: '600',
  },
  flecha: {
    borderWidth: tamanios.bordeFino,
    borderColor: colores.borde,
    borderRadius: radio.chico,
    padding: espaciado.xs,
  },
});
