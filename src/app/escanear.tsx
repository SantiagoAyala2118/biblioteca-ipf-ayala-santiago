import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { IngresoIsbn } from '../components/IsbnInput';
import { EstadoCargando } from '../components/LoadingState';
import { BannerAviso } from '../components/NoticeBanner';
import { BotonPrincipal } from '../components/PrimaryButton';
import { TituloSeccion } from '../components/SectionTitle';
import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';
import { usePermiso } from '../hooks/usePermission';
import { resolverIsbn } from '../lib/catalog';

export default function PantallaEscanear() {
  const { estado } = usePermiso('camara');
  // useRef y no useState: el cambio se ve en el mismo instante, sin esperar un nuevo render.
  const yaNavego = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Se reemplaza el escaner por el detalle: primero se cierra el escaner (dismiss) y despues se abre
  // el libro dentro de la tab Catalogo. Asi "atras" desde el detalle no vuelve a la camara.
  function abrirLibro(isbn: string) {
    const resultado = resolverIsbn(isbn);
    if (resultado.estado !== 'encontrado') {
      setAviso(`El ISBN ${isbn} no esta en el catalogo. Proba con otro libro.`);
      return;
    }
    yaNavego.current = true;
    router.dismiss();
    router.push({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  // La camara puede llamar a esta funcion muchas veces por segundo con el mismo codigo.
  function alEscanear({ data }: BarcodeScanningResult) {
    if (yaNavego.current || ultimoDesconocido.current === data) {
      return;
    }
    if (resolverIsbn(data).estado !== 'encontrado') {
      ultimoDesconocido.current = data;
    }
    abrirLibro(data);
  }

  let panelCamara = <EstadoCargando mensaje="Consultando la camara..." />;
  if (estado === 'concedido') {
    panelCamara = (
      <CameraView
        style={estilos.camara}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
        onBarcodeScanned={alEscanear}
      />
    );
  } else if (estado === 'preguntable') {
    panelCamara = (
      <View style={estilos.panel}>
        <Text style={estilos.texto}>Para escanear el codigo de barras necesitamos usar la camara.</Text>
        <BotonPrincipal texto="Activar camara" icono="camera-outline" alPresionar={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })} />
      </View>
    );
  } else if (estado === 'bloqueado') {
    panelCamara = (
      <View style={estilos.panel}>
        <Text style={estilos.texto}>
          La camara esta bloqueada. Podes habilitarla desde Ajustes o escribir el ISBN mas abajo.
        </Text>
        <BotonPrincipal
          texto="Ver como habilitarla"
          variante="borde"
          icono="settings-outline"
          alPresionar={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })}
        />
      </View>
    );
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      {panelCamara}
      {aviso ? <BannerAviso texto={aviso} alDescartar={() => setAviso(null)} /> : null}
      <TituloSeccion texto="Escribir el ISBN" />
      <IngresoIsbn alConfirmar={abrirLibro} />
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
  camara: {
    height: tamanios.alturaPortada * 3,
    borderRadius: radio.grande,
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  texto: {
    color: colores.texto,
    fontSize: fuente.media,
  },
});
