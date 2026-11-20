import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { TarjetaLibro } from '../components/BookCard';
import { EstadoVacio } from '../components/EmptyState';
import { EstadoError } from '../components/ErrorState';
import { EstadoCargando } from '../components/LoadingState';
import { CampoTexto } from '../components/TextField';
import { colores, espaciado } from '../constants/tema';
import { useBiblioteca } from '../context/LibraryContext';
import { useBusqueda } from '../hooks/useSearch';
import { calcularDisponibles, describirDisponibles } from '../lib/library';
import { parametroComoTexto } from '../lib/params';

export default function PantallaBuscar() {
  // El texto de la busqueda vive en la URL: /buscar?q=borges
  const parametros = useLocalSearchParams<{ q?: string }>();
  const q = parametroComoTexto(parametros.q);
  const { resultados, cargando, error, reintentar } = useBusqueda(q);
  const { prestamos } = useBiblioteca();

  let sinResultados = <EstadoVacio icono="search-outline" mensaje={`No encontramos libros para "${q.trim()}".`} />;
  if (!q.trim()) {
    sinResultados = <EstadoVacio icono="search-outline" mensaje="Escribi un titulo o un autor para buscar." />;
  } else if (cargando) {
    sinResultados = <EstadoCargando mensaje="Buscando..." />;
  } else if (error) {
    sinResultados = <EstadoError mensaje={error} textoAccion="Reintentar" alPresionar={reintentar} />;
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.buscador}>
        <CampoTexto
          etiqueta="Titulo o autor"
          placeholder="Por ejemplo: Borges"
          value={q}
          autoFocus
          autoCorrect={false}
          onChangeText={(texto) => router.setParams({ q: texto })}
        />
      </View>
      <FlatList
        contentContainerStyle={estilos.contenido}
        columnWrapperStyle={estilos.columnas}
        data={cargando ? [] : resultados}
        numColumns={2}
        keyExtractor={(libro) => libro.isbn}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={sinResultados}
        renderItem={({ item }) => (
          <TarjetaLibro
            libro={item}
            detalle={describirDisponibles(calcularDisponibles(item, prestamos))}
            alPresionar={() => router.push({ pathname: '/libro/[isbn]', params: { isbn: item.isbn } })}
          />
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  buscador: {
    padding: espaciado.lg,
    paddingBottom: 0,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  columnas: {
    gap: espaciado.md,
  },
});
