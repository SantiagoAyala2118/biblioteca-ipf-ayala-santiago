import { describe, expect, it } from '@jest/globals';

import { aEstadoPermiso, esRecurso } from '../src/lib/permissions';

describe('aEstadoPermiso', () => {
  it('sin respuesta todavia esta cargando', () => {
    expect(aEstadoPermiso(null)).toBe('cargando');
  });

  it('con el permiso otorgado esta concedido', () => {
    expect(aEstadoPermiso({ granted: true, canAskAgain: false })).toBe('concedido');
  });

  it('denegado pero se puede volver a pedir es preguntable', () => {
    expect(aEstadoPermiso({ granted: false, canAskAgain: true })).toBe('preguntable');
  });

  it('denegado sin poder volver a pedir esta bloqueado', () => {
    expect(aEstadoPermiso({ granted: false, canAskAgain: false })).toBe('bloqueado');
  });
});

describe('esRecurso', () => {
  it('acepta solo camara y notificaciones', () => {
    expect(esRecurso('camara')).toBe(true);
    expect(esRecurso('notificaciones')).toBe(true);
    expect(esRecurso('ubicacion')).toBe(false);
  });
});
