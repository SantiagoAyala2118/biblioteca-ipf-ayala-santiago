import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EstadoVacio } from '../../../../components/EmptyState';
import { DatoLibro } from '../../../../components/InfoRow';
import { BotonPrincipal } from '../../../../components/PrimaryButton';
import { colores, espaciado, fuente, radio, tamanios } from '../../../../constants/tema';
import { useBiblioteca } from '../../../../context/LibraryContext';
import { resolverIsbn } from '../../../../lib/catalog';
import { calcularDisponibles } from '../../../../lib/library';
import { parametroComoTexto } from '../../../../lib/params';

export default function PantallaDetalle() {
  const parametros = useLocalSearchParams<{ isbn: string }>();
  const isbn = parametroComoTexto(parametros.isbn);
  const resultado = resolverIsbn(isbn);
  const libro = resultado.estado === 'encontrado' ? resultado.libro : null;
  const { prestamos, esperas, agregarReciente } = useBiblioteca();

  // Cada vez que se abre un libro valido se apila en "Vistos recientemente".
  useEffect(() => {
    if (libro) {
      agregarReciente(libro);
    }
  }, [libro, agregarReciente]);

  if (!libro) {
    const mensaje =
      resultado.estado === 'invalido'
        ? `"${isbn}" no es un ISBN valido: tiene que tener 13 digitos, sin guiones.`
        : `No encontramos ningun libro con el ISBN ${isbn}.`;
    return (
      <View style={estilos.contenedorCentrado}>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <EstadoVacio
          icono="search-outline"
          mensaje={mensaje}
          textoAccion="Volver al catalogo"
          alPresionar={() => router.navigate('/')}
        />
      </View>
    );
  }

  const disponibles = calcularDisponibles(libro, prestamos);
  const enEspera = esperas[libro.isbn]?.tamanio ?? 0;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={estilos.portada}>
        <Ionicons name="book" size={tamanios.iconoPortada * 2} color={colores.acento} />
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {libro.titulo}
      </Text>
      <Text style={estilos.autor}>{libro.autor}</Text>
      <View>
        <DatoLibro etiqueta="Anio" valor={String(libro.anio)} />
        <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles)} />
        <DatoLibro etiqueta="Personas en espera" valor={String(enEspera)} />
      </View>
      <BotonPrincipal
        texto="Reservar"
        icono="bookmark-outline"
        alPresionar={() => router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  contenedorCentrado: {
    flex: 1,
    padding: espaciado.lg,
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  portada: {
    height: tamanios.alturaPortada * 2,
    borderRadius: radio.grande,
    backgroundColor: colores.portada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.titulo,
    fontWeight: '700',
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: fuente.media,
  },
});
