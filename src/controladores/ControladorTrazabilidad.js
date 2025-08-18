const prisma = require("../configuracion/prismaClient");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

/**
 * Controlador de Trazabilidad
 * Maneja todas las operaciones relacionadas con la trazabilidad de materiales
 */
class ControladorTrazabilidad {
  /**
   * Obtiene todos los movimientos de trazabilidad con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMovimientos(req, res) {
    try {
      const {
        planta,
        material_id,
        proveedor_id,
        fecha_desde,
        fecha_hasta,
        tipo_movimiento,
        temporada_id,
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

      if (proveedor_id) {
        filtros.proveedor_id = parseInt(proveedor_id);
      }

      if (tipo_movimiento) {
        filtros.tipo_movimiento = tipo_movimiento;
      }

      if (temporada_id) {
        filtros.temporada_id = parseInt(temporada_id);
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

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener movimientos con relaciones
      const [movimientos, total] = await Promise.all([
        prisma.trazabilidad_materiales_r9.findMany({
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
            proveedores: {
              select: {
                id: true,
                title: true,
              },
            },
            temporadas_app: {
              select: {
                id: true,
                title: true,
              },
            },
            tipo_movimientos_app: {
              select: {
                id: true,
                title: true,
                descripcion: true,
              },
            },
            ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion:
              {
                select: {
                  id: true,
                  title: true,
                  bodega_deposito: true,
                  planta: true,
                },
              },
            ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion:
              {
                select: {
                  id: true,
                  title: true,
                  bodega_deposito: true,
                  planta: true,
                },
              },
          },
          orderBy: [{ fecha: "desc" }, { id: "desc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.trazabilidad_materiales_r9.count({ where: filtros }),
      ]);

      // Formatear datos
      const movimientosFormateados = movimientos.map((movimiento) => ({
        id: movimiento.id,
        tipo_movimiento: movimiento.tipo_movimiento,
        planta: movimiento.planta,
        guia_sii: movimiento.guia_sii,
        fecha: movimiento.fecha,
        mes: movimiento.mes,
        id_movimiento: movimiento.id_movimiento,
        proveedor: movimiento.proveedor || movimiento.proveedores?.title,
        lote: movimiento.lote,
        codigo_material: movimiento.title,
        nombre_material:
          movimiento.nombre || movimiento.materiales?.nombre_material,
        cod_nombre: movimiento.cod_nombre,
        clasificacion:
          movimiento.clasificacion || movimiento.materiales?.clasificacion,
        total_pallet: movimiento.total_pallet || 0,
        cantidad: parseFloat(movimiento.cantidad),
        unidad_medida:
          movimiento.unidad_medida || movimiento.materiales?.unidad_medida,
        bodega_origen: movimiento.bod_origen,
        bodega_destino: movimiento.bod_destino,
        ubicacion_origen: movimiento.ubicacion_origen,
        ubicacion_destino: movimiento.ubicacion_destino,
        turno: movimiento.turno,
        temporada: movimiento.temporada || movimiento.temporadas_app?.title,
        observacion: movimiento.observacion,
        bodega_stock: movimiento.bodega_stock,
        ubicacion_stock: movimiento.ubicacion_stock,
        total_stock: movimiento.total_stock
          ? parseFloat(movimiento.total_stock)
          : null,
        numero_embarque: movimiento.numero_embarque,
        patente_camion: movimiento.patente_camion,
        fecha_creacion: movimiento.fecha_creacion,
        fecha_actualizacion: movimiento.fecha_actualizacion,
        // Relaciones completas
        material_completo: movimiento.materiales,
        proveedor_completo: movimiento.proveedores,
        temporada_completa: movimiento.temporadas_app,
        tipo_movimiento_completo: movimiento.tipo_movimientos_app,
        ubicacion_origen_completa:
          movimiento.ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion,
        ubicacion_destino_completa:
          movimiento.ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          movimientos: movimientosFormateados,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Movimientos de trazabilidad obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener movimientos de trazabilidad:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener movimientos de trazabilidad",
        "ERROR_OBTENER_TRAZABILIDAD"
      );
    }
  }

  /**
   * Obtiene un movimiento de trazabilidad por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMovimientoPorId(req, res) {
    try {
      const { id } = req.params;

      const movimiento = await prisma.trazabilidad_materiales_r9.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          proveedores: true,
          temporadas_app: true,
          tipo_movimientos_app: true,
          ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion: true,
          ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion: true,
        },
      });

      if (!movimiento) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Movimiento con ID ${id} no encontrado`
        );
      }

      const movimientoFormateado = {
        id: movimiento.id,
        tipo_movimiento: movimiento.tipo_movimiento,
        planta: movimiento.planta,
        guia_sii: movimiento.guia_sii,
        fecha: movimiento.fecha,
        mes: movimiento.mes,
        id_movimiento: movimiento.id_movimiento,
        proveedor: movimiento.proveedor || movimiento.proveedores?.title,
        lote: movimiento.lote,
        codigo_material: movimiento.title,
        nombre_material:
          movimiento.nombre || movimiento.materiales?.nombre_material,
        cod_nombre: movimiento.cod_nombre,
        clasificacion:
          movimiento.clasificacion || movimiento.materiales?.clasificacion,
        total_pallet: movimiento.total_pallet || 0,
        cantidad: parseFloat(movimiento.cantidad),
        unidad_medida:
          movimiento.unidad_medida || movimiento.materiales?.unidad_medida,
        bodega_origen: movimiento.bod_origen,
        bodega_destino: movimiento.bod_destino,
        ubicacion_origen: movimiento.ubicacion_origen,
        ubicacion_destino: movimiento.ubicacion_destino,
        turno: movimiento.turno,
        temporada: movimiento.temporada || movimiento.temporadas_app?.title,
        observacion: movimiento.observacion,
        bodega_stock: movimiento.bodega_stock,
        ubicacion_stock: movimiento.ubicacion_stock,
        total_stock: movimiento.total_stock
          ? parseFloat(movimiento.total_stock)
          : null,
        numero_embarque: movimiento.numero_embarque,
        patente_camion: movimiento.patente_camion,
        fecha_creacion: movimiento.fecha_creacion,
        fecha_actualizacion: movimiento.fecha_actualizacion,
        // Relaciones completas
        material_completo: movimiento.materiales,
        proveedor_completo: movimiento.proveedores,
        temporada_completa: movimiento.temporadas_app,
        tipo_movimiento_completo: movimiento.tipo_movimientos_app,
        ubicacion_origen_completa:
          movimiento.ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion,
        ubicacion_destino_completa:
          movimiento.ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion,
      };

      return ManejadorRespuestas.exito(
        res,
        movimientoFormateado,
        "Movimiento obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener movimiento:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener movimiento",
        "ERROR_OBTENER_MOVIMIENTO"
      );
    }
  }

  /**
   * Obtiene movimientos por material
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMovimientosPorMaterial(req, res) {
    try {
      const { material_id } = req.params;
      const { pagina = 1, limite = 50 } = req.query;

      if (!material_id) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["ID de material requerido"],
          "Datos de entrada inválidos"
        );
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [movimientos, total] = await Promise.all([
        prisma.trazabilidad_materiales_r9.findMany({
          where: {
            material_id: parseInt(material_id),
          },
          include: {
            materiales: true,
            proveedores: {
              select: {
                title: true,
              },
            },
            temporadas_app: {
              select: {
                title: true,
              },
            },
            tipo_movimientos_app: {
              select: {
                title: true,
              },
            },
          },
          orderBy: [{ fecha: "desc" }, { id: "desc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.trazabilidad_materiales_r9.count({
          where: {
            material_id: parseInt(material_id),
          },
        }),
      ]);

      const movimientosFormateados = movimientos.map((movimiento) => ({
        id: movimiento.id,
        tipo_movimiento: movimiento.tipo_movimiento,
        planta: movimiento.planta,
        fecha: movimiento.fecha,
        id_movimiento: movimiento.id_movimiento,
        proveedor: movimiento.proveedor || movimiento.proveedores?.title,
        lote: movimiento.lote,
        cantidad: parseFloat(movimiento.cantidad),
        unidad_medida: movimiento.unidad_medida,
        bodega_origen: movimiento.bod_origen,
        bodega_destino: movimiento.bod_destino,
        temporada: movimiento.temporada || movimiento.temporadas_app?.title,
        observacion: movimiento.observacion,
        total_stock: movimiento.total_stock
          ? parseFloat(movimiento.total_stock)
          : null,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          movimientos: movimientosFormateados,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Movimientos del material obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener movimientos por material:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener movimientos por material",
        "ERROR_OBTENER_MOVIMIENTOS_MATERIAL"
      );
    }
  }

  /**
   * Obtiene movimientos por planta
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMovimientosPorPlanta(req, res) {
    try {
      const { planta } = req.params;
      const {
        fecha_desde,
        fecha_hasta,
        tipo_movimiento,
        pagina = 1,
        limite = 50,
      } = req.query;

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

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [movimientos, total] = await Promise.all([
        prisma.trazabilidad_materiales_r9.findMany({
          where: filtros,
          include: {
            materiales: {
              select: {
                codigo_ranco: true,
                nombre_material: true,
              },
            },
            proveedores: {
              select: {
                title: true,
              },
            },
            tipo_movimientos_app: {
              select: {
                title: true,
              },
            },
          },
          orderBy: [{ fecha: "desc" }, { id: "desc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.trazabilidad_materiales_r9.count({ where: filtros }),
      ]);

      const movimientosFormateados = movimientos.map((movimiento) => ({
        id: movimiento.id,
        tipo_movimiento: movimiento.tipo_movimiento,
        fecha: movimiento.fecha,
        id_movimiento: movimiento.id_movimiento,
        codigo_material: movimiento.title,
        nombre_material:
          movimiento.nombre || movimiento.materiales?.nombre_material,
        proveedor: movimiento.proveedor || movimiento.proveedores?.title,
        cantidad: parseFloat(movimiento.cantidad),
        unidad_medida: movimiento.unidad_medida,
        bodega_origen: movimiento.bod_origen,
        bodega_destino: movimiento.bod_destino,
        lote: movimiento.lote,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          movimientos: movimientosFormateados,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        `Movimientos de planta ${planta.toUpperCase()} obtenidos exitosamente`
      );
    } catch (error) {
      console.error("Error al obtener movimientos por planta:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener movimientos por planta",
        "ERROR_OBTENER_MOVIMIENTOS_PLANTA"
      );
    }
  }

  /**
   * Busca movimientos por término
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarMovimientos(req, res) {
    try {
      const { termino } = req.query;
      const { limite = 20 } = req.query;

      if (!termino || termino.trim().length < 3) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Término de búsqueda debe tener al menos 3 caracteres"],
          "Datos de entrada inválidos"
        );
      }

      const terminoBusqueda = termino.trim();

      const movimientos = await prisma.trazabilidad_materiales_r9.findMany({
        where: {
          OR: [
            {
              id_movimiento: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              guia_sii: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              nombre: {
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
            },
          },
          proveedores: {
            select: {
              title: true,
            },
          },
        },
        orderBy: [{ fecha: "desc" }],
        take: parseInt(limite),
      });

      const movimientosFormateados = movimientos.map((movimiento) => ({
        id: movimiento.id,
        tipo_movimiento: movimiento.tipo_movimiento,
        planta: movimiento.planta,
        fecha: movimiento.fecha,
        id_movimiento: movimiento.id_movimiento,
        codigo_material: movimiento.title,
        nombre_material:
          movimiento.nombre || movimiento.materiales?.nombre_material,
        proveedor: movimiento.proveedor || movimiento.proveedores?.title,
        cantidad: parseFloat(movimiento.cantidad),
        lote: movimiento.lote,
        guia_sii: movimiento.guia_sii,
      }));

      return ManejadorRespuestas.exito(
        res,
        movimientosFormateados,
        `Se encontraron ${movimientosFormateados.length} movimientos`
      );
    } catch (error) {
      console.error("Error al buscar movimientos:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar movimientos",
        "ERROR_BUSCAR_MOVIMIENTOS"
      );
    }
  }

  /**
   * Obtiene resumen de movimientos por período
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenMovimientos(req, res) {
    try {
      const { fecha_desde, fecha_hasta, planta, tipo_movimiento } = req.query;

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

      // Obtener resumen agrupado por tipo de movimiento
      const resumenPorTipo = await prisma.trazabilidad_materiales_r9.groupBy({
        by: ["tipo_movimiento"],
        where: filtros,
        _sum: {
          cantidad: true,
          total_pallet: true,
        },
        _count: {
          id: true,
        },
      });

      // Obtener resumen agrupado por planta
      const resumenPorPlanta = await prisma.trazabilidad_materiales_r9.groupBy({
        by: ["planta"],
        where: filtros,
        _sum: {
          cantidad: true,
          total_pallet: true,
        },
        _count: {
          id: true,
        },
      });

      const resumen = {
        periodo: {
          fecha_desde: fecha_desde || null,
          fecha_hasta: fecha_hasta || null,
        },
        por_tipo_movimiento: resumenPorTipo.map((item) => ({
          tipo_movimiento: item.tipo_movimiento,
          total_cantidad: parseFloat(item._sum.cantidad || 0),
          total_pallets: item._sum.total_pallet || 0,
          total_movimientos: item._count.id,
        })),
        por_planta: resumenPorPlanta.map((item) => ({
          planta: item.planta,
          total_cantidad: parseFloat(item._sum.cantidad || 0),
          total_pallets: item._sum.total_pallet || 0,
          total_movimientos: item._count.id,
        })),
      };

      return ManejadorRespuestas.exito(
        res,
        resumen,
        "Resumen de movimientos obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener resumen de movimientos:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener resumen de movimientos",
        "ERROR_OBTENER_RESUMEN_MOVIMIENTOS"
      );
    }
  }

  /**
   * Crea un movimiento manual de trazabilidad
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearMovimientoManual(req, res) {
    try {
      const {
        planta,
        fecha,
        tipo_movimiento,
        material_id,
        codigo_material,
        nombre_material,
        cantidad,
        lote,
        ubicacion_origen_id,
        ubicacion_destino_id,
        proveedor_id,
        temporada_id,
        tipo_movimiento_id,
        turno,
        guia_sii,
        numero_embarque,
        patente_camion,
        observacion,
      } = req.body;

      const usuario_id = req.usuario?.id;

      // Validaciones iniciales
      const erroresValidacion = [];

      if (!planta) erroresValidacion.push("Planta es requerida");
      if (!fecha) erroresValidacion.push("Fecha es requerida");
      if (!tipo_movimiento)
        erroresValidacion.push("Tipo de movimiento es requerido");
      if (!codigo_material)
        erroresValidacion.push("Código de material es requerido");
      if (!nombre_material)
        erroresValidacion.push("Nombre de material es requerido");
      if (!cantidad || cantidad <= 0)
        erroresValidacion.push("Cantidad debe ser mayor a 0");

      // Validaciones específicas por tipo de movimiento
      const tipoMovUpper = tipo_movimiento.toUpperCase();

      if (["DESPACHO", "TRANSFERENCIA", "CONSUMO"].includes(tipoMovUpper)) {
        if (!ubicacion_origen_id) {
          erroresValidacion.push(
            "Ubicación origen es requerida para este tipo de movimiento"
          );
        }
      }

      if (["RECEPCION", "TRANSFERENCIA"].includes(tipoMovUpper)) {
        if (!ubicacion_destino_id) {
          erroresValidacion.push(
            "Ubicación destino es requerida para este tipo de movimiento"
          );
        }
      }

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
        if (material_id) {
          const material = await tx.materiales.findUnique({
            where: { id: parseInt(material_id), activo: true },
          });
          if (!material) {
            throw new Error("Material no encontrado o inactivo");
          }
        }

        // Validar proveedor si se proporciona ID
        if (proveedor_id) {
          const proveedor = await tx.proveedores.findUnique({
            where: { id: parseInt(proveedor_id), activo: true },
          });
          if (!proveedor) {
            throw new Error("Proveedor no encontrado o inactivo");
          }
        }

        // Validar tipo de movimiento si se proporciona ID
        if (tipo_movimiento_id) {
          const tipoMov = await tx.tipo_movimientos_app.findUnique({
            where: { id: parseInt(tipo_movimiento_id), activo: true },
          });
          if (!tipoMov) {
            throw new Error("Tipo de movimiento no encontrado o inactivo");
          }
        }

        // Validar ubicación origen si se proporciona
        let ubicacionOrigen = null;
        if (ubicacion_origen_id) {
          ubicacionOrigen = await tx.ubicacion.findUnique({
            where: { id: parseInt(ubicacion_origen_id), activo: true },
          });
          if (!ubicacionOrigen) {
            throw new Error("Ubicación origen no encontrada o inactiva");
          }
        }

        // Validar ubicación destino si se proporciona
        let ubicacionDestino = null;
        if (ubicacion_destino_id) {
          ubicacionDestino = await tx.ubicacion.findUnique({
            where: { id: parseInt(ubicacion_destino_id), activo: true },
          });
          if (!ubicacionDestino) {
            throw new Error("Ubicación destino no encontrada o inactiva");
          }
        }

        // Validar temporada si se proporciona
        if (temporada_id) {
          const temporada = await tx.temporadas_app.findUnique({
            where: { id: parseInt(temporada_id), activo: true },
          });
          if (!temporada) {
            throw new Error("Temporada no encontrada o inactiva");
          }
        }

        // Verificar stock disponible para movimientos de salida
        if (
          ["DESPACHO", "TRANSFERENCIA", "CONSUMO"].includes(tipoMovUpper) &&
          ubicacion_origen_id
        ) {
          const stockDisponible = await tx.stock_ubicaciones.findFirst({
            where: {
              material_id: material_id ? parseInt(material_id) : null,
              codigo_material,
              ubicacion_id: parseInt(ubicacion_origen_id),
              lote: lote || null,
            },
          });

          if (
            !stockDisponible ||
            stockDisponible.cantidad_actual < parseFloat(cantidad)
          ) {
            throw new Error("Stock insuficiente en la ubicación origen");
          }
        }

        // Generar ID de movimiento único
        const fechaStr = new Date(fecha)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const ultimoMovimiento = await tx.trazabilidad_materiales_r9.findFirst({
          where: {
            id_movimiento: {
              startsWith: `${planta.toUpperCase()}_${tipoMovUpper}_${fechaStr}`,
            },
          },
          orderBy: { id_movimiento: "desc" },
        });

        let secuencial = 1;
        if (ultimoMovimiento) {
          const ultimoSecuencial = parseInt(
            ultimoMovimiento.id_movimiento.slice(-3)
          );
          secuencial = ultimoSecuencial + 1;
        }

        const id_movimiento = `${planta.toUpperCase()}_${tipoMovUpper}_${fechaStr}_${secuencial
          .toString()
          .padStart(3, "0")}`;

        // Obtener mes para el registro
        const fechaObj = new Date(fecha);
        const meses = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];
        const mes = meses[fechaObj.getMonth()];

        // Crear el movimiento en trazabilidad
        const nuevoMovimiento = await tx.trazabilidad_materiales_r9.create({
          data: {
            tipo_movimiento: tipo_movimiento,
            planta: planta.toUpperCase(),
            guia_sii,
            fecha: new Date(fecha),
            mes,
            id_movimiento,
            proveedor: proveedor_id ? undefined : null, // Se llenará por la relación FK
            lote,
            title: codigo_material,
            nombre: nombre_material,
            cod_nombre: `${codigo_material} - ${nombre_material}`,
            clasificacion: null, // Se puede llenar desde el material relacionado
            total_pallet: 0,
            cantidad: parseFloat(cantidad),
            unidad_medida: null, // Se puede llenar desde el material relacionado
            bod_origen: ubicacionOrigen?.bodega_deposito || null,
            bod_destino: ubicacionDestino?.bodega_deposito || null,
            ubicacion_origen: ubicacionOrigen?.title || null,
            ubicacion_destino: ubicacionDestino?.title || null,
            turno,
            temporada: null, // Se puede llenar desde la temporada relacionada
            observacion,
            bodega_stock:
              ubicacionDestino?.bodega_deposito ||
              ubicacionOrigen?.bodega_deposito ||
              null,
            ubicacion_stock:
              ubicacionDestino?.title || ubicacionOrigen?.title || null,
            total_stock: null, // Se calculará después de actualizar stock
            numero_embarque,
            patente_camion,
            material_id: material_id ? parseInt(material_id) : null,
            proveedor_id: proveedor_id ? parseInt(proveedor_id) : null,
            ubicacion_origen_id: ubicacion_origen_id
              ? parseInt(ubicacion_origen_id)
              : null,
            ubicacion_destino_id: ubicacion_destino_id
              ? parseInt(ubicacion_destino_id)
              : null,
            temporada_id: temporada_id ? parseInt(temporada_id) : null,
            tipo_movimiento_id: tipo_movimiento_id
              ? parseInt(tipo_movimiento_id)
              : null,
          },
          include: {
            materiales: true,
            proveedores: true,
            temporadas_app: true,
            tipo_movimientos_app: true,
            ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion: true,
            ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion: true,
          },
        });

        // Actualizar stock según el tipo de movimiento
        let stockResultado = null;

        if (tipoMovUpper === "DESPACHO" || tipoMovUpper === "CONSUMO") {
          // Restar de ubicación origen
          if (ubicacion_origen_id) {
            stockResultado = await tx.stock_ubicaciones.update({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: material_id ? parseInt(material_id) : null,
                  ubicacion_id: parseInt(ubicacion_origen_id),
                  lote: lote || null,
                },
              },
              data: {
                cantidad_actual: {
                  decrement: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }
        } else if (tipoMovUpper === "RECEPCION") {
          // Sumar a ubicación destino
          if (ubicacion_destino_id) {
            stockResultado = await tx.stock_ubicaciones.upsert({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: material_id ? parseInt(material_id) : null,
                  ubicacion_id: parseInt(ubicacion_destino_id),
                  lote: lote || null,
                },
              },
              update: {
                cantidad_actual: {
                  increment: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
              },
              create: {
                material_id: material_id ? parseInt(material_id) : null,
                codigo_material,
                nombre_material,
                ubicacion_id: parseInt(ubicacion_destino_id),
                planta: planta.toUpperCase(),
                bodega: ubicacionDestino?.bodega_deposito || "BODEGA_DEFAULT",
                ubicacion_nombre:
                  ubicacionDestino?.title || "UBICACION_DEFAULT",
                lote,
                cantidad_actual: parseFloat(cantidad),
                cantidad_reservada: 0,
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }
        } else if (tipoMovUpper === "TRANSFERENCIA") {
          // Restar de origen y sumar a destino (operación atómica)
          if (ubicacion_origen_id) {
            await tx.stock_ubicaciones.update({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: material_id ? parseInt(material_id) : null,
                  ubicacion_id: parseInt(ubicacion_origen_id),
                  lote: lote || null,
                },
              },
              data: {
                cantidad_actual: {
                  decrement: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }

          if (ubicacion_destino_id) {
            stockResultado = await tx.stock_ubicaciones.upsert({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: material_id ? parseInt(material_id) : null,
                  ubicacion_id: parseInt(ubicacion_destino_id),
                  lote: lote || null,
                },
              },
              update: {
                cantidad_actual: {
                  increment: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
              },
              create: {
                material_id: material_id ? parseInt(material_id) : null,
                codigo_material,
                nombre_material,
                ubicacion_id: parseInt(ubicacion_destino_id),
                planta: planta.toUpperCase(),
                bodega: ubicacionDestino?.bodega_deposito || "BODEGA_DEFAULT",
                ubicacion_nombre:
                  ubicacionDestino?.title || "UBICACION_DEFAULT",
                lote,
                cantidad_actual: parseFloat(cantidad),
                cantidad_reservada: 0,
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }
        } else if (tipoMovUpper === "AJUSTE") {
          // Ajustar stock según diferencia (puede ser positivo o negativo)
          const cantidadAjuste = parseFloat(cantidad);
          const ubicacionAjuste = ubicacion_destino_id || ubicacion_origen_id;

          if (ubicacionAjuste) {
            stockResultado = await tx.stock_ubicaciones.upsert({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: material_id ? parseInt(material_id) : null,
                  ubicacion_id: parseInt(ubicacionAjuste),
                  lote: lote || null,
                },
              },
              update: {
                cantidad_actual:
                  cantidadAjuste >= 0
                    ? {
                        increment: Math.abs(cantidadAjuste),
                      }
                    : {
                        decrement: Math.abs(cantidadAjuste),
                      },
                fecha_ultimo_movimiento: new Date(),
              },
              create: {
                material_id: material_id ? parseInt(material_id) : null,
                codigo_material,
                nombre_material,
                ubicacion_id: parseInt(ubicacionAjuste),
                planta: planta.toUpperCase(),
                bodega:
                  (ubicacionDestino || ubicacionOrigen)?.bodega_deposito ||
                  "BODEGA_DEFAULT",
                ubicacion_nombre:
                  (ubicacionDestino || ubicacionOrigen)?.title ||
                  "UBICACION_DEFAULT",
                lote,
                cantidad_actual: Math.max(0, cantidadAjuste), // No permitir stock negativo
                cantidad_reservada: 0,
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }
        }

        // Actualizar el total_stock en el movimiento de trazabilidad
        if (stockResultado) {
          await tx.trazabilidad_materiales_r9.update({
            where: { id: nuevoMovimiento.id },
            data: {
              total_stock: stockResultado.cantidad_actual,
            },
          });
        }

        return nuevoMovimiento;
      });

      // Formatear respuesta
      const movimientoFormateado = {
        id: resultado.id,
        id_movimiento: resultado.id_movimiento,
        tipo_movimiento: resultado.tipo_movimiento,
        planta: resultado.planta,
        fecha: resultado.fecha,
        mes: resultado.mes,
        material: {
          id: resultado.material_id,
          codigo: resultado.title,
          nombre: resultado.nombre,
          cod_nombre: resultado.cod_nombre,
          completo: resultado.materiales,
        },
        cantidad: parseFloat(resultado.cantidad),
        lote: resultado.lote,
        ubicacion_origen: resultado.ubicacion_origen
          ? {
              id: resultado.ubicacion_origen_id,
              nombre: resultado.ubicacion_origen,
              bodega: resultado.bod_origen,
              completo:
                resultado.ubicacion_trazabilidad_materiales_r9_ubicacion_origen_idToubicacion,
            }
          : null,
        ubicacion_destino: resultado.ubicacion_destino
          ? {
              id: resultado.ubicacion_destino_id,
              nombre: resultado.ubicacion_destino,
              bodega: resultado.bod_destino,
              completo:
                resultado.ubicacion_trazabilidad_materiales_r9_ubicacion_destino_idToubicacion,
            }
          : null,
        proveedor: resultado.proveedor_id
          ? {
              id: resultado.proveedor_id,
              nombre: resultado.proveedor,
              completo: resultado.proveedores,
            }
          : null,
        temporada: resultado.temporada_id
          ? {
              id: resultado.temporada_id,
              nombre: resultado.temporada,
              completo: resultado.temporadas_app,
            }
          : null,
        tipo_movimiento_config: resultado.tipo_movimiento_id
          ? {
              id: resultado.tipo_movimiento_id,
              completo: resultado.tipo_movimientos_app,
            }
          : null,
        turno: resultado.turno,
        guia_sii: resultado.guia_sii,
        numero_embarque: resultado.numero_embarque,
        patente_camion: resultado.patente_camion,
        observacion: resultado.observacion,
        total_stock: resultado.total_stock
          ? parseFloat(resultado.total_stock)
          : null,
        fecha_creacion: resultado.fecha_creacion,
      };

      return ManejadorRespuestas.exito(
        res,
        movimientoFormateado,
        "Movimiento de trazabilidad creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear movimiento de trazabilidad:", error);
      return ManejadorRespuestas.error(
        res,
        error.message || "Error al crear movimiento de trazabilidad",
        "ERROR_CREAR_MOVIMIENTO_TRAZABILIDAD"
      );
    }
  }
}

module.exports = ControladorTrazabilidad;
