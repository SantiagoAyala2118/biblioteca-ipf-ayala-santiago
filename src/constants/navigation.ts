import { DarkTheme, type Theme } from 'expo-router';

import { colores } from './tema';

// Tema de React Navigation con la paleta: headers y tab bar comparten los colores de la app.
export const temaNavegacion: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colores.acento,
    background: colores.fondo,
    card: colores.fondo,
    text: colores.texto,
    border: colores.bordeSuave,
    notification: colores.acento,
  },
};

export const opcionesHeader = {
  headerStyle: { backgroundColor: colores.fondo },
  headerTintColor: colores.texto,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colores.fondo },
} as const;

export const opcionesTabs = {
  tabBarActiveTintColor: colores.acento,
  tabBarInactiveTintColor: colores.textoSecundario,
  tabBarStyle: { backgroundColor: colores.fondo, borderTopColor: colores.bordeSuave },
  headerStyle: { backgroundColor: colores.fondo },
  headerTintColor: colores.texto,
  headerShadowVisible: false,
} as const;
