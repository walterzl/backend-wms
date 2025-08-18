const request = require('supertest');
const Servidor = require('../../src/servidor');
const mockPrisma = require('../setup/singleton');

// Mockear el middleware de autenticación de forma más robusta y correcta
jest.mock('../../src/middleware/middlewareAuth.js', () => {
  const originalModule = jest.requireActual('../../src/middleware/middlewareAuth.js');

  const mockModule = {};
  // Copiar todas las propiedades estáticas del módulo original (clase)
  Object.getOwnPropertyNames(originalModule).forEach(key => {
    mockModule[key] = originalModule[key];
  });

  // Sobrescribir solo la función 'autenticar'
  mockModule.autenticar = jest.fn((req, res, next) => {
    req.usuario = { id: 1, rol: 'admin' }; // Simular un usuario autenticado
    next();
  });

  return mockModule;
});

const servidor = new Servidor();
const app = servidor.obtenerApp();

describe('Rutas de Mantenedores - /api/mantenedores', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /materiales', () => {
    it('debería retornar una lista de materiales activos', async () => {
      // --- Preparación del Mock de Prisma ---
      const mockMateriales = [
        { id: 1, codigo_ranco: 'M001', nombre_material: 'Material 1', unidad_medida: 'Unidad', frio: 'No', activo: true },
        { id: 2, codigo_ranco: 'M002', nombre_material: 'Material 2', unidad_medida: 'Caja', frio: 'Si', activo: true },
      ];
      mockPrisma.materiales.findMany.mockResolvedValue(mockMateriales);

      // --- Ejecución ---
      const response = await request(app).get('/api/mantenedores/materiales');

      // --- Aserciones ---
      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos).toHaveLength(2);
      expect(response.body.datos[0].codigo).toBe('M001');
      expect(response.body.datos[1].requiere_frio).toBe(true);

      // Verificar que el mock de Prisma fue llamado
      expect(mockPrisma.materiales.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        select: {
          id: true,
          codigo_ranco: true,
          nombre_material: true,
          unidad_medida: true,
          frio: true,
          activo: true
        },
        orderBy: {
          nombre_material: 'asc'
        }
      });
    });
  });
});
