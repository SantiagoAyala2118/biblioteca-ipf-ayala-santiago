import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado } from '../constants/tema';

export default function PantallaEscanear() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>Escanear</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: espaciado.lg, backgroundColor: colores.fondo },
  texto: { color: colores.texto },
});
