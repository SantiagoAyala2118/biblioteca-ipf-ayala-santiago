import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '../components/PrimaryButton';
import { CampoTexto } from '../components/TextField';
import { colores, espaciado, fuente, radio } from '../constants/tema';
import { useBiblioteca } from '../context/LibraryContext';

// Al iniciar sesion no hace falta navegar: Stack.Protected quita esta pantalla y el modal se cierra solo.
export default function PantallaLogin() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError('Usuario o clave incorrectos. Revisalos e intenta de nuevo.');
    }
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Personal de biblioteca
        </Text>
        <Text style={estilos.descripcion}>Ingresa para entregar libros respetando el orden de las reservas.</Text>
        <CampoTexto
          etiqueta="Usuario"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CampoTexto
          etiqueta="Clave"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          onSubmitEditing={ingresar}
        />
        {error ? (
          <Text style={estilos.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <BotonPrincipal texto="Ingresar" icono="log-in-outline" alPresionar={ingresar} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.lg,
    backgroundColor: colores.fondo,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.titulo,
    fontWeight: '700',
  },
  descripcion: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
  error: {
    color: colores.error,
    fontSize: fuente.normal,
  },
});
