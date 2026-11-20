import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, tamanios } from '../constants/tema';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espaciado.md,
    borderBottomWidth: tamanios.bordeFino,
    borderBottomColor: colores.bordeSuave,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: fuente.media,
  },
  valor: {
    color: colores.texto,
    fontSize: fuente.media,
    fontWeight: '600',
  },
});
