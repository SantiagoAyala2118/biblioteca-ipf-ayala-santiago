import { Redirect } from 'expo-router';

// URL vieja de la version anterior: se conserva para que los links guardados sigan funcionando.
export default function RedireccionReserva() {
  return <Redirect href="/reservas" />;
}
