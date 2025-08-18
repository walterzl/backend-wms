const ServicioBaseCRUD = require('../../src/servicios/ServicioBaseCRUD');
const mockPrisma = require('../setup/singleton');

describe('ServicioBaseCRUD', () => {

  describe('obtenerTodos', () => {
    it('debería retornar una lista de registros', async () => {
      const mockData = [
        { id: 1, nombre: 'Registro 1' },
        { id: 2, nombre: 'Registro 2' }
      ];
      const tabla = 'usuarios';

      // Configurar el mock de Prisma
      mockPrisma[tabla].findMany.mockResolvedValue(mockData);

      const resultado = await ServicioBaseCRUD.obtenerTodos(tabla);

      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toEqual(mockData);
      expect(resultado.total).toBe(2);
      expect(mockPrisma[tabla].findMany).toHaveBeenCalledWith({
        where: {},
        select: undefined,
        orderBy: undefined,
        include: undefined
      });
    });
  });

  describe('obtenerPorId', () => {
    it('debería retornar un único registro por su ID', async () => {
      const mockRegistro = { id: 1, nombre: 'Registro 1' };
      const tabla = 'usuarios';
      const id = 1;

      mockPrisma[tabla].findUnique.mockResolvedValue(mockRegistro);

      const resultado = await ServicioBaseCRUD.obtenerPorId(tabla, id);

      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toEqual(mockRegistro);
      expect(mockPrisma[tabla].findUnique).toHaveBeenCalledWith({
        where: { id },
        select: undefined,
        include: undefined
      });
    });

    it('debería retornar null si el registro no se encuentra', async () => {
      const tabla = 'usuarios';
      const id = 99;

      mockPrisma[tabla].findUnique.mockResolvedValue(null);

      const resultado = await ServicioBaseCRUD.obtenerPorId(tabla, id);

      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBeNull();
    });
  });

});
