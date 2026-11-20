import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, opacidad, radio, tamanios } from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libros: Libro[];
  alElegir: (libro: Libro) => void;
};

export function VistosRecientes({ libros, alElegir }: Props) {
  if (libros.length === 0) {
    return <Text style={estilos.vacio}>Todavia no abriste ningun libro.</Text>;
  }

  return (
    <View style={estilos.fila}>
      {libros.map((libro) => (
        <Pressable
          key={libro.isbn}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${libro.titulo}`}
          onPress={() => alElegir(libro)}
          style={({ pressed }) => [estilos.chip, pressed && estilos.presionado]}
        >
          <Ionicons name="time-outline" size={fuente.media} color={colores.acento} />
          <Text style={estilos.titulo} numberOfLines={2}>
            {libro.titulo}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  chip: {
    flex: 1,
    minHeight: tamanios.areaTactilMin,
    padding: espaciado.sm,
    borderRadius: radio.chico,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficie,
    gap: espaciado.xs,
  },
  presionado: {
    opacity: opacidad.presionado,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.chica,
    fontWeight: '600',
  },
  vacio: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
});
