// Paleta base de la plantilla: #1B1B1B, #323232, #FFE7D0, #FC6E20.
export const colores = {
  fondo: '#1B1B1B',
  superficie: '#323232',
  portada: '#45301F',
  texto: '#FFE7D0',
  textoSecundario: '#CCBAA8',
  acento: '#FC6E20',
  textoSobreAcento: '#1B1B1B',
  borde: '#FFE7D0',
  bordeSuave: '#4A4540',
  error: '#FF8A7A',
  exito: '#8FD5A6',
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fuente = {
  chica: 12,
  normal: 14,
  media: 16,
  grande: 20,
  titulo: 24,
  hero: 28,
} as const;

export const radio = {
  chico: 8,
  medio: 14,
  grande: 22,
} as const;

export const tamanios = {
  areaTactilMin: 44,
  icono: 22,
  iconoPortada: 44,
  alturaPortada: 96,
  bordeFino: 1,
  acentoTitulo: 4,
} as const;
