const prisma = require("../configuracion/prismaClient");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

/**
 * Controlador de Inventario
 * Maneja todas las operaciones relacionadas con el inventario
 */
class ControladorInventario {
  /**
   * Obtiene todo el inventario con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerInventario(req, res) {
    try {
      const {
        planta,
        material_id,
        fecha_desde,
        fecha_hasta,
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

      if (material_id) {
        filtros.material_id = parseInt(material_id);
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_inventario = {};
        if (fecha_desde) {
          filtros.fecha_inventario.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_inventario.lte = new Date(fecha_hasta);
        }
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener inventario con relaciones
      const [inventario, total] = await Promise.all([
        prisma.inventario.findMany({
          where: filtros,
          include: {
            materiales: {
              select: {
                id: true,
                codigo_ranco: true,
                nombre_material: true,
                unidad_medida: true,
              },
            },
            ubicacion_ref: {
              select: {
                id: true,
                title: true,
                bodega_deposito: true,
                planta: true,
              },
            },
          },
          orderBy: [{ fecha_inventario: "desc" }, { title: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.inventario.count({ where: filtros }),
      ]);

      // Formatear datos
      const inventarioFormateado = inventario.map((item) => ({
        id: item.id,
        planta: item.planta,
        codigo_material: item.title,
        nombre_material:
          item.nombre_material || item.materiales?.nombre_material,
        unidad_medida: item.unidad_medida || item.materiales?.unidad_medida,
        cod_nombre: item.cod_nombre,
        fecha_inventario: item.fecha_inventario,
        pallets: item.pallets || 0,
        stock: parseFloat(item.stock),
        bodega: item.bodega || item.ubicacion_ref?.bodega_deposito,
        ubicacion: item.ubicacion || item.ubicacion_ref?.title,
        lote: item.lote,
        condicion_armado: item.condicion_armado,
        contado_por: item.contado_por,
        fecha_creacion: item.fecha_creacion,
        fecha_actualizacion: item.fecha_actualizacion,
        material_completo: item.materiales,
        ubicacion_completa: item.ubicacion_ref,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          inventario: inventarioFormateado,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Inventario obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener inventario",
        "ERROR_OBTENER_INVENTARIO"
      );
    }
  }

  /**
   * Obtiene un registro de inventario por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerInventarioPorId(req, res) {
    try {
      const { id } = req.params;

      const inventario = await prisma.inventario.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          ubicacion_ref: true,
        },
      });

      if (!inventario) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Registro de inventario con ID ${id} no encontrado`
        );
      }

      const inventarioFormateado = {
        id: inventario.id,
        planta: inventario.planta,
        codigo_material: inventario.title,
        nombre_material:
          inventario.nombre_material || inventario.materiales?.nombre_material,
        unidad_medida:
          inventario.unidad_medida || inventario.materiales?.unidad_medida,
        cod_nombre: inventario.cod_nombre,
        fecha_inventario: inventario.fecha_inventario,
        pallets: inventario.pallets || 0,
        stock: parseFloat(inventario.stock),
        bodega: inventario.bodega || inventario.ubicacion_ref?.bodega_deposito,
        ubicacion: inventario.ubicacion || inventario.ubicacion_ref?.title,
        lote: inventario.lote,
        condicion_armado: inventario.condicion_armado,
        contado_por: inventario.contado_por,
        fecha_creacion: inventario.fecha_creacion,
        fecha_actualizacion: inventario.fecha_actualizacion,
        material_completo: inventario.materiales,
        ubicacion_completa: inventario.ubicacion_ref,
      };

      return ManejadorRespuestas.exito(
        res,
        inventarioFormateado,
        "Registro de inventario obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener registro de inventario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener registro de inventario",
        "ERROR_OBTENER_REGISTRO_INVENTARIO"
      );
    }
  }

  /**
   * Obtiene resumen de stock por material
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenStock(req, res) {
    try {
      const { planta, material_id } = req.query;

      const filtros = {};

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (material_id) {
        filtros.material_id = parseInt(material_id);
      }

      // Obtener stock agrupado por material
      const resumenStock = await prisma.inventario.groupBy({
        by: ["title", "planta", "material_id"],
        where: filtros,
        _sum: {
          stock: true,
          pallets: true,
        },
        _count: {
          id: true,
        },
      });

      // Enriquecer con información de materiales
      const resumenEnriquecido = await Promise.all(
        resumenStock.map(async (item) => {
          let material = null;
          if (item.material_id) {
            material = await prisma.materiales.findUnique({
              where: { id: item.material_id },
              select: {
                codigo_ranco: true,
                nombre_material: true,
                unidad_medida: true,
              },
            });
          }

          return {
            codigo_material: item.title,
            planta: item.planta,
            nombre_material: material?.nombre_material || null,
            unidad_medida: material?.unidad_medida || null,
            stock_total: parseFloat(item._sum.stock || 0),
            pallets_total: item._sum.pallets || 0,
            registros_count: item._count.id,
            material_id: item.material_id,
          };
        })
      );

      return ManejadorRespuestas.exito(
        res,
        resumenEnriquecido,
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
   * Obtiene inventario por planta
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerInventarioPorPlanta(req, res) {
    try {
      const { planta } = req.params;
      const { pagina = 1, limite = 50 } = req.query;

      if (!planta) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Planta requerida"],
          "Datos de entrada inválidos"
        );
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [inventario, total] = await Promise.all([
        prisma.inventario.findMany({
          where: {
            planta: {
              equals: planta,
              mode: "insensitive",
            },
          },
          include: {
            materiales: {
              select: {
                codigo_ranco: true,
                nombre_material: true,
                unidad_medida: true,
              },
            },
            ubicacion_ref: {
              select: {
                title: true,
                bodega_deposito: true,
              },
            },
          },
          orderBy: [{ fecha_inventario: "desc" }, { title: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.inventario.count({
          where: {
            planta: {
              equals: planta,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const inventarioFormateado = inventario.map((item) => ({
        id: item.id,
        planta: item.planta,
        codigo_material: item.title,
        nombre_material:
          item.nombre_material || item.materiales?.nombre_material,
        unidad_medida: item.unidad_medida || item.materiales?.unidad_medida,
        fecha_inventario: item.fecha_inventario,
        stock: parseFloat(item.stock),
        pallets: item.pallets || 0,
        bodega: item.bodega || item.ubicacion_ref?.bodega_deposito,
        ubicacion: item.ubicacion || item.ubicacion_ref?.title,
        lote: item.lote,
        contado_por: item.contado_por,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          inventario: inventarioFormateado,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        `Inventario de planta ${planta.toUpperCase()} obtenido exitosamente`
      );
    } catch (error) {
      console.error("Error al obtener inventario por planta:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener inventario por planta",
        "ERROR_OBTENER_INVENTARIO_PLANTA"
      );
    }
  }

  /**
   * Busca inventario por material
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarInventarioPorMaterial(req, res) {
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

      const inventario = await prisma.inventario.findMany({
        where: {
          OR: [
            {
              title: {
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
              cod_nombre: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              materiales: {
                nombre_material: {
                  contains: terminoBusqueda,
                  mode: "insensitive",
                },
              },
            },
            {
              materiales: {
                codigo_ranco: {
                  contains: terminoBusqueda,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
              unidad_medida: true,
            },
          },
          ubicacion_ref: {
            select: {
              title: true,
              bodega_deposito: true,
              planta: true,
            },
          },
        },
        orderBy: [{ fecha_inventario: "desc" }],
        take: parseInt(limite),
      });

      const inventarioFormateado = inventario.map((item) => ({
        id: item.id,
        planta: item.planta,
        codigo_material: item.title,
        nombre_material:
          item.nombre_material || item.materiales?.nombre_material,
        unidad_medida: item.unidad_medida || item.materiales?.unidad_medida,
        fecha_inventario: item.fecha_inventario,
        stock: parseFloat(item.stock),
        pallets: item.pallets || 0,
        bodega: item.bodega || item.ubicacion_ref?.bodega_deposito,
        ubicacion: item.ubicacion || item.ubicacion_ref?.title,
        lote: item.lote,
      }));

      return ManejadorRespuestas.exito(
        res,
        inventarioFormateado,
        `Se encontraron ${inventarioFormateado.length} registros`
      );
    } catch (error) {
      console.error("Error al buscar inventario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar inventario",
        "ERROR_BUSCAR_INVENTARIO"
      );
    }
  }

  /**
   * Crea un nuevo registro de inventario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearInventario(req, res) {
    try {
      const {
        planta,
        title,
        nombre_material,
        unidad_medida,
        cod_nombre,
        fecha_inventario,
        pallets = 0,
        stock,
        bodega,
        ubicacion,
        lote,
        condicion_armado,
        contado_por,
        material_id,
        ubicacion_id,
      } = req.body;

      // Validaciones iniciales
      const erroresValidacion = [];

      if (!planta) erroresValidacion.push("Planta es requerida");
      if (!title)
        erroresValidacion.push("Código de material (title) es requerido");
      if (!fecha_inventario)
        erroresValidacion.push("Fecha de inventario es requerida");
      if (!stock || stock < 0)
        erroresValidacion.push("Stock debe ser mayor o igual a 0");
      if (!contado_por) erroresValidacion.push("Contado por es requerido");

      if (erroresValidacion.length > 0) {
        return ManejadorRespuestas.validacionFallida(
          res,
          erroresValidacion,
          "Datos de entrada inválidos"
        );
      }

      // Iniciar transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // Validar material si se proporciona ID
        let materialData = null;
        if (material_id) {
          materialData = await tx.materiales.findUnique({
            where: { id: parseInt(material_id), activo: true },
          });
          if (!materialData) {
            throw new Error("Material no encontrado o inactivo");
          }
        }

        // Validar ubicación si se proporciona ID
        let ubicacionData = null;
        if (ubicacion_id) {
          ubicacionData = await tx.ubicacion.findUnique({
            where: { id: parseInt(ubicacion_id), activo: true },
          });
          if (!ubicacionData) {
            throw new Error("Ubicación no encontrada o inactiva");
          }
        }

        // Crear registro de inventario
        const nuevoInventario = await tx.inventario.create({
          data: {
            planta: planta.toUpperCase(),
            title,
            nombre_material: nombre_material || materialData?.nombre_material,
            unidad_medida: unidad_medida || materialData?.unidad_medida,
            cod_nombre: cod_nombre || materialData?.cod_nombre,
            fecha_inventario: new Date(fecha_inventario),
            pallets: parseInt(pallets) || 0,
            stock: parseFloat(stock),
            bodega: bodega || ubicacionData?.bodega_deposito,
            ubicacion: ubicacion || ubicacionData?.title,
            lote,
            condicion_armado,
            contado_por,
            material_id: material_id ? parseInt(material_id) : null,
            ubicacion_id: ubicacion_id ? parseInt(ubicacion_id) : null,
          },
          include: {
            materiales: true,
            ubicacion_ref: true,
          },
        });

        // Actualizar stock consolidado si existe material_id y ubicacion_id
        if (material_id && ubicacion_id) {
          const loteValue = lote || "SIN_LOTE"; // Usar valor por defecto si lote es null

          await tx.stock_ubicaciones.upsert({
            where: {
              material_id_ubicacion_id_lote: {
                material_id: parseInt(material_id),
                ubicacion_id: parseInt(ubicacion_id),
                lote: loteValue,
              },
            },
            update: {
              cantidad_actual: parseFloat(stock),
              fecha_ultimo_movimiento: new Date(),
              fecha_actualizacion: new Date(),
            },
            create: {
              material_id: parseInt(material_id),
              codigo_material: title,
              nombre_material: nombre_material || materialData?.nombre_material,
              ubicacion_id: parseInt(ubicacion_id),
              planta: planta.toUpperCase(),
              bodega: bodega || ubicacionData?.bodega_deposito,
              ubicacion_nombre: ubicacion || ubicacionData?.title,
              lote: loteValue,
              cantidad_actual: parseFloat(stock),
              cantidad_reservada: 0,
              fecha_ultimo_movimiento: new Date(),
            },
          });
        }

        return nuevoInventario;
      });

      // Formatear respuesta
      const inventarioFormateado = {
        id: resultado.id,
        planta: resultado.planta,
        codigo_material: resultado.title,
        nombre_material:
          resultado.nombre_material || resultado.materiales?.nombre_material,
        unidad_medida:
          resultado.unidad_medida || resultado.materiales?.unidad_medida,
        cod_nombre: resultado.cod_nombre,
        fecha_inventario: resultado.fecha_inventario,
        pallets: resultado.pallets || 0,
        stock: parseFloat(resultado.stock),
        bodega: resultado.bodega || resultado.ubicacion_ref?.bodega_deposito,
        ubicacion: resultado.ubicacion || resultado.ubicacion_ref?.title,
        lote: resultado.lote,
        condicion_armado: resultado.condicion_armado,
        contado_por: resultado.contado_por,
        fecha_creacion: resultado.fecha_creacion,
        fecha_actualizacion: resultado.fecha_actualizacion,
        material_completo: resultado.materiales,
        ubicacion_completa: resultado.ubicacion_ref,
      };

      return ManejadorRespuestas.exito(
        res,
        inventarioFormateado,
        "Registro de inventario creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear registro de inventario:", error);
      console.error("Error stack:", error.stack);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);

      if (
        error.message.includes("no encontrado") ||
        error.message.includes("inactiv")
      ) {
        return ManejadorRespuestas.validacionFallida(
          res,
          [error.message],
          "Error de validación"
        );
      }

      return ManejadorRespuestas.error(
        res,
        `Error al crear registro de inventario: ${error.message}`,
        "ERROR_CREAR_INVENTARIO"
      );
    }
  }
}

module.exports = ControladorInventario;
