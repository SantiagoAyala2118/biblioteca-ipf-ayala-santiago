import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';
import { BotonIcono } from './IconButton';

type Props = {
  texto: string;
  alDescartar?: () => void;
};

// Aviso dentro de la app: reemplaza a la notificacion cuando no hay permiso.
export function BannerAviso({ texto, alDescartar }: Props) {
  return (
    <View style={estilos.banner} accessibilityRole="alert">
      <Ionicons name="information-circle-outline" size={tamanios.icono} color={colores.acento} />
      <Text style={estilos.texto}>{texto}</Text>
      {alDescartar ? <BotonIcono icono="close" etiqueta="Descartar aviso" alPresionar={alDescartar} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    padding: espaciado.md,
    borderRadius: radio.medio,
    borderWidth: tamanios.bordeFino,
    borderColor: colores.acento,
    backgroundColor: colores.superficie,
  },
  texto: {
    flex: 1,
    color: colores.texto,
    fontSize: fuente.normal,
  },
});
