// useLocalSearchParams puede devolver un texto, una lista de textos o nada.
export function parametroComoTexto(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? '';
  }
  return valor ?? '';
}
