import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { opcionesTabs } from '../../constants/navigation';
import { colores, tamanios } from '../../constants/tema';

export default function LayoutTabs() {
  return (
    <Tabs screenOptions={opcionesTabs}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catalogo',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons name="library-outline" size={tamanios.icono} color={focused ? colores.acento : colores.textoSecundario} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="bookmark-outline" size={tamanios.icono} color={focused ? colores.acento : colores.textoSecundario} />
          ),
        }}
      />
    </Tabs>
  );
}
