import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { EstadoVacio } from '../../components/EmptyState';
import { BotonPrincipal } from '../../components/PrimaryButton';
import { DIAS_PRESTAMO, USUARIO_ACTUAL } from '../../constants/app';
import { colores, espaciado, fuente, radio, tamanios } from '../../constants/tema';
import { useBiblioteca } from '../../context/LibraryContext';
import { resolverIsbn } from '../../lib/catalog';
import { formatearFecha } from '../../lib/dates';
import { evaluarReserva } from '../../lib/library';
import { parametroComoTexto } from '../../lib/params';
import type { ResultadoReserva } from '../../types';

function describirResultado(resultado: ResultadoReserva): string {
  if (resultado.tipo === 'prestamo') {
    return `Hay ejemplares disponibles. Te lo prestamos por ${DIAS_PRESTAMO} dias: lo devolves el ${formatearFecha(resultado.vence)}.`;
  }
  if (resultado.tipo === 'espera') {
    return `No quedan ejemplares. Vas a entrar a la lista de espera en la posicion ${resultado.posicion}.`;
  }
  return 'Ya tenes este libro en prestamo o en lista de espera. No hace falta reservarlo de nuevo.';
}

// Ir a /reservas cerrando el modal: asi "atras" no vuelve a esta confirmacion.
function irAMisReservas() {
  router.dismissTo('/reservas');
}

export default function PantallaReservar() {
  const parametros = useLocalSearchParams<{ isbn: string }>();
  const isbn = parametroComoTexto(parametros.isbn);
  const busqueda = resolverIsbn(isbn);
  const { prestamos, esperas, reservar } = useBiblioteca();

  if (busqueda.estado !== 'encontrado') {
    return (
      <View style={estilos.pantalla}>
        <EstadoVacio
          icono="alert-circle-outline"
          mensaje="No podemos reservar este libro porque no esta en el catalogo."
          textoAccion="Volver"
          alPresionar={() => router.back()}
        />
      </View>
    );
  }

  const libro = busqueda.libro;
  const previa = evaluarReserva(libro, prestamos, esperas[isbn], USUARIO_ACTUAL, new Date());

  function confirmar() {
    reservar(libro);
    irAMisReservas();
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.tarjeta}>
        <Ionicons
          name={previa.tipo === 'duplicado' ? 'information-circle-outline' : 'bookmark'}
          size={tamanios.iconoPortada}
          color={colores.acento}
        />
        <Text style={estilos.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={estilos.autor}>{libro.autor}</Text>
        <Text style={estilos.mensaje}>{describirResultado(previa)}</Text>
      </View>
      {previa.tipo === 'duplicado' ? (
        <BotonPrincipal texto="Ver mis reservas" alPresionar={irAMisReservas} />
      ) : (
        <BotonPrincipal
          texto={previa.tipo === 'prestamo' ? 'Confirmar prestamo' : 'Confirmar lista de espera'}
          alPresionar={confirmar}
        />
      )}
      <BotonPrincipal texto="Cancelar" variante="borde" alPresionar={() => router.back()} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.lg,
    gap: espaciado.md,
    backgroundColor: colores.fondo,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    padding: espaciado.xl,
    gap: espaciado.sm,
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
  mensaje: {
    color: colores.texto,
    fontSize: fuente.media,
    marginTop: espaciado.sm,
  },
});
