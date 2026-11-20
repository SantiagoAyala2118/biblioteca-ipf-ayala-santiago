import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { FilaMostrador } from '../components/CounterRow';
import { EstadoVacio } from '../components/EmptyState';
import { SeparadorLista } from '../components/ListSeparator';
import { BannerAviso } from '../components/NoticeBanner';
import { BotonPrincipal } from '../components/PrimaryButton';
import { TarjetaHero } from '../components/HeroCard';
import { colores, espaciado } from '../constants/tema';
import { useBiblioteca } from '../context/LibraryContext';
import { librosConEspera } from '../lib/catalog';

// Al cerrar sesion, Stack.Protected saca esta pantalla del historial y vuelve al catalogo.
export default function PantallaMostrador() {
  const { esperas, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const conEspera = librosConEspera((isbn) => esperas[isbn]?.tamanio ?? 0);

  function entregar(isbn: string, titulo: string) {
    const persona = entregarAlSiguiente(isbn);
    setMensaje(persona ? `"${titulo}" entregado a ${persona}.` : `No hay nadie esperando "${titulo}".`);
  }

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      data={conEspera}
      keyExtractor={(libro) => libro.isbn}
      ItemSeparatorComponent={SeparadorLista}
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          <TarjetaHero
            titulo="Mostrador"
            descripcion="Cuando se devuelve un ejemplar, se entrega a la persona que esta al frente de la lista de espera."
          >
            <BotonPrincipal texto="Cerrar sesion" variante="borde" icono="log-out-outline" alPresionar={cerrarSesion} />
          </TarjetaHero>
          {mensaje ? <BannerAviso texto={mensaje} alDescartar={() => setMensaje(null)} /> : null}
        </View>
      }
      ListEmptyComponent={<EstadoVacio icono="people-outline" mensaje="No hay libros con lista de espera." />}
      renderItem={({ item }) => {
        const cola = esperas[item.isbn];
        return (
          <FilaMostrador
            titulo={item.titulo}
            alFrente={cola?.verFrente() ?? ''}
            cantidad={cola?.tamanio ?? 0}
            alEntregar={() => entregar(item.isbn, item.titulo)}
          />
        );
      }}
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
  },
  encabezado: {
    gap: espaciado.md,
    marginBottom: espaciado.md,
  },
});
