import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';

type Props = {
  texto: string;
};

// Titulo de seccion con acento lateral, como en la plantilla de diseno.
export function TituloSeccion({ texto }: Props) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.acento} />
      <Text style={estilos.texto} accessibilityRole="header">
        {texto}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginVertical: espaciado.md,
  },
  acento: {
    width: tamanios.acentoTitulo,
    height: fuente.titulo,
    borderRadius: radio.chico,
    backgroundColor: colores.acento,
  },
  texto: {
    color: colores.texto,
    fontSize: fuente.grande,
    fontWeight: '700',
  },
});
