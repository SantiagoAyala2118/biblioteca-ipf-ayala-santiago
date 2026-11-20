import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { TarjetaLibro } from '../../../components/BookCard';
import { EstadoVacio } from '../../../components/EmptyState';
import { EstadoError } from '../../../components/ErrorState';
import { TarjetaHero } from '../../../components/HeroCard';
import { EstadoCargando } from '../../../components/LoadingState';
import { BotonPrincipal } from '../../../components/PrimaryButton';
import { VistosRecientes } from '../../../components/RecentBooks';
import { TituloSeccion } from '../../../components/SectionTitle';
import { CANTIDAD_RECIENTES } from '../../../constants/app';
import { colores, espaciado } from '../../../constants/tema';
import { useBiblioteca } from '../../../context/LibraryContext';
import { useLibros } from '../../../hooks/useLibros';
import { calcularDisponibles, describirDisponibles, obtenerRecientes } from '../../../lib/library';
import type { Libro } from '../../../types';

function abrirLibro(libro: Libro) {
  router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } });
}

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { prestamos, recientes } = useBiblioteca();

  const encabezado = (
    <View style={estilos.encabezado}>
      <TarjetaHero
        titulo="Biblioteca IPF"
        descripcion="Consulta el catalogo, reserva libros y recibi un recordatorio antes de devolverlos."
      >
        <BotonPrincipal texto="Buscar" icono="search" variante="borde" alPresionar={() => router.push('/buscar')} />
        <BotonPrincipal texto="Escanear" icono="barcode-outline" alPresionar={() => router.push('/escanear')} />
      </TarjetaHero>
      <TituloSeccion texto="Vistos recientemente" />
      <VistosRecientes libros={obtenerRecientes(recientes, CANTIDAD_RECIENTES)} alElegir={abrirLibro} />
      <TituloSeccion texto="Catalogo" />
    </View>
  );

  // Cargando, error y vacio se muestran en el lugar de la lista, debajo del encabezado.
  let sinLibros = <EstadoVacio mensaje="Todavia no hay libros en el catalogo." />;
  if (cargando) {
    sinLibros = <EstadoCargando mensaje="Cargando el catalogo..." />;
  } else if (error) {
    sinLibros = <EstadoError mensaje={error} textoAccion="Reintentar" alPresionar={reintentar} />;
  }

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      columnWrapperStyle={estilos.columnas}
      data={cargando || error ? [] : libros}
      numColumns={2}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={sinLibros}
      renderItem={({ item }) => (
        <TarjetaLibro
          libro={item}
          detalle={describirDisponibles(calcularDisponibles(item, prestamos))}
          alPresionar={() => abrirLibro(item)}
        />
      )}
    />
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
  encabezado: {
    gap: espaciado.xs,
  },
  columnas: {
    gap: espaciado.md,
  },
});
