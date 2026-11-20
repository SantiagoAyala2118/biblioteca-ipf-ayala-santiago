import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuente } from '../constants/tema';
import { esIsbnValido } from '../lib/catalog';
import { BotonPrincipal } from './PrimaryButton';
import { CampoTexto } from './TextField';

type Props = {
  alConfirmar: (isbn: string) => void;
};

// Alternativa al escaner: siempre se puede escribir el ISBN a mano.
export function IngresoIsbn({ alConfirmar }: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function confirmar() {
    const isbn = texto.replace(/[\s-]/g, '');
    if (!esIsbnValido(isbn)) {
      setError('El ISBN tiene que tener 13 digitos. Lo encontras debajo del codigo de barras.');
      return;
    }
    setError(null);
    alConfirmar(isbn);
  }

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        etiqueta="ISBN del libro"
        placeholder="Por ejemplo: 9789507001017"
        keyboardType="number-pad"
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={confirmar}
      />
      {error ? (
        <Text style={estilos.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <BotonPrincipal texto="Abrir libro" variante="borde" icono="arrow-forward" alPresionar={confirmar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  error: {
    color: colores.error,
    fontSize: fuente.normal,
  },
});
