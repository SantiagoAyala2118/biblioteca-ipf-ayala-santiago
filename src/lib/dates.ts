export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

function dosDigitos(numero: number): string {
  return String(numero).padStart(2, '0');
}

export function formatearFecha(fecha: Date): string {
  const dia = dosDigitos(fecha.getDate());
  const mes = dosDigitos(fecha.getMonth() + 1);
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}
