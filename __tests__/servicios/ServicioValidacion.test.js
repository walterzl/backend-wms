const ServicioValidacion = require('../../src/servicios/ServicioValidacion');

describe('ServicioValidacion', () => {

  describe('validarLogin', () => {
    it('debería validar correctamente los datos de login correctos', () => {
      const datosLogin = {
        usuario: 'testuser',
        password: 'Password123'
      };
      const resultado = ServicioValidacion.validarLogin(datosLogin);
      expect(resultado.esValido).toBe(true);
      expect(resultado.errores).toBeNull();
    });

    it('debería fallar si no se proporciona el usuario', () => {
      const datosLogin = {
        password: 'Password123'
      };
      const resultado = ServicioValidacion.validarLogin(datosLogin);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toHaveLength(1);
      expect(resultado.errores[0].campo).toBe('usuario');
    });

    it('debería fallar si no se proporciona la contraseña', () => {
      const datosLogin = {
        usuario: 'testuser'
      };
      const resultado = ServicioValidacion.validarLogin(datosLogin);
      expect(resultado.esValido).toBe(false);
      expect(resultado.errores).toHaveLength(1);
      expect(resultado.errores[0].campo).toBe('password');
    });

    it('debería fallar si se proporcionan campos adicionales', () => {
      const datosLogin = {
        usuario: 'testuser',
        password: 'Password123',
        campoExtra: 'valor'
      };
      // La configuración de Joi `stripUnknown: true` elimina campos desconocidos,
      // por lo que la validación debería pasar y el campo extra ser eliminado.
      const resultado = ServicioValidacion.validarLogin(datosLogin);
      expect(resultado.esValido).toBe(true);
      expect(resultado.datos).not.toHaveProperty('campoExtra');
    });
  });

});
