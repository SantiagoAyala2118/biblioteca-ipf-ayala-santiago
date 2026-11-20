import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { RECURSOS_PERMISO } from '../constants/app';
import { colores, espaciado, fuente, radio, tamanios } from '../constants/tema';
import { usePermiso } from '../hooks/usePermission';
import type { EstadoPermiso, Recurso } from '../types';
import { EstadoCargando } from './LoadingState';
import { BotonPrincipal } from './PrimaryButton';

type Props = {
  recurso: Recurso;
  alTerminar: (estado: EstadoPermiso) => void;
};

// Pantalla previa al dialogo del sistema: el beneficio en una frase y un unico boton.
// Funciona para cualquier recurso descrito en RECURSOS_PERMISO.
export function PedidoPermiso({ recurso, alTerminar }: Props) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const descripcion = RECURSOS_PERMISO[recurso];

  if (estado === 'cargando') {
    return <EstadoCargando mensaje="Consultando el permiso..." />;
  }

  async function continuar() {
    alTerminar(await pedir());
  }

  let aclaracion = 'Despues vas a ver el aviso del sistema para confirmarlo.';
  let boton = <BotonPrincipal texto="Continuar" alPresionar={continuar} />;
  if (estado === 'bloqueado') {
    aclaracion = 'El permiso esta bloqueado. Podes habilitarlo desde los Ajustes del telefono.';
    boton = <BotonPrincipal texto="Abrir Ajustes" icono="settings-outline" alPresionar={abrirAjustes} />;
  } else if (estado === 'concedido') {
    aclaracion = 'El permiso ya esta activado.';
    boton = <BotonPrincipal texto="Continuar" alPresionar={() => alTerminar(estado)} />;
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.icono}>
        <Ionicons name={descripcion.icono} size={tamanios.iconoPortada} color={colores.acento} />
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {descripcion.titulo}
      </Text>
      <Text style={estilos.beneficio}>{descripcion.beneficio}</Text>
      <Text style={estilos.aclaracion}>{aclaracion}</Text>
      {boton}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  icono: {
    width: tamanios.alturaPortada,
    height: tamanios.alturaPortada,
    borderRadius: radio.medio,
    backgroundColor: colores.portada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    color: colores.texto,
    fontSize: fuente.titulo,
    fontWeight: '700',
  },
  beneficio: {
    color: colores.texto,
    fontSize: fuente.media,
  },
  aclaracion: {
    color: colores.textoSecundario,
    fontSize: fuente.normal,
  },
});
