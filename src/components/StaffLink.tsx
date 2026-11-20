import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuente, tamanios } from '../constants/tema';

type Props = {
  conSesion: boolean;
};

// Sin sesion lleva al login; con sesion, directo al mostrador.
export function EnlacePersonal({ conSesion }: Props) {
  return (
    <Link href={conSesion ? '/mostrador' : '/login'} asChild>
      <Pressable accessibilityRole="button" style={estilos.enlace}>
        <Text style={estilos.texto}>Personal</Text>
      </Pressable>
    </Link>
  );
}

const estilos = StyleSheet.create({
  enlace: {
    minHeight: tamanios.areaTactilMin,
    minWidth: tamanios.areaTactilMin,
    paddingHorizontal: espaciado.md,
    justifyContent: 'center',
  },
  texto: {
    color: colores.acento,
    fontSize: fuente.media,
    fontWeight: '600',
  },
});
