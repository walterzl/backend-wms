const prisma = require("../configuracion/prismaClient");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");

/**
 * Controlador de Reportes
 * Maneja todas las operaciones relacionadas con reportes y estadísticas
 */
class ControladorReportes {
  /**
   * Obtiene lista de reportes disponibles
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerReportes(req, res) {
    try {
      const reportesDisponibles = {
        reportes_inventario: {
          titulo: "Reportes de Inventario",
          descripcion:
            "Reportes relacionados con el stock y ubicación de materiales",
          endpoints: [
            {
              nombre: "Inventario por Planta",
              endpoint: "/api/reportes/inventario/planta",
              metodo: "GET",
              parametros: ["planta", "fecha_desde?", "fecha_hasta?"],
              descripcion: "Obtiene reporte de inventario filtrado por planta",
            },
          ],
        },
        reportes_movimientos: {
          titulo: "Reportes de Movimientos",
          descripcion: "Reportes de trazabilidad y movimientos de materiales",
          endpoints: [
            {
              nombre: "Movimientos por Período",
              endpoint: "/api/reportes/movimientos/periodo",
              metodo: "GET",
              parametros: ["fecha_desde", "fecha_fin", "planta?", "material?"],
              descripcion:
                "Obtiene reporte de movimientos en un período específico",
            },
          ],
        },
        reportes_stock: {
          titulo: "Reportes de Stock",
          descripcion: "Reportes de análisis de stock y materiales",
          endpoints: [
            {
              nombre: "Stock por Material",
              endpoint: "/api/reportes/stock/material",
              metodo: "GET",
              parametros: ["material", "planta?"],
              descripcion: "Obtiene reporte detallado de stock de un material",
            },
          ],
        },
        dashboard: {
          titulo: "Dashboard",
          descripcion: "Información consolidada del sistema",
          endpoints: [
            {
              nombre: "Dashboard Principal",
              endpoint: "/api/reportes/dashboard",
              metodo: "GET",
              parametros: ["planta?"],
              descripcion: "Obtiene métricas consolidadas para el dashboard",
            },
          ],
        },
        auditoria: {
          titulo: "Reportes de Auditoría",
          descripcion:
            "Reportes de auditoría del sistema (requiere permisos especiales)",
          endpoints: [
            {
              nombre: "Auditoría del Sistema",
              endpoint: "/api/reportes/auditoria",
              metodo: "GET",
              parametros: ["fecha_desde", "fecha_hasta", "usuario?", "modulo?"],
              descripcion: "Obtiene reporte de auditoría del sistema",
              requiere_permisos: ["administrador", "supervisor"],
            },
          ],
        },
      };

      return ManejadorRespuestas.exito(
        res,
        {
          reportes: reportesDisponibles,
          total_categorias: Object.keys(reportesDisponibles).length,
          usuario_rol: req.usuario?.rol,
          planta_usuario: req.usuario?.planta_asignada,
        },
        "Reportes disponibles obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener reportes:", error);
      return ManejadorRespuestas.error(
        res,
        "Error interno del servidor al obtener reportes",
        CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO,
        error
      );
    }
  }

  /**
   * Obtiene reporte de inventario por planta
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async reporteInventarioPlanta(req, res) {
    try {
      const { planta, fecha_desde, fecha_hasta } = req.query;

      if (!planta) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Planta requerida"],
          "Datos de entrada inválidos"
        );
      }

      const filtros = {
        planta: {
          equals: planta,
          mode: "insensitive",
        },
      };

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_inventario = {};
        if (fecha_desde) {
          filtros.fecha_inventario.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_inventario.lte = new Date(fecha_hasta);
        }
      }

      // Obtener resumen de inventario
      const resumenInventario = await prisma.inventario.groupBy({
        by: ["title", "planta"],
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
      const reporte = await Promise.all(
        resumenInventario.map(async (item) => {
          // Buscar material por código
          const material = await prisma.materiales.findFirst({
            where: {
              codigo_ranco: item.title,
            },
            select: {
              id: true,
              codigo_ranco: true,
              nombre_material: true,
              unidad_medida: true,
              clasificacion: true,
            },
          });

          return {
            planta: item.planta,
            codigo_material: item.title,
            nombre_material: material?.nombre_material || null,
            unidad_medida: material?.unidad_medida || null,
            clasificacion: material?.clasificacion || null,
            stock_total: parseFloat(item._sum.stock || 0),
            pallets_total: item._sum.pallets || 0,
            registros_inventario: item._count.id,
            material_id: material?.id || null,
          };
        })
      );

      const resumenGeneral = {
        planta: {
          equals: planta,
          mode: "insensitive",
        },
        fecha_reporte: new Date(),
        periodo: {
          fecha_desde: fecha_desde || null,
          fecha_hasta: fecha_hasta || null,
        },
        total_materiales: reporte.length,
        stock_total_general: reporte.reduce(
          (acc, item) => acc + item.stock_total,
          0
        ),
        pallets_total_general: reporte.reduce(
          (acc, item) => acc + item.pallets_total,
          0
        ),
      };

      return ManejadorRespuestas.exito(
        res,
        {
          resumen: resumenGeneral,
          detalle: reporte,
        },
        "Reporte de inventario por planta generado exitosamente"
      );
    } catch (error) {
      console.error(
        "Error al generar reporte de inventario por planta:",
        error
      );
      return ManejadorRespuestas.error(
        res,
        "Error al generar reporte de inventario",
        "ERROR_REPORTE_INVENTARIO_PLANTA"
      );
    }
  }

  /**
   * Obtiene reporte de movimientos por período
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async reporteMovimientosPeriodo(req, res) {
    try {
      const {
        fecha_desde,
        fecha_hasta,
        planta,
        tipo_movimiento,
        agrupar_por = "fecha",
      } = req.query;

      const filtros = {};

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (tipo_movimiento) {
        filtros.tipo_movimiento = tipo_movimiento;
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha = {};
        if (fecha_desde) {
          filtros.fecha.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha.lte = new Date(fecha_hasta);
        }
      }

      let groupBy = [];
      switch (agrupar_por) {
        case "tipo_movimiento":
          groupBy = ["tipo_movimiento"];
          break;
        case "planta":
          groupBy = ["planta"];
          break;
        case "material":
          groupBy = ["title", "material_id"];
          break;
        case "fecha":
        default:
          groupBy = ["fecha"];
          break;
      }

      // Obtener movimientos agrupados
      const movimientosAgrupados =
        await prisma.trazabilidad_materiales_r9.groupBy({
          by: groupBy,
          where: filtros,
          _sum: {
            cantidad: true,
            total_pallet: true,
          },
          _count: {
            id: true,
          },
          orderBy: groupBy.length === 1 ? { [groupBy[0]]: "desc" } : undefined,
        });

      // Enriquecer datos según el tipo de agrupación
      let reporte = [];
      if (agrupar_por === "material") {
        reporte = await Promise.all(
          movimientosAgrupados.map(async (item) => {
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
              material_id: item.material_id,
              nombre_material: material?.nombre_material || null,
              unidad_medida: material?.unidad_medida || null,
              cantidad_total: parseFloat(item._sum.cantidad || 0),
              pallets_total: item._sum.total_pallet || 0,
              total_movimientos: item._count.id,
            };
          })
        );
      } else {
        reporte = movimientosAgrupados.map((item) => ({
          ...item,
          cantidad_total: parseFloat(item._sum.cantidad || 0),
          pallets_total: item._sum.total_pallet || 0,
          total_movimientos: item._count.id,
        }));
      }

      const resumenGeneral = {
        periodo: {
          fecha_desde: fecha_desde || null,
          fecha_hasta: fecha_hasta || null,
        },
        filtros: {
          planta: planta || "Todas",
          tipo_movimiento: tipo_movimiento || "Todos",
        },
        agrupado_por: agrupar_por,
        fecha_reporte: new Date(),
        totales: {
          cantidad_total: reporte.reduce(
            (acc, item) => acc + item.cantidad_total,
            0
          ),
          pallets_total: reporte.reduce(
            (acc, item) => acc + item.pallets_total,
            0
          ),
          movimientos_total: reporte.reduce(
            (acc, item) => acc + item.total_movimientos,
            0
          ),
        },
      };

      return ManejadorRespuestas.exito(
        res,
        {
          resumen: resumenGeneral,
          detalle: reporte,
        },
        "Reporte de movimientos por período generado exitosamente"
      );
    } catch (error) {
      console.error("Error al generar reporte de movimientos:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al generar reporte de movimientos",
        "ERROR_REPORTE_MOVIMIENTOS"
      );
    }
  }

  /**
   * Obtiene reporte de stock por material
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async reporteStockMaterial(req, res) {
    try {
      const {
        material_id,
        codigo_material,
        incluir_movimientos = false,
      } = req.query;

      if (!material_id && !codigo_material) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Se requiere material_id o codigo_material"],
          "Datos de entrada inválidos"
        );
      }

      let material = null;

      if (material_id) {
        material = await prisma.materiales.findUnique({
          where: { id: parseInt(material_id) },
        });
      } else {
        material = await prisma.materiales.findFirst({
          where: { codigo_ranco: codigo_material },
        });
      }

      if (!material) {
        return ManejadorRespuestas.noEncontrado(res, "Material no encontrado");
      }

      // Obtener stock actual por planta
      const stockPorPlanta = await prisma.inventario.groupBy({
        by: ["planta"],
        where: {
          material_id: material.id,
        },
        _sum: {
          stock: true,
          pallets: true,
        },
        _count: {
          id: true,
        },
      });

      const stockDetalle = stockPorPlanta.map((item) => ({
        planta: item.planta,
        stock_total: parseFloat(item._sum.stock || 0),
        pallets_total: item._sum.pallets || 0,
        registros_inventario: item._count.id,
      }));

      let movimientosRecientes = [];
      if (incluir_movimientos === "true" || incluir_movimientos === true) {
        // Obtener últimos 10 movimientos del material
        movimientosRecientes = await prisma.trazabilidad_materiales_r9.findMany(
          {
            where: {
              material_id: material.id,
            },
            include: {
              proveedores: {
                select: { title: true },
              },
            },
            orderBy: { fecha: "desc" },
            take: 10,
          }
        );

        movimientosRecientes = movimientosRecientes.map((mov) => ({
          id: mov.id,
          tipo_movimiento: mov.tipo_movimiento,
          fecha: mov.fecha,
          planta: mov.planta,
          cantidad: parseFloat(mov.cantidad),
          proveedor: mov.proveedor || mov.proveedores?.title,
          bodega_origen: mov.bod_origen,
          bodega_destino: mov.bod_destino,
        }));
      }

      const reporte = {
        material: {
          id: material.id,
          codigo: material.codigo_ranco,
          nombre: material.nombre_material,
          unidad_medida: material.unidad_medida,
          clasificacion: material.clasificacion,
          requiere_frio: material.frio === "Si",
        },
        stock_por_planta: stockDetalle,
        totales: {
          stock_total_general: stockDetalle.reduce(
            (acc, item) => acc + item.stock_total,
            0
          ),
          pallets_total_general: stockDetalle.reduce(
            (acc, item) => acc + item.pallets_total,
            0
          ),
          plantas_con_stock: stockDetalle.filter((item) => item.stock_total > 0)
            .length,
        },
        movimientos_recientes: incluir_movimientos ? movimientosRecientes : [],
        fecha_reporte: new Date(),
      };

      return ManejadorRespuestas.exito(
        res,
        reporte,
        "Reporte de stock por material generado exitosamente"
      );
    } catch (error) {
      console.error("Error al generar reporte de stock:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al generar reporte de stock",
        "ERROR_REPORTE_STOCK"
      );
    }
  }

  /**
   * Obtiene dashboard con métricas generales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async dashboard(req, res) {
    try {
      const { planta } = req.query;

      const filtrosInventario = planta
        ? {
            planta: {
              equals: planta,
              mode: "insensitive",
            },
          }
        : {};
      const filtrosTrazabilidad = planta
        ? {
            planta: {
              equals: planta,
              mode: "insensitive",
            },
          }
        : {};

      // Fecha de hace 30 días para movimientos recientes
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const [
        // Métricas de inventario
        totalMateriales,
        totalStock,
        materialesConStock,
        // Métricas de trazabilidad
        movimientosHoy,
        movimientos30Dias,
        // Métricas generales
        totalUsuarios,
        temporadaActiva,
      ] = await Promise.all([
        // Inventario
        prisma.inventario
          .groupBy({
            by: ["title"],
            where: filtrosInventario,
            _count: { id: true },
          })
          .then((result) => result.length),

        prisma.inventario
          .aggregate({
            where: filtrosInventario,
            _sum: { stock: true },
          })
          .then((result) => parseFloat(result._sum.stock || 0)),

        prisma.inventario
          .groupBy({
            by: ["title"],
            where: {
              ...filtrosInventario,
              stock: { gt: 0 },
            },
          })
          .then((result) => result.length),

        // Trazabilidad
        prisma.trazabilidad_materiales_r9.count({
          where: {
            ...filtrosTrazabilidad,
            fecha: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),

        prisma.trazabilidad_materiales_r9.count({
          where: {
            ...filtrosTrazabilidad,
            fecha: { gte: hace30Dias },
          },
        }),

        // Generales
        prisma.usuarios.count({ where: { activo: true } }),
        prisma.temporadas_app.findFirst({ where: { activo: true } }),
      ]);

      // Obtener movimientos por tipo (últimos 30 días)
      const movimientosPorTipo =
        await prisma.trazabilidad_materiales_r9.groupBy({
          by: ["tipo_movimiento"],
          where: {
            ...filtrosTrazabilidad,
            fecha: { gte: hace30Dias },
          },
          _count: { id: true },
          _sum: { cantidad: true },
        });

      // Obtener top 5 materiales más movidos
      const materialesMasMovidos =
        await prisma.trazabilidad_materiales_r9.groupBy({
          by: ["title", "material_id"],
          where: {
            ...filtrosTrazabilidad,
            fecha: { gte: hace30Dias },
          },
          _count: { id: true },
          _sum: { cantidad: true },
          orderBy: {
            _count: { id: "desc" },
          },
          take: 5,
        });

      // Enriquecer con nombres de materiales
      const topMateriales = await Promise.all(
        materialesMasMovidos.map(async (item) => {
          let material = null;
          if (item.material_id) {
            material = await prisma.materiales.findUnique({
              where: { id: item.material_id },
              select: { nombre_material: true },
            });
          }

          return {
            codigo: item.title,
            nombre: material?.nombre_material || item.title,
            total_movimientos: item._count.id,
            cantidad_total: parseFloat(item._sum.cantidad || 0),
          };
        })
      );

      const dashboard = {
        fecha_actualizacion: new Date(),
        filtros: {
          planta: planta || "Todas las plantas",
        },
        metricas_inventario: {
          total_materiales: totalMateriales,
          stock_total: totalStock,
          materiales_con_stock: materialesConStock,
          materiales_sin_stock: totalMateriales - materialesConStock,
        },
        metricas_movimientos: {
          movimientos_hoy: movimientosHoy,
          movimientos_30_dias: movimientos30Dias,
          movimientos_por_tipo: movimientosPorTipo.map((item) => ({
            tipo_movimiento: item.tipo_movimiento,
            total_movimientos: item._count.id,
            cantidad_total: parseFloat(item._sum.cantidad || 0),
          })),
        },
        top_materiales: topMateriales,
        informacion_sistema: {
          usuarios_activos: totalUsuarios,
          temporada_activa: temporadaActiva
            ? temporadaActiva.title
            : "Sin temporada activa",
          plantas_disponibles: Object.values(CONSTANTES.PLANTAS),
        },
      };

      return ManejadorRespuestas.exito(
        res,
        dashboard,
        "Dashboard generado exitosamente"
      );
    } catch (error) {
      console.error("Error al generar dashboard:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al generar dashboard",
        "ERROR_DASHBOARD"
      );
    }
  }

  /**
   * Obtiene reporte de auditoría de logs del sistema
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async reporteAuditoria(req, res) {
    try {
      const {
        fecha_desde,
        fecha_hasta,
        usuario_id,
        accion,
        modulo,
        pagina = 1,
        limite = 100,
      } = req.query;

      const filtros = {};

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_creacion = {};
        if (fecha_desde) {
          filtros.fecha_creacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_creacion.lte = new Date(fecha_hasta);
        }
      }

      if (usuario_id) {
        filtros.usuario_id = parseInt(usuario_id);
      }

      if (accion) {
        filtros.accion = accion;
      }

      if (modulo) {
        filtros.modulo = modulo;
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [logs, total] = await Promise.all([
        prisma.logs_sistema.findMany({
          where: filtros,
          include: {
            usuarios: {
              select: {
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
          orderBy: { fecha_creacion: "desc" },
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.logs_sistema.count({ where: filtros }),
      ]);

      const reporte = {
        periodo: {
          fecha_desde: fecha_desde || null,
          fecha_hasta: fecha_hasta || null,
        },
        filtros_aplicados: {
          usuario_id: usuario_id || null,
          accion: accion || null,
          modulo: modulo || null,
        },
        paginacion: {
          pagina_actual: parseInt(pagina),
          total_paginas: Math.ceil(total / parseInt(limite)),
          total_registros: total,
          registros_por_pagina: parseInt(limite),
        },
        logs: logs.map((log) => ({
          id: log.id,
          fecha: log.fecha_creacion,
          usuario: {
            id: log.usuario_id,
            nombre_usuario: log.usuarios?.nombre_usuario,
            nombre_completo: log.usuarios?.nombre_completo,
          },
          accion: log.accion,
          modulo: log.modulo,
          descripcion: log.descripcion,
          ip_address: log.ip_address,
          datos_anteriores: log.datos_anteriores,
          datos_nuevos: log.datos_nuevos,
        })),
      };

      return ManejadorRespuestas.exito(
        res,
        reporte,
        "Reporte de auditoría generado exitosamente"
      );
    } catch (error) {
      console.error("Error al generar reporte de auditoría:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al generar reporte de auditoría",
        "ERROR_REPORTE_AUDITORIA"
      );
    }
  }
}

module.exports = ControladorReportes;
