const { PrismaClient } = require("@prisma/client");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

const prisma = new PrismaClient();

/**
 * Controlador de Recepciones de Lotes
 * Maneja todas las operaciones relacionadas con recepciones de lotes
 */
class ControladorRecepcionesLotes {
  /**
   * Obtiene todas las recepciones con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerRecepciones(req, res) {
    try {
      const {
        planta,
        proveedor_id,
        estado,
        codigo_material,
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

      if (proveedor_id) {
        filtros.proveedor_id = parseInt(proveedor_id);
      }

      if (estado) {
        filtros.estado = {
          equals: estado,
          mode: "insensitive",
        };
      }

      if (codigo_material) {
        filtros.codigo_material = {
          contains: codigo_material,
          mode: "insensitive",
        };
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_recepcion = {};
        if (fecha_desde) {
          filtros.fecha_recepcion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_recepcion.lte = new Date(fecha_hasta);
        }
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener recepciones con relaciones
      const [recepciones, total] = await Promise.all([
        prisma.recepciones_lotes.findMany({
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
                activo: true,
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
            usuarios: {
              select: {
                id: true,
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
          orderBy: [{ fecha_recepcion: "desc" }, { numero_recepcion: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.recepciones_lotes.count({ where: filtros }),
      ]);

      // Formatear datos
      const recepcionesFormateadas = recepciones.map((recepcion) => ({
        id: recepcion.id,
        numero_recepcion: recepcion.numero_recepcion,
        planta: recepcion.planta,
        fecha_recepcion: recepcion.fecha_recepcion,
        proveedor: {
          id: recepcion.proveedor_id,
          nombre: recepcion.nombre_proveedor,
          completo: recepcion.proveedores,
        },
        guia_sii: recepcion.guia_sii,
        material: {
          id: recepcion.material_id,
          codigo: recepcion.codigo_material,
          nombre: recepcion.nombre_material,
          cod_nombre: recepcion.cod_nombre,
          unidad_medida: recepcion.unidad_medida,
          clasificacion: recepcion.clasificacion,
          completo: recepcion.materiales,
        },
        lote: recepcion.lote,
        cantidad: parseFloat(recepcion.cantidad),
        pallets: recepcion.pallets || 0,
        codigo_qr: recepcion.codigo_qr,
        ubicacion_destino: {
          id: recepcion.ubicacion_destino_id,
          bodega: recepcion.bodega_destino,
          ubicacion: recepcion.ubicacion_destino,
          completo: recepcion.ubicacion,
        },
        estado: recepcion.estado,
        observaciones: recepcion.observaciones,
        usuario: recepcion.usuarios,
        fecha_creacion: recepcion.fecha_creacion,
        fecha_procesamiento: recepcion.fecha_procesamiento,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          recepciones: recepcionesFormateadas,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Recepciones de lotes obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener recepciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener recepciones de lotes",
        "ERROR_OBTENER_RECEPCIONES"
      );
    }
  }

  /**
   * Obtiene una recepción por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerRecepcionPorId(req, res) {
    try {
      const { id } = req.params;

      const recepcion = await prisma.recepciones_lotes.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          proveedores: true,
          ubicacion: true,
          usuarios: {
            select: {
              id: true,
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
      });

      if (!recepcion) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Recepción con ID ${id} no encontrada`
        );
      }

      const recepcionFormateada = {
        id: recepcion.id,
        numero_recepcion: recepcion.numero_recepcion,
        planta: recepcion.planta,
        fecha_recepcion: recepcion.fecha_recepcion,
        proveedor: {
          id: recepcion.proveedor_id,
          nombre: recepcion.nombre_proveedor,
          completo: recepcion.proveedores,
        },
        guia_sii: recepcion.guia_sii,
        material: {
          id: recepcion.material_id,
          codigo: recepcion.codigo_material,
          nombre: recepcion.nombre_material,
          cod_nombre: recepcion.cod_nombre,
          unidad_medida: recepcion.unidad_medida,
          clasificacion: recepcion.clasificacion,
          completo: recepcion.materiales,
        },
        lote: recepcion.lote,
        cantidad: parseFloat(recepcion.cantidad),
        pallets: recepcion.pallets || 0,
        codigo_qr: recepcion.codigo_qr,
        ubicacion_destino: {
          id: recepcion.ubicacion_destino_id,
          bodega: recepcion.bodega_destino,
          ubicacion: recepcion.ubicacion_destino,
          completo: recepcion.ubicacion,
        },
        estado: recepcion.estado,
        observaciones: recepcion.observaciones,
        usuario: recepcion.usuarios,
        fecha_creacion: recepcion.fecha_creacion,
        fecha_procesamiento: recepcion.fecha_procesamiento,
      };

      return ManejadorRespuestas.exito(
        res,
        recepcionFormateada,
        "Recepción obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener recepción:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener recepción",
        "ERROR_OBTENER_RECEPCION"
      );
    }
  }

  /**
   * Obtiene recepciones por proveedor
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerRecepcionesPorProveedor(req, res) {
    try {
      const { proveedor_id } = req.params;
      const { pagina = 1, limite = 50, estado } = req.query;

      const filtros = {
        proveedor_id: parseInt(proveedor_id),
      };

      if (estado) {
        filtros.estado = {
          equals: estado,
          mode: "insensitive",
        };
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [recepciones, total] = await Promise.all([
        prisma.recepciones_lotes.findMany({
          where: filtros,
          include: {
            materiales: {
              select: {
                codigo_ranco: true,
                nombre_material: true,
                unidad_medida: true,
              },
            },
            proveedores: {
              select: {
                title: true,
              },
            },
          },
          orderBy: [{ fecha_recepcion: "desc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.recepciones_lotes.count({ where: filtros }),
      ]);

      const recepcionesFormateadas = recepciones.map((recepcion) => ({
        id: recepcion.id,
        numero_recepcion: recepcion.numero_recepcion,
        planta: recepcion.planta,
        fecha_recepcion: recepcion.fecha_recepcion,
        proveedor: recepcion.nombre_proveedor,
        guia_sii: recepcion.guia_sii,
        codigo_material: recepcion.codigo_material,
        nombre_material: recepcion.nombre_material,
        lote: recepcion.lote,
        cantidad: parseFloat(recepcion.cantidad),
        pallets: recepcion.pallets || 0,
        estado: recepcion.estado,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          recepciones: recepcionesFormateadas,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Recepciones por proveedor obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener recepciones por proveedor:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener recepciones por proveedor",
        "ERROR_OBTENER_RECEPCIONES_PROVEEDOR"
      );
    }
  }

  /**
   * Busca recepciones por criterios múltiples
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarRecepciones(req, res) {
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

      const recepciones = await prisma.recepciones_lotes.findMany({
        where: {
          OR: [
            {
              numero_recepcion: {
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
              nombre_proveedor: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
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
              lote: {
                contains: terminoBusqueda,
                mode: "insensitive",
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
        orderBy: [{ fecha_recepcion: "desc" }],
        take: parseInt(limite),
      });

      const recepcionesFormateadas = recepciones.map((recepcion) => ({
        id: recepcion.id,
        numero_recepcion: recepcion.numero_recepcion,
        planta: recepcion.planta,
        fecha_recepcion: recepcion.fecha_recepcion,
        proveedor: recepcion.nombre_proveedor,
        guia_sii: recepcion.guia_sii,
        codigo_material: recepcion.codigo_material,
        nombre_material: recepcion.nombre_material,
        lote: recepcion.lote,
        cantidad: parseFloat(recepcion.cantidad),
        estado: recepcion.estado,
      }));

      return ManejadorRespuestas.exito(
        res,
        recepcionesFormateadas,
        `Se encontraron ${recepcionesFormateadas.length} recepciones`
      );
    } catch (error) {
      console.error("Error al buscar recepciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar recepciones",
        "ERROR_BUSCAR_RECEPCIONES"
      );
    }
  }

  /**
   * Obtiene resumen de recepciones por estado
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenRecepciones(req, res) {
    try {
      const { planta, fecha_desde, fecha_hasta } = req.query;

      const filtros = {};

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_recepcion = {};
        if (fecha_desde) {
          filtros.fecha_recepcion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_recepcion.lte = new Date(fecha_hasta);
        }
      }

      // Obtener resumen agrupado por estado
      const resumenRecepciones = await prisma.recepciones_lotes.groupBy({
        by: ["estado", "planta"],
        where: filtros,
        _count: {
          id: true,
        },
        _sum: {
          cantidad: true,
          pallets: true,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        resumenRecepciones,
        "Resumen de recepciones obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener resumen de recepciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener resumen de recepciones",
        "ERROR_OBTENER_RESUMEN_RECEPCIONES"
      );
    }
  }

  /**
   * Crea una nueva recepción de lote
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearRecepcionLote(req, res) {
    try {
      const {
        planta,
        fecha_recepcion,
        proveedor_id,
        nombre_proveedor,
        guia_sii,
        material_id,
        codigo_material,
        nombre_material,
        cod_nombre,
        unidad_medida,
        clasificacion,
        lote,
        cantidad,
        pallets = 0,
        codigo_qr,
        ubicacion_destino_id,
        bodega_destino,
        ubicacion_destino,
        observaciones,
      } = req.body;

      const usuario_id = req.usuario?.id;

      // Validaciones iniciales
      const erroresValidacion = [];

      if (!planta) erroresValidacion.push("Planta es requerida");
      if (!fecha_recepcion)
        erroresValidacion.push("Fecha de recepción es requerida");
      if (!codigo_material)
        erroresValidacion.push("Código de material es requerido");
      if (!nombre_material)
        erroresValidacion.push("Nombre de material es requerido");
      if (!cantidad || cantidad <= 0)
        erroresValidacion.push("Cantidad debe ser mayor a 0");
      if (!ubicacion_destino_id)
        erroresValidacion.push("Ubicación destino es requerida");

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

        // Validar ubicación destino
        const ubicacion = await tx.ubicacion.findUnique({
          where: { id: parseInt(ubicacion_destino_id), activo: true },
        });
        if (!ubicacion) {
          throw new Error("Ubicación destino no encontrada o inactiva");
        }

        // Generar número de recepción único
        const fechaHoy = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const ultimaRecepcion = await tx.recepciones_lotes.findFirst({
          where: {
            numero_recepcion: {
              startsWith: `REC_${planta.toUpperCase()}_${fechaHoy}`,
            },
          },
          orderBy: { numero_recepcion: "desc" },
        });

        let secuencial = 1;
        if (ultimaRecepcion) {
          const ultimoSecuencial = parseInt(
            ultimaRecepcion.numero_recepcion.slice(-3)
          );
          secuencial = ultimoSecuencial + 1;
        }

        const numero_recepcion = `REC_${planta.toUpperCase()}_${fechaHoy}_${secuencial
          .toString()
          .padStart(3, "0")}`;

        // Crear recepción de lote
        const nuevaRecepcion = await tx.recepciones_lotes.create({
          data: {
            numero_recepcion,
            planta: planta.toUpperCase(),
            fecha_recepcion: new Date(fecha_recepcion),
            proveedor_id: proveedor_id ? parseInt(proveedor_id) : null,
            nombre_proveedor,
            guia_sii,
            material_id: material_id ? parseInt(material_id) : null,
            codigo_material,
            nombre_material,
            cod_nombre,
            unidad_medida,
            clasificacion,
            lote,
            cantidad: parseFloat(cantidad),
            pallets: parseInt(pallets) || 0,
            codigo_qr,
            ubicacion_destino_id: parseInt(ubicacion_destino_id),
            bodega_destino: bodega_destino || ubicacion.bodega_deposito,
            ubicacion_destino: ubicacion_destino || ubicacion.title,
            estado: "procesada",
            observaciones,
            usuario_id,
            fecha_procesamiento: new Date(),
          },
          include: {
            materiales: true,
            proveedores: true,
            ubicacion: true,
            usuarios: {
              select: {
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
        });

        // Actualizar stock en ubicación destino
        await tx.stock_ubicaciones.upsert({
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
            fecha_actualizacion: new Date(),
          },
          create: {
            material_id: material_id ? parseInt(material_id) : null,
            codigo_material,
            nombre_material,
            ubicacion_id: parseInt(ubicacion_destino_id),
            planta: planta.toUpperCase(),
            bodega: bodega_destino || ubicacion.bodega_deposito,
            ubicacion_nombre: ubicacion_destino || ubicacion.title,
            lote,
            cantidad_actual: parseFloat(cantidad),
            cantidad_reservada: 0,
            fecha_ultimo_movimiento: new Date(),
          },
        });

        // Crear movimiento en trazabilidad
        const id_movimiento = `REC_${numero_recepcion}`;
        await tx.trazabilidad_materiales_r9.create({
          data: {
            tipo_movimiento: "Recepción Lotes",
            planta: planta.toUpperCase(),
            guia_sii,
            fecha: new Date(fecha_recepcion),
            mes: new Date(fecha_recepcion).toLocaleString("es-ES", {
              month: "long",
            }),
            id_movimiento,
            proveedor: nombre_proveedor,
            lote,
            title: codigo_material,
            nombre: nombre_material,
            cod_nombre,
            clasificacion,
            total_pallet: parseInt(pallets) || 0,
            cantidad: parseFloat(cantidad),
            unidad_medida,
            bod_destino: bodega_destino || ubicacion.bodega_deposito,
            ubicacion_destino: ubicacion_destino || ubicacion.title,
            bodega_stock: bodega_destino || ubicacion.bodega_deposito,
            ubicacion_stock: ubicacion_destino || ubicacion.title,
            total_stock: parseFloat(cantidad),
            material_id: material_id ? parseInt(material_id) : null,
            proveedor_id: proveedor_id ? parseInt(proveedor_id) : null,
            ubicacion_destino_id: parseInt(ubicacion_destino_id),
          },
        });

        return nuevaRecepcion;
      });

      // Formatear respuesta
      const recepcionFormateada = {
        id: resultado.id,
        numero_recepcion: resultado.numero_recepcion,
        planta: resultado.planta,
        fecha_recepcion: resultado.fecha_recepcion,
        proveedor: {
          id: resultado.proveedor_id,
          nombre: resultado.nombre_proveedor,
          completo: resultado.proveedores,
        },
        guia_sii: resultado.guia_sii,
        material: {
          id: resultado.material_id,
          codigo: resultado.codigo_material,
          nombre: resultado.nombre_material,
          completo: resultado.materiales,
        },
        lote: resultado.lote,
        cantidad: parseFloat(resultado.cantidad),
        pallets: resultado.pallets,
        codigo_qr: resultado.codigo_qr,
        ubicacion_destino: {
          id: resultado.ubicacion_destino_id,
          bodega: resultado.bodega_destino,
          nombre: resultado.ubicacion_destino,
          completo: resultado.ubicacion,
        },
        estado: resultado.estado,
        observaciones: resultado.observaciones,
        usuario: resultado.usuarios,
        fecha_creacion: resultado.fecha_creacion,
        fecha_procesamiento: resultado.fecha_procesamiento,
      };

      return ManejadorRespuestas.exito(
        res,
        recepcionFormateada,
        "Recepción de lote creada exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear recepción de lote:", error);

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
        "Error al crear recepción de lote",
        "ERROR_CREAR_RECEPCION_LOTE"
      );
    }
  }
}

module.exports = ControladorRecepcionesLotes;
