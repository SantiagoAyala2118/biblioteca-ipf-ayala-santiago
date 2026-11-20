import { router } from 'expo-router';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { EstadoVacio } from '../../components/EmptyState';
import { TarjetaPrestamo } from '../../components/LoanCard';
import { SeparadorLista } from '../../components/ListSeparator';
import { BannerAviso } from '../../components/NoticeBanner';
import { TituloSeccion } from '../../components/SectionTitle';
import { TarjetaEspera } from '../../components/WaitlistCard';
import { USUARIO_ACTUAL } from '../../constants/app';
import { colores, espaciado, fuente } from '../../constants/tema';
import { useBiblioteca } from '../../context/LibraryContext';
import { usePermiso } from '../../hooks/usePermission';
import { obtenerLibroPorIsbn } from '../../lib/catalog';
import { formatearFecha } from '../../lib/dates';
import { posicionEnCola } from '../../lib/library';
import type { EstadoPermiso, Prestamo } from '../../types';

type Elemento =
  | { tipo: 'prestamo'; isbn: string; titulo: string; prestamo: Prestamo }
  | { tipo: 'espera'; isbn: string; titulo: string; posicion: number };

type Seccion = {
  titulo: string;
  vacio: string;
  data: Elemento[];
};

const TEXTO_PERMISO: Record<EstadoPermiso, string> = {
  cargando: 'Consultando el permiso de notificaciones...',
  concedido: 'Notificaciones permitidas: te avisamos antes de cada devolucion.',
  preguntable: 'Notificaciones sin activar: te las pedimos cuando actives "Recordarme".',
  bloqueado: 'Notificaciones bloqueadas: los avisos te van a aparecer en esta pantalla.',
};

function tituloDe(isbn: string): string {
  return obtenerLibroPorIsbn(isbn)?.titulo ?? isbn;
}

export default function PantallaReservas() {
  const { prestamos, esperas, avisos, devolver, activarRecordatorio, desactivarRecordatorio, descartarAviso } =
    useBiblioteca();
  const permisoNotificaciones = usePermiso('notificaciones');

  // El permiso de notificaciones se pide unicamente desde este interruptor.
  function cambiarRecordatorio(isbn: string, activo: boolean) {
    if (!activo) {
      desactivarRecordatorio(isbn);
      return;
    }
    if (permisoNotificaciones.estado === 'concedido') {
      activarRecordatorio(isbn);
      return;
    }
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
  }

  const enEspera: Elemento[] = Object.entries(esperas).flatMap(([isbn, cola]) => {
    const posicion = posicionEnCola(cola, USUARIO_ACTUAL);
    return posicion === null ? [] : [{ tipo: 'espera' as const, isbn, titulo: tituloDe(isbn), posicion }];
  });

  const secciones: Seccion[] = [
    {
      titulo: 'Mis prestamos',
      vacio: 'No tenes prestamos activos.',
      data: prestamos.map((prestamo) => ({ tipo: 'prestamo', isbn: prestamo.isbn, titulo: tituloDe(prestamo.isbn), prestamo })),
    },
    { titulo: 'En lista de espera', vacio: 'No estas en ninguna lista de espera.', data: enEspera },
  ];

  return (
    <SectionList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      sections={secciones}
      keyExtractor={(elemento) => elemento.isbn}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          <Text style={estilos.permiso}>{TEXTO_PERMISO[permisoNotificaciones.estado]}</Text>
          {avisos.map((aviso) => (
            <BannerAviso key={aviso.id} texto={aviso.texto} alDescartar={() => descartarAviso(aviso.id)} />
          ))}
        </View>
      }
      renderSectionHeader={({ section }) => <TituloSeccion texto={section.titulo} />}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? <EstadoVacio icono="bookmark-outline" mensaje={section.vacio} /> : null
      }
      ItemSeparatorComponent={SeparadorLista}
      renderItem={({ item }) =>
        item.tipo === 'prestamo' ? (
          <TarjetaPrestamo
            titulo={item.titulo}
            fechaDevolucion={formatearFecha(item.prestamo.vence)}
            recordatorioActivo={item.prestamo.notificacionId !== null}
            alCambiarRecordatorio={(activo) => cambiarRecordatorio(item.isbn, activo)}
            alDevolver={() => devolver(item.isbn)}
          />
        ) : (
          <TarjetaEspera titulo={item.titulo} posicion={item.posicion} />
        )
      }
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
    gap: espaciado.sm,
  },
  permiso: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
});
