import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';

type Props = {
  titulo: string;
  posicion: number;
};

export function TarjetaEspera({ titulo, posicion }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.posicion}>
        <Text style={estilos.numero}>{posicion}</Text>
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.detalle}>
          {posicion === 1 ? 'Sos el proximo en la lista de espera' : `Estas en la posicion ${posicion} de la lista`}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    backgroundColor: colores.superficie,
    borderRadius: radio.medio,
    padding: espaciado.lg,
  },
  posicion: {
    width: tamanios.areaTactilMin,
    height: tamanios.areaTactilMin,
    borderRadius: radio.chico,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    color: colores.acento,
    fontSize: fuente.grande,
    fontWeight: '700',
  },
  textos: {
    flex: 1,
    gap: espaciado.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.media,
    fontWeight: '700',
  },
  detalle: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
});
