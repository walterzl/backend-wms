const prisma = require("../configuracion/prismaClient");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

/**
 * Controlador de Stock por Ubicaciones
 * Maneja todas las operaciones relacionadas con el control de stock por ubicaciones
 */
class ControladorStockUbicaciones {
  /**
   * Obtiene todo el stock por ubicaciones con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerStockUbicaciones(req, res) {
    try {
      const {
        planta,
        bodega,
        material_id,
        ubicacion_id,
        con_stock = true,
        pagina = 1,
        limite = 50,
      } = req.query;

      // Construir filtros
      const filtros = {};

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (bodega) {
        filtros.bodega = {
          contains: bodega,
          mode: "insensitive",
        };
      }

      if (material_id) {
        filtros.material_id = parseInt(material_id);
      }

      if (ubicacion_id) {
        filtros.ubicacion_id = parseInt(ubicacion_id);
      }

      // Filtrar solo ubicaciones con stock si se solicita
      if (con_stock === "true" || con_stock === true) {
        filtros.cantidad_actual = {
          gt: 0,
        };
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener stock con relaciones
      const [stockUbicaciones, total] = await Promise.all([
        prisma.stock_ubicaciones.findMany({
          where: filtros,
          include: {
            materiales: {
              select: {
                id: true,
                codigo_ranco: true,
                nombre_material: true,
                unidad_medida: true,
                clasificacion: true,
              },
            },
            ubicacion: {
              select: {
                id: true,
                title: true,
                bodega_deposito: true,
                planta: true,
              },
            },
          },
          orderBy: [
            { cantidad_actual: "desc" },
            { planta: "asc" },
            { bodega: "asc" },
            { ubicacion_nombre: "asc" },
          ],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.stock_ubicaciones.count({ where: filtros }),
      ]);

      // Formatear datos
      const stockFormateado = stockUbicaciones.map((stock) => ({
        id: stock.id,
        material: {
          id: stock.material_id,
          codigo: stock.codigo_material,
          nombre: stock.nombre_material,
          completo: stock.materiales,
        },
        ubicacion: {
          id: stock.ubicacion_id,
          planta: stock.planta,
          bodega: stock.bodega,
          nombre: stock.ubicacion_nombre,
          completo: stock.ubicacion,
        },
        lote: stock.lote,
        cantidad_actual: parseFloat(stock.cantidad_actual),
        cantidad_reservada: parseFloat(stock.cantidad_reservada || 0),
        cantidad_disponible:
          parseFloat(stock.cantidad_actual) -
          parseFloat(stock.cantidad_reservada || 0),
        fecha_ultimo_movimiento: stock.fecha_ultimo_movimiento,
        fecha_actualizacion: stock.fecha_actualizacion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          stock: stockFormateado,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Stock por ubicaciones obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener stock por ubicaciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener stock por ubicaciones",
        "ERROR_OBTENER_STOCK_UBICACIONES"
      );
    }
  }

  /**
   * Obtiene stock por material específico
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerStockPorMaterial(req, res) {
    try {
      const { material_id } = req.params;
      const { planta, con_stock = true } = req.query;

      const filtros = {
        material_id: parseInt(material_id),
      };

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (con_stock === "true" || con_stock === true) {
        filtros.cantidad_actual = {
          gt: 0,
        };
      }

      const stockMaterial = await prisma.stock_ubicaciones.findMany({
        where: filtros,
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
              unidad_medida: true,
            },
          },
          ubicacion: {
            select: {
              title: true,
              bodega_deposito: true,
              planta: true,
            },
          },
        },
        orderBy: [
          { cantidad_actual: "desc" },
          { planta: "asc" },
          { bodega: "asc" },
        ],
      });

      // Calcular totales
      const stockTotal = stockMaterial.reduce((total, stock) => {
        return total + parseFloat(stock.cantidad_actual);
      }, 0);

      const stockReservado = stockMaterial.reduce((total, stock) => {
        return total + parseFloat(stock.cantidad_reservada || 0);
      }, 0);

      const stockFormateado = stockMaterial.map((stock) => ({
        id: stock.id,
        planta: stock.planta,
        bodega: stock.bodega,
        ubicacion: stock.ubicacion_nombre,
        lote: stock.lote,
        cantidad_actual: parseFloat(stock.cantidad_actual),
        cantidad_reservada: parseFloat(stock.cantidad_reservada || 0),
        cantidad_disponible:
          parseFloat(stock.cantidad_actual) -
          parseFloat(stock.cantidad_reservada || 0),
        fecha_ultimo_movimiento: stock.fecha_ultimo_movimiento,
        ubicacion_completa: stock.ubicacion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          material: stockMaterial[0]?.materiales || null,
          ubicaciones: stockFormateado,
          resumen: {
            stock_total: stockTotal,
            stock_reservado: stockReservado,
            stock_disponible: stockTotal - stockReservado,
            ubicaciones_count: stockFormateado.length,
          },
        },
        "Stock por material obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener stock por material:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener stock por material",
        "ERROR_OBTENER_STOCK_MATERIAL"
      );
    }
  }

  /**
   * Obtiene stock por ubicación específica
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerStockPorUbicacion(req, res) {
    try {
      const { ubicacion_id } = req.params;
      const { con_stock = true } = req.query;

      const filtros = {
        ubicacion_id: parseInt(ubicacion_id),
      };

      if (con_stock === "true" || con_stock === true) {
        filtros.cantidad_actual = {
          gt: 0,
        };
      }

      const stockUbicacion = await prisma.stock_ubicaciones.findMany({
        where: filtros,
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
              unidad_medida: true,
              clasificacion: true,
            },
          },
          ubicacion: {
            select: {
              title: true,
              bodega_deposito: true,
              planta: true,
            },
          },
        },
        orderBy: [{ cantidad_actual: "desc" }, { codigo_material: "asc" }],
      });

      const stockFormateado = stockUbicacion.map((stock) => ({
        id: stock.id,
        material: {
          id: stock.material_id,
          codigo: stock.codigo_material,
          nombre: stock.nombre_material,
          completo: stock.materiales,
        },
        lote: stock.lote,
        cantidad_actual: parseFloat(stock.cantidad_actual),
        cantidad_reservada: parseFloat(stock.cantidad_reservada || 0),
        cantidad_disponible:
          parseFloat(stock.cantidad_actual) -
          parseFloat(stock.cantidad_reservada || 0),
        fecha_ultimo_movimiento: stock.fecha_ultimo_movimiento,
        fecha_actualizacion: stock.fecha_actualizacion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          ubicacion: stockUbicacion[0]?.ubicacion || null,
          materiales: stockFormateado,
          resumen: {
            materiales_count: stockFormateado.length,
            stock_total: stockFormateado.reduce(
              (total, stock) => total + stock.cantidad_actual,
              0
            ),
          },
        },
        "Stock por ubicación obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener stock por ubicación:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener stock por ubicación",
        "ERROR_OBTENER_STOCK_UBICACION"
      );
    }
  }

  /**
   * Busca stock por criterios múltiples
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarStock(req, res) {
    try {
      const { termino } = req.query;
      const { limite = 20 } = req.query;

      if (!termino || termino.trim().length < 2) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Término de búsqueda debe tener al menos 2 caracteres"],
          "Datos de entrada inválidos"
        );
      }

      const terminoBusqueda = termino.trim();

      const stock = await prisma.stock_ubicaciones.findMany({
        where: {
          OR: [
            {
              codigo_material: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              nombre_material: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              bodega: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              ubicacion_nombre: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              lote: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
          ],
          cantidad_actual: {
            gt: 0,
          },
        },
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
            },
          },
        },
        orderBy: [{ cantidad_actual: "desc" }],
        take: parseInt(limite),
      });

      const stockFormateado = stock.map((item) => ({
        id: item.id,
        codigo_material: item.codigo_material,
        nombre_material: item.nombre_material,
        planta: item.planta,
        bodega: item.bodega,
        ubicacion: item.ubicacion_nombre,
        lote: item.lote,
        cantidad_actual: parseFloat(item.cantidad_actual),
        cantidad_disponible:
          parseFloat(item.cantidad_actual) -
          parseFloat(item.cantidad_reservada || 0),
      }));

      return ManejadorRespuestas.exito(
        res,
        stockFormateado,
        `Se encontraron ${stockFormateado.length} registros de stock`
      );
    } catch (error) {
      console.error("Error al buscar stock:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar stock",
        "ERROR_BUSCAR_STOCK"
      );
    }
  }

  /**
   * Obtiene resumen consolidado de stock
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenStock(req, res) {
    try {
      const { planta, bodega } = req.query;

      const filtros = {
        cantidad_actual: {
          gt: 0,
        },
      };

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (bodega) {
        filtros.bodega = {
          contains: bodega,
          mode: "insensitive",
        };
      }

      // Obtener resumen agrupado por material
      const resumenPorMaterial = await prisma.stock_ubicaciones.groupBy({
        by: ["codigo_material", "nombre_material", "planta"],
        where: filtros,
        _sum: {
          cantidad_actual: true,
          cantidad_reservada: true,
        },
        _count: {
          id: true,
        },
      });

      // Obtener resumen agrupado por ubicación
      const resumenPorUbicacion = await prisma.stock_ubicaciones.groupBy({
        by: ["planta", "bodega"],
        where: filtros,
        _sum: {
          cantidad_actual: true,
          cantidad_reservada: true,
        },
        _count: {
          id: true,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        {
          resumen_por_material: resumenPorMaterial,
          resumen_por_ubicacion: resumenPorUbicacion,
          totales: {
            total_registros: resumenPorMaterial.reduce(
              (total, item) => total + item._count.id,
              0
            ),
            materiales_distintos: resumenPorMaterial.length,
            ubicaciones_distintas: resumenPorUbicacion.length,
          },
        },
        "Resumen de stock obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener resumen de stock:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener resumen de stock",
        "ERROR_OBTENER_RESUMEN_STOCK"
      );
    }
  }

  /**
   * Obtiene un registro de stock por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerStockPorId(req, res) {
    try {
      const { id } = req.params;

      const stock = await prisma.stock_ubicaciones.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          ubicacion: true,
        },
      });

      if (!stock) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Registro de stock con ID ${id} no encontrado`
        );
      }

      const stockFormateado = {
        id: stock.id,
        material: {
          id: stock.material_id,
          codigo: stock.codigo_material,
          nombre: stock.nombre_material,
          completo: stock.materiales,
        },
        ubicacion: {
          id: stock.ubicacion_id,
          planta: stock.planta,
          bodega: stock.bodega,
          nombre: stock.ubicacion_nombre,
          completo: stock.ubicacion,
        },
        lote: stock.lote,
        cantidad_actual: parseFloat(stock.cantidad_actual),
        cantidad_reservada: parseFloat(stock.cantidad_reservada || 0),
        cantidad_disponible:
          parseFloat(stock.cantidad_actual) -
          parseFloat(stock.cantidad_reservada || 0),
        fecha_ultimo_movimiento: stock.fecha_ultimo_movimiento,
        fecha_actualizacion: stock.fecha_actualizacion,
      };

      return ManejadorRespuestas.exito(
        res,
        stockFormateado,
        "Registro de stock obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener registro de stock:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener registro de stock",
        "ERROR_OBTENER_REGISTRO_STOCK"
      );
    }
  }
}

module.exports = ControladorStockUbicaciones;
