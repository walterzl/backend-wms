const request = require('supertest');
const Servidor = require('../../src/servidor');

// Iniciar una instancia del servidor para las pruebas
const servidor = new Servidor();
const app = servidor.obtenerApp();

describe('Rutas de Utilidades - /api/utils', () => {

  describe('GET /health', () => {
    it('debería responder con un estado 200 y un mensaje de salud', async () => {
      const response = await request(app).get('/api/utils/health');

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.mensaje).toBe('Sistema funcionando correctamente');
    });
  });

  describe('GET /version', () => {
    it('debería responder con un estado 200 y la información de la versión', async () => {
      const response = await request(app).get('/api/utils/version');

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos).toHaveProperty('version');
      expect(response.body.datos).toHaveProperty('aplicacion');
    });
  });

});
