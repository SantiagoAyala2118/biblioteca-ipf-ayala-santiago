import { StyleSheet, Switch, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio } from '../constants/tema';
import { BotonPrincipal } from './PrimaryButton';

type Props = {
  titulo: string;
  fechaDevolucion: string;
  recordatorioActivo: boolean;
  alCambiarRecordatorio: (activo: boolean) => void;
  alDevolver: () => void;
};

export function TarjetaPrestamo({ titulo, fechaDevolucion, recordatorioActivo, alCambiarRecordatorio, alDevolver }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.fecha}>Devolver antes del {fechaDevolucion}</Text>
      <View style={estilos.fila}>
        <Text style={estilos.etiqueta}>Recordarme</Text>
        <Switch
          accessibilityLabel={`Recordarme la devolucion de ${titulo}`}
          value={recordatorioActivo}
          onValueChange={alCambiarRecordatorio}
          trackColor={{ false: colores.bordeSuave, true: colores.acento }}
          thumbColor={colores.texto}
        />
      </View>
      <BotonPrincipal texto="Devolver" variante="borde" icono="return-down-back" alPresionar={alDevolver} />
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
  fecha: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    color: colores.texto,
    fontSize: fuente.media,
  },
});
