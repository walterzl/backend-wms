const { PrismaClient } = require("@prisma/client");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

const prisma = new PrismaClient();

/**
 * Controlador de Operaciones de Frío y Despacho
 * Maneja todas las operaciones relacionadas con operaciones de frío y despacho
 */
class ControladorOperacionesFrioDespacho {
  /**
   * Obtiene todas las operaciones con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerOperaciones(req, res) {
    try {
      const {
        planta,
        tipo_operacion,
        estado,
        numero_embarque,
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

      if (tipo_operacion) {
        filtros.tipo_operacion = {
          equals: tipo_operacion,
          mode: "insensitive",
        };
      }

      if (estado) {
        filtros.estado = {
          equals: estado,
          mode: "insensitive",
        };
      }

      if (numero_embarque) {
        filtros.numero_embarque = {
          contains: numero_embarque,
          mode: "insensitive",
        };
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_operacion = {};
        if (fecha_desde) {
          filtros.fecha_operacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_operacion.lte = new Date(fecha_hasta);
        }
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener operaciones con relaciones
      const [operaciones, total] = await Promise.all([
        prisma.operaciones_frio_despacho.findMany({
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
            ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion:
              {
                select: {
                  id: true,
                  title: true,
                  bodega_deposito: true,
                  planta: true,
                },
              },
            ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion:
              {
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
          orderBy: [{ fecha_operacion: "desc" }, { numero_operacion: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.operaciones_frio_despacho.count({ where: filtros }),
      ]);

      // Formatear datos
      const operacionesFormateadas = operaciones.map((operacion) => ({
        id: operacion.id,
        numero_operacion: operacion.numero_operacion,
        planta: operacion.planta,
        fecha_operacion: operacion.fecha_operacion,
        tipo_operacion: operacion.tipo_operacion,
        turno: operacion.turno,
        numero_embarque: operacion.numero_embarque,
        patente_camion: operacion.patente_camion,
        material: {
          id: operacion.material_id,
          codigo: operacion.codigo_material,
          nombre: operacion.nombre_material,
          cod_nombre: operacion.cod_nombre,
          unidad_medida: operacion.unidad_medida,
          clasificacion: operacion.clasificacion,
          completo: operacion.materiales,
        },
        lote: operacion.lote,
        cantidad: parseFloat(operacion.cantidad),
        ubicacion_origen: {
          id: operacion.ubicacion_origen_id,
          bodega: operacion.bodega_origen,
          ubicacion: operacion.ubicacion_origen,
          completo:
            operacion.ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion,
        },
        ubicacion_destino: {
          id: operacion.ubicacion_destino_id,
          bodega: operacion.bodega_destino,
          ubicacion: operacion.ubicacion_destino,
          completo:
            operacion.ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion,
        },
        estado: operacion.estado,
        observaciones: operacion.observaciones,
        usuario: operacion.usuarios,
        fecha_creacion: operacion.fecha_creacion,
        fecha_procesamiento: operacion.fecha_procesamiento,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          operaciones: operacionesFormateadas,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Operaciones de frío y despacho obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener operaciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener operaciones de frío y despacho",
        "ERROR_OBTENER_OPERACIONES"
      );
    }
  }

  /**
   * Obtiene una operación por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerOperacionPorId(req, res) {
    try {
      const { id } = req.params;

      const operacion = await prisma.operaciones_frio_despacho.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion: true,
          ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion: true,
          usuarios: {
            select: {
              id: true,
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
      });

      if (!operacion) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Operación con ID ${id} no encontrada`
        );
      }

      const operacionFormateada = {
        id: operacion.id,
        numero_operacion: operacion.numero_operacion,
        planta: operacion.planta,
        fecha_operacion: operacion.fecha_operacion,
        tipo_operacion: operacion.tipo_operacion,
        turno: operacion.turno,
        numero_embarque: operacion.numero_embarque,
        patente_camion: operacion.patente_camion,
        material: {
          id: operacion.material_id,
          codigo: operacion.codigo_material,
          nombre: operacion.nombre_material,
          cod_nombre: operacion.cod_nombre,
          unidad_medida: operacion.unidad_medida,
          clasificacion: operacion.clasificacion,
          completo: operacion.materiales,
        },
        lote: operacion.lote,
        cantidad: parseFloat(operacion.cantidad),
        ubicacion_origen: {
          id: operacion.ubicacion_origen_id,
          bodega: operacion.bodega_origen,
          ubicacion: operacion.ubicacion_origen,
          completo:
            operacion.ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion,
        },
        ubicacion_destino: {
          id: operacion.ubicacion_destino_id,
          bodega: operacion.bodega_destino,
          ubicacion: operacion.ubicacion_destino,
          completo:
            operacion.ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion,
        },
        estado: operacion.estado,
        observaciones: operacion.observaciones,
        usuario: operacion.usuarios,
        fecha_creacion: operacion.fecha_creacion,
        fecha_procesamiento: operacion.fecha_procesamiento,
      };

      return ManejadorRespuestas.exito(
        res,
        operacionFormateada,
        "Operación obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener operación:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener operación",
        "ERROR_OBTENER_OPERACION"
      );
    }
  }

  /**
   * Obtiene resumen de operaciones por tipo
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenOperaciones(req, res) {
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
        filtros.fecha_operacion = {};
        if (fecha_desde) {
          filtros.fecha_operacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_operacion.lte = new Date(fecha_hasta);
        }
      }

      // Obtener resumen agrupado por tipo de operación
      const resumenOperaciones = await prisma.operaciones_frio_despacho.groupBy(
        {
          by: ["tipo_operacion", "estado", "planta"],
          where: filtros,
          _count: {
            id: true,
          },
          _sum: {
            cantidad: true,
          },
        }
      );

      return ManejadorRespuestas.exito(
        res,
        resumenOperaciones,
        "Resumen de operaciones obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener resumen de operaciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener resumen de operaciones",
        "ERROR_OBTENER_RESUMEN_OPERACIONES"
      );
    }
  }

  /**
   * Busca operaciones por criterios múltiples
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarOperaciones(req, res) {
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

      const operaciones = await prisma.operaciones_frio_despacho.findMany({
        where: {
          OR: [
            {
              numero_operacion: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              numero_embarque: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              patente_camion: {
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
          ],
        },
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
            },
          },
        },
        orderBy: [{ fecha_operacion: "desc" }],
        take: parseInt(limite),
      });

      const operacionesFormateadas = operaciones.map((operacion) => ({
        id: operacion.id,
        numero_operacion: operacion.numero_operacion,
        planta: operacion.planta,
        fecha_operacion: operacion.fecha_operacion,
        tipo_operacion: operacion.tipo_operacion,
        numero_embarque: operacion.numero_embarque,
        patente_camion: operacion.patente_camion,
        codigo_material: operacion.codigo_material,
        nombre_material: operacion.nombre_material,
        cantidad: parseFloat(operacion.cantidad),
        estado: operacion.estado,
      }));

      return ManejadorRespuestas.exito(
        res,
        operacionesFormateadas,
        `Se encontraron ${operacionesFormateadas.length} operaciones`
      );
    } catch (error) {
      console.error("Error al buscar operaciones:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar operaciones",
        "ERROR_BUSCAR_OPERACIONES"
      );
    }
  }

  /**
   * Obtiene operaciones por embarque
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerOperacionesPorEmbarque(req, res) {
    try {
      const { numero_embarque } = req.params;

      if (!numero_embarque) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Número de embarque requerido"],
          "Datos de entrada inválidos"
        );
      }

      const operaciones = await prisma.operaciones_frio_despacho.findMany({
        where: {
          numero_embarque: {
            equals: numero_embarque,
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
          usuarios: {
            select: {
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
        orderBy: [{ fecha_operacion: "desc" }],
      });

      const operacionesFormateadas = operaciones.map((operacion) => ({
        id: operacion.id,
        numero_operacion: operacion.numero_operacion,
        planta: operacion.planta,
        fecha_operacion: operacion.fecha_operacion,
        tipo_operacion: operacion.tipo_operacion,
        codigo_material: operacion.codigo_material,
        nombre_material: operacion.nombre_material,
        cantidad: parseFloat(operacion.cantidad),
        estado: operacion.estado,
        usuario: operacion.usuarios,
      }));

      return ManejadorRespuestas.exito(
        res,
        operacionesFormateadas,
        `Operaciones del embarque ${numero_embarque} obtenidas exitosamente`
      );
    } catch (error) {
      console.error("Error al obtener operaciones por embarque:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener operaciones por embarque",
        "ERROR_OBTENER_OPERACIONES_EMBARQUE"
      );
    }
  }

  /**
   * Crea una nueva operación de frío y despacho
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearOperacionFrioDespacho(req, res) {
    try {
      const {
        planta,
        fecha_operacion,
        tipo_operacion,
        turno,
        numero_embarque,
        patente_camion,
        material_id,
        codigo_material,
        nombre_material,
        cod_nombre,
        unidad_medida,
        clasificacion,
        lote,
        cantidad,
        ubicacion_origen_id,
        bodega_origen,
        ubicacion_origen,
        ubicacion_destino_id,
        bodega_destino,
        ubicacion_destino,
        observaciones,
      } = req.body;

      const usuario_id = req.usuario?.id;

      // Validaciones iniciales
      const erroresValidacion = [];

      if (!planta) erroresValidacion.push("Planta es requerida");
      if (!fecha_operacion)
        erroresValidacion.push("Fecha de operación es requerida");
      if (!tipo_operacion)
        erroresValidacion.push("Tipo de operación es requerido");
      if (!codigo_material)
        erroresValidacion.push("Código de material es requerido");
      if (!nombre_material)
        erroresValidacion.push("Nombre de material es requerido");
      if (!cantidad || cantidad <= 0)
        erroresValidacion.push("Cantidad debe ser mayor a 0");
      if (!ubicacion_origen_id)
        erroresValidacion.push("Ubicación origen es requerida");

      // Validaciones específicas por tipo de operación
      if (tipo_operacion.toLowerCase() === "despacho") {
        if (!numero_embarque)
          erroresValidacion.push(
            "Número de embarque es requerido para despachos"
          );
        if (!ubicacion_destino_id)
          erroresValidacion.push(
            "Ubicación destino es requerida para despachos"
          );
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

        // Validar ubicación origen
        const ubicacionOrigen = await tx.ubicacion.findUnique({
          where: { id: parseInt(ubicacion_origen_id), activo: true },
        });
        if (!ubicacionOrigen) {
          throw new Error("Ubicación origen no encontrada o inactiva");
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

        // Verificar stock disponible
        if (material_id && lote) {
          const stockActual = await tx.stock_ubicaciones.findUnique({
            where: {
              material_id_ubicacion_id_lote: {
                material_id: parseInt(material_id),
                ubicacion_id: parseInt(ubicacion_origen_id),
                lote: lote,
              },
            },
          });

          if (
            !stockActual ||
            parseFloat(stockActual.cantidad_actual) < parseFloat(cantidad)
          ) {
            throw new Error("Stock insuficiente en la ubicación origen");
          }
        }

        // Generar número de operación único
        const fechaHoy = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const ultimaOperacion = await tx.operaciones_frio_despacho.findFirst({
          where: {
            numero_operacion: {
              startsWith: `FRIO_${planta.toUpperCase()}_${fechaHoy}`,
            },
          },
          orderBy: { numero_operacion: "desc" },
        });

        let secuencial = 1;
        if (ultimaOperacion) {
          const ultimoSecuencial = parseInt(
            ultimaOperacion.numero_operacion.slice(-3)
          );
          secuencial = ultimoSecuencial + 1;
        }

        const numero_operacion = `FRIO_${planta.toUpperCase()}_${fechaHoy}_${secuencial
          .toString()
          .padStart(3, "0")}`;

        // Crear operación
        const nuevaOperacion = await tx.operaciones_frio_despacho.create({
          data: {
            numero_operacion,
            planta: planta.toUpperCase(),
            fecha_operacion: new Date(fecha_operacion),
            tipo_operacion: tipo_operacion.toLowerCase(),
            turno,
            numero_embarque,
            patente_camion,
            material_id: material_id ? parseInt(material_id) : null,
            codigo_material,
            nombre_material,
            cod_nombre,
            unidad_medida,
            clasificacion,
            lote,
            cantidad: parseFloat(cantidad),
            ubicacion_origen_id: parseInt(ubicacion_origen_id),
            bodega_origen: bodega_origen || ubicacionOrigen.bodega_deposito,
            ubicacion_origen: ubicacion_origen || ubicacionOrigen.title,
            ubicacion_destino_id: ubicacion_destino_id
              ? parseInt(ubicacion_destino_id)
              : null,
            bodega_destino: bodega_destino || ubicacionDestino?.bodega_deposito,
            ubicacion_destino: ubicacion_destino || ubicacionDestino?.title,
            estado: "procesada",
            observaciones,
            usuario_id,
            fecha_procesamiento: new Date(),
          },
          include: {
            materiales: true,
            ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion: true,
            ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion: true,
            usuarios: {
              select: {
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
        });

        // Actualizar stock según tipo de operación
        if (material_id && lote) {
          if (tipo_operacion.toLowerCase() === "consumo") {
            // Restar stock de origen
            await tx.stock_ubicaciones.update({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: parseInt(material_id),
                  ubicacion_id: parseInt(ubicacion_origen_id),
                  lote: lote,
                },
              },
              data: {
                cantidad_actual: {
                  decrement: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
                fecha_actualizacion: new Date(),
              },
            });
          } else if (
            tipo_operacion.toLowerCase() === "despacho" &&
            ubicacion_destino_id
          ) {
            // Transferir stock de origen a destino
            await tx.stock_ubicaciones.update({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: parseInt(material_id),
                  ubicacion_id: parseInt(ubicacion_origen_id),
                  lote: lote,
                },
              },
              data: {
                cantidad_actual: {
                  decrement: parseFloat(cantidad),
                },
                fecha_ultimo_movimiento: new Date(),
                fecha_actualizacion: new Date(),
              },
            });

            // Sumar a ubicación destino
            await tx.stock_ubicaciones.upsert({
              where: {
                material_id_ubicacion_id_lote: {
                  material_id: parseInt(material_id),
                  ubicacion_id: parseInt(ubicacion_destino_id),
                  lote: lote,
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
                material_id: parseInt(material_id),
                codigo_material,
                nombre_material,
                ubicacion_id: parseInt(ubicacion_destino_id),
                planta: planta.toUpperCase(),
                bodega: bodega_destino || ubicacionDestino.bodega_deposito,
                ubicacion_nombre: ubicacion_destino || ubicacionDestino.title,
                lote,
                cantidad_actual: parseFloat(cantidad),
                cantidad_reservada: 0,
                fecha_ultimo_movimiento: new Date(),
              },
            });
          }
        }

        // Crear movimiento en trazabilidad
        const id_movimiento = `FRIO_${numero_operacion}`;
        await tx.trazabilidad_materiales_r9.create({
          data: {
            tipo_movimiento: `${tipo_operacion} Frío`,
            planta: planta.toUpperCase(),
            fecha: new Date(fecha_operacion),
            mes: new Date(fecha_operacion).toLocaleString("es-ES", {
              month: "long",
            }),
            id_movimiento,
            lote,
            title: codigo_material,
            nombre: nombre_material,
            cod_nombre,
            clasificacion,
            cantidad: parseFloat(cantidad),
            unidad_medida,
            bod_origen: bodega_origen || ubicacionOrigen.bodega_deposito,
            ubicacion_origen: ubicacion_origen || ubicacionOrigen.title,
            bod_destino: bodega_destino || ubicacionDestino?.bodega_deposito,
            ubicacion_destino: ubicacion_destino || ubicacionDestino?.title,
            turno,
            numero_embarque,
            patente_camion,
            bodega_stock: bodega_origen || ubicacionOrigen.bodega_deposito,
            ubicacion_stock: ubicacion_origen || ubicacionOrigen.title,
            material_id: material_id ? parseInt(material_id) : null,
            ubicacion_origen_id: parseInt(ubicacion_origen_id),
            ubicacion_destino_id: ubicacion_destino_id
              ? parseInt(ubicacion_destino_id)
              : null,
          },
        });

        return nuevaOperacion;
      });

      // Formatear respuesta
      const operacionFormateada = {
        id: resultado.id,
        numero_operacion: resultado.numero_operacion,
        planta: resultado.planta,
        fecha_operacion: resultado.fecha_operacion,
        tipo_operacion: resultado.tipo_operacion,
        turno: resultado.turno,
        numero_embarque: resultado.numero_embarque,
        patente_camion: resultado.patente_camion,
        material: {
          id: resultado.material_id,
          codigo: resultado.codigo_material,
          nombre: resultado.nombre_material,
          completo: resultado.materiales,
        },
        lote: resultado.lote,
        cantidad: parseFloat(resultado.cantidad),
        ubicacion_origen: {
          id: resultado.ubicacion_origen_id,
          bodega: resultado.bodega_origen,
          nombre: resultado.ubicacion_origen,
          completo:
            resultado.ubicacion_operaciones_frio_despacho_ubicacion_origen_idToubicacion,
        },
        ubicacion_destino: resultado.ubicacion_destino_id
          ? {
              id: resultado.ubicacion_destino_id,
              bodega: resultado.bodega_destino,
              nombre: resultado.ubicacion_destino,
              completo:
                resultado.ubicacion_operaciones_frio_despacho_ubicacion_destino_idToubicacion,
            }
          : null,
        estado: resultado.estado,
        observaciones: resultado.observaciones,
        usuario: resultado.usuarios,
        fecha_creacion: resultado.fecha_creacion,
        fecha_procesamiento: resultado.fecha_procesamiento,
      };

      return ManejadorRespuestas.exito(
        res,
        operacionFormateada,
        "Operación de frío y despacho creada exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear operación de frío y despacho:", error);

      if (
        error.message.includes("no encontrado") ||
        error.message.includes("inactiv") ||
        error.message.includes("insuficiente")
      ) {
        return ManejadorRespuestas.validacionFallida(
          res,
          [error.message],
          "Error de validación"
        );
      }

      return ManejadorRespuestas.error(
        res,
        "Error al crear operación de frío y despacho",
        "ERROR_CREAR_OPERACION_FRIO_DESPACHO"
      );
    }
  }
}

module.exports = ControladorOperacionesFrioDespacho;
