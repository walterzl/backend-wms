const ServicioUtilidades = require('../../src/servicios/ServicioUtilidades');

describe('ServicioUtilidades', () => {

  describe('generarCodigo', () => {
    it('debería generar un código con el prefijo especificado', () => {
      const prefijo = 'TEST';
      const codigo = ServicioUtilidades.generarCodigo(prefijo);
      expect(codigo.startsWith(prefijo)).toBe(true);
    });
  });

  describe('formatearFecha', () => {
    it('debería formatear una fecha correctamente', () => {
      const fecha = new Date('2024-01-15T10:30:00Z');
      const formato = 'DD-MM-YYYY';
      const fechaFormateada = ServicioUtilidades.formatearFecha(fecha, formato);
      expect(fechaFormateada).toBe('15-01-2024');
    });
  });

  describe('capitalizarTexto', () => {
    it('debería capitalizar la primera letra de cada palabra', () => {
      const texto = 'hola mundo desde chile';
      const textoCapitalizado = ServicioUtilidades.capitalizarTexto(texto);
      expect(textoCapitalizado).toBe('Hola Mundo Desde Chile');
    });
  });

  describe('calcularNuevoStock', () => {
    it('debería sumar stock en una recepción', () => {
      const stockActual = 100;
      const cantidad = 50;
      const nuevoStock = ServicioUtilidades.calcularNuevoStock(stockActual, cantidad, 'recepcion');
      expect(nuevoStock).toBe(150);
    });

    it('debería restar stock en un despacho', () => {
      const stockActual = 100;
      const cantidad = 30;
      const nuevoStock = ServicioUtilidades.calcularNuevoStock(stockActual, cantidad, 'despacho');
      expect(nuevoStock).toBe(70);
    });

    it('no debería permitir stock negativo', () => {
      const stockActual = 20;
      const cantidad = 30;
      const nuevoStock = ServicioUtilidades.calcularNuevoStock(stockActual, cantidad, 'salida');
      expect(nuevoStock).toBe(0);
    });
  });
});
