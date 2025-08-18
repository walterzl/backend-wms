const prisma = require('../configuracion/prismaClient');
const ManejadorRespuestas = require('../utilidades/ManejadorRespuestas');

/**
 * Servicio base para operaciones CRUD comunes
 * Centraliza la lógica repetitiva de consultas a base de datos
 */
class ServicioBaseCRUD {

  /**
   * Obtiene todos los registros de una tabla con filtros opcionales
   * @param {string} tabla - Nombre de la tabla
   * @param {object} filtros - Filtros para la consulta
   * @param {object} opciones - Opciones adicionales (select, orderBy, etc.)
   */
  static async obtenerTodos(tabla, filtros = {}, opciones = {}) {
    try {
      const {
        select = undefined,
        orderBy = undefined,
        incluir = undefined
      } = opciones;

      const resultado = await prisma[tabla].findMany({
        where: filtros,
        select,
        orderBy,
        include: incluir
      });

      return {
        exito: true,
        datos: resultado,
        total: resultado.length
      };
    } catch (error) {
      console.error(`Error al obtener registros de ${tabla}:`, error);
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene un registro por ID
   * @param {string} tabla - Nombre de la tabla
   * @param {number} id - ID del registro
   * @param {object} opciones - Opciones adicionales
   */
  static async obtenerPorId(tabla, id, opciones = {}) {
    try {
      const {
        select = undefined,
        incluir = undefined
      } = opciones;

      const resultado = await prisma[tabla].findUnique({
        where: { id },
        select,
        include: incluir
      });

      return {
        exito: true,
        datos: resultado
      };
    } catch (error) {
      console.error(`Error al obtener registro de ${tabla} con ID ${id}:`, error);
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene registros activos (filtro estándar por campo 'activo')
   * @param {string} tabla - Nombre de la tabla
   * @param {boolean} activo - Estado activo
   * @param {object} opciones - Opciones adicionales
   */
  static async obtenerActivos(tabla, activo = true, opciones = {}) {
    return this.obtenerTodos(tabla, { activo }, opciones);
  }

  /**
   * Busca registros por un campo específico
   * @param {string} tabla - Nombre de la tabla
   * @param {string} campo - Campo de búsqueda
   * @param {any} valor - Valor a buscar
   * @param {object} opciones - Opciones adicionales
   */
  static async buscarPorCampo(tabla, campo, valor, opciones = {}) {
    return this.obtenerTodos(tabla, { [campo]: valor }, opciones);
  }

  /**
   * Cuenta registros con filtros opcionales
   * @param {string} tabla - Nombre de la tabla
   * @param {object} filtros - Filtros para el conteo
   */
  static async contar(tabla, filtros = {}) {
    try {
      const total = await prisma[tabla].count({
        where: filtros
      });

      return {
        exito: true,
        total
      };
    } catch (error) {
      console.error(`Error al contar registros de ${tabla}:`, error);
      return {
        exito: false,
        error: error.message
      };
    }
  }
}

module.exports = ServicioBaseCRUD;