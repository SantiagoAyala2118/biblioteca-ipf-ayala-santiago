import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';

export function SeparadorLista() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  separador: {
    height: espaciado.md,
  },
});
