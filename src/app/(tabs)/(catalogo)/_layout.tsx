import { Stack } from 'expo-router';

import { EnlacePersonal } from '../../../components/StaffLink';
import { opcionesHeader } from '../../../constants/navigation';
import { useBiblioteca } from '../../../context/LibraryContext';

// Un deep link a /libro/[isbn] deja el Catalogo debajo, para que "atras" tenga a donde volver.
export const unstable_settings = {
  anchor: 'index',
};

export default function LayoutCatalogo() {
  const { sesion } = useBiblioteca();

  return (
    <Stack screenOptions={opcionesHeader}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Catalogo',
          headerRight: () => <EnlacePersonal conSesion={sesion} />,
        }}
      />
    </Stack>
  );
}
