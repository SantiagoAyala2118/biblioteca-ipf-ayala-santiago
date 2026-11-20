import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import { BotonPrincipal } from './PrimaryButton';

type Props = {
  titulo: string;
  alFrente: string;
  cantidad: number;
  alEntregar: () => void;
};

export function FilaMostrador({ titulo, alFrente, cantidad, alEntregar }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>
        Al frente: <Text style={estilos.destacado}>{alFrente}</Text>
      </Text>
      <Text style={estilos.detalle}>
        {cantidad === 1 ? '1 persona esperando' : `${cantidad} personas esperando`}
      </Text>
      <BotonPrincipal texto="Entregar al siguiente" icono="hand-right-outline" alPresionar={alEntregar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.medio,
    padding: espaciado.lg,
    gap: espaciado.sm,
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
  destacado: {
    color: colores.acento,
    fontWeight: '700',
  },
});
