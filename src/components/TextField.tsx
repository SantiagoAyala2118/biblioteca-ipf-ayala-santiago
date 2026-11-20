import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';

type Props = TextInputProps & {
  etiqueta: string;
};

export function CampoTexto({ etiqueta, ...propsInput }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSecundario}
        style={estilos.input}
        {...propsInput}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
  input: {
    minHeight: tamanios.areaTactilMin,
    borderRadius: radio.chico,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: fuente.media,
    paddingHorizontal: espaciado.md,
  },
});
