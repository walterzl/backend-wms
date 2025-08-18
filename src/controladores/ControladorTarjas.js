const { PrismaClient } = require("@prisma/client");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");

const prisma = new PrismaClient();

/**
 * Controlador de Tarjas
 * Maneja todas las operaciones relacionadas con el sistema de tarjas
 */
class ControladorTarjas {
  /**
   * Obtiene todas las tarjas con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTarjas(req, res) {
    try {
      const {
        planta,
        tipo_tarja,
        estado,
        material_id,
        proveedor_id,
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

      if (tipo_tarja) {
        filtros.tipo_tarja = {
          equals: tipo_tarja,
          mode: "insensitive",
        };
      }

      if (estado) {
        filtros.estado = {
          equals: estado,
          mode: "insensitive",
        };
      }

      if (material_id) {
        filtros.material_id = parseInt(material_id);
      }

      if (proveedor_id) {
        filtros.proveedor_id = parseInt(proveedor_id);
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_generacion = {};
        if (fecha_desde) {
          filtros.fecha_generacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_generacion.lte = new Date(fecha_hasta);
        }
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      // Obtener tarjas con relaciones
      const [tarjas, total] = await Promise.all([
        prisma.tarjas.findMany({
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
            usuarios: {
              select: {
                id: true,
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
          orderBy: [{ fecha_generacion: "desc" }, { numero_tarja: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.tarjas.count({ where: filtros }),
      ]);

      // Formatear datos
      const tarjasFormateadas = tarjas.map((tarja) => ({
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        tipo_tarja: tarja.tipo_tarja,
        descripcion: tarja.descripcion,
        material: {
          id: tarja.material_id,
          codigo: tarja.codigo_material,
          nombre: tarja.nombre_material,
          completo: tarja.materiales,
        },
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        numero_item: tarja.numero_item,
        fecha_item: tarja.fecha_item,
        proveedor: {
          id: tarja.proveedor_id,
          nombre: tarja.nombre_proveedor,
          completo: tarja.proveedores,
        },
        guia: tarja.guia,
        estado: tarja.estado,
        usuario: tarja.usuarios,
        fecha_creacion: tarja.fecha_creacion,
        fecha_impresion: tarja.fecha_impresion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          tarjas: tarjasFormateadas,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Tarjas obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tarjas:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener tarjas",
        "ERROR_OBTENER_TARJAS"
      );
    }
  }

  /**
   * Obtiene una tarja por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTarjaPorId(req, res) {
    try {
      const { id } = req.params;

      const tarja = await prisma.tarjas.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          materiales: true,
          proveedores: true,
          usuarios: {
            select: {
              id: true,
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
      });

      if (!tarja) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Tarja con ID ${id} no encontrada`
        );
      }

      const tarjaFormateada = {
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        tipo_tarja: tarja.tipo_tarja,
        descripcion: tarja.descripcion,
        material: {
          id: tarja.material_id,
          codigo: tarja.codigo_material,
          nombre: tarja.nombre_material,
          completo: tarja.materiales,
        },
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        numero_item: tarja.numero_item,
        fecha_item: tarja.fecha_item,
        proveedor: {
          id: tarja.proveedor_id,
          nombre: tarja.nombre_proveedor,
          completo: tarja.proveedores,
        },
        guia: tarja.guia,
        estado: tarja.estado,
        usuario: tarja.usuarios,
        fecha_creacion: tarja.fecha_creacion,
        fecha_impresion: tarja.fecha_impresion,
      };

      return ManejadorRespuestas.exito(
        res,
        tarjaFormateada,
        "Tarja obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tarja:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener tarja",
        "ERROR_OBTENER_TARJA"
      );
    }
  }

  /**
   * Obtiene tarjas por número
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTarjaPorNumero(req, res) {
    try {
      const { numero_tarja } = req.params;

      const tarja = await prisma.tarjas.findUnique({
        where: {
          numero_tarja: numero_tarja,
        },
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
          usuarios: {
            select: {
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
      });

      if (!tarja) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Tarja con número ${numero_tarja} no encontrada`
        );
      }

      const tarjaFormateada = {
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        tipo_tarja: tarja.tipo_tarja,
        descripcion: tarja.descripcion,
        codigo_material: tarja.codigo_material,
        nombre_material: tarja.nombre_material,
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        numero_item: tarja.numero_item,
        fecha_item: tarja.fecha_item,
        proveedor: tarja.nombre_proveedor,
        guia: tarja.guia,
        estado: tarja.estado,
        usuario: tarja.usuarios?.nombre_completo,
        fecha_creacion: tarja.fecha_creacion,
        fecha_impresion: tarja.fecha_impresion,
      };

      return ManejadorRespuestas.exito(
        res,
        tarjaFormateada,
        "Tarja obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tarja por número:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener tarja por número",
        "ERROR_OBTENER_TARJA_NUMERO"
      );
    }
  }

  /**
   * Obtiene tarjas por tipo
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTarjasPorTipo(req, res) {
    try {
      const { tipo_tarja } = req.params;
      const { planta, estado, pagina = 1, limite = 50 } = req.query;

      const filtros = {
        tipo_tarja: {
          equals: tipo_tarja,
          mode: "insensitive",
        },
      };

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (estado) {
        filtros.estado = {
          equals: estado,
          mode: "insensitive",
        };
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [tarjas, total] = await Promise.all([
        prisma.tarjas.findMany({
          where: filtros,
          include: {
            materiales: {
              select: {
                codigo_ranco: true,
                nombre_material: true,
              },
            },
          },
          orderBy: [{ fecha_generacion: "desc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.tarjas.count({ where: filtros }),
      ]);

      const tarjasFormateadas = tarjas.map((tarja) => ({
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        descripcion: tarja.descripcion,
        codigo_material: tarja.codigo_material,
        nombre_material: tarja.nombre_material,
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        estado: tarja.estado,
        fecha_impresion: tarja.fecha_impresion,
      }));

      return ManejadorRespuestas.exito(
        res,
        {
          tarjas: tarjasFormateadas,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        `Tarjas de tipo ${tipo_tarja} obtenidas exitosamente`
      );
    } catch (error) {
      console.error("Error al obtener tarjas por tipo:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener tarjas por tipo",
        "ERROR_OBTENER_TARJAS_TIPO"
      );
    }
  }

  /**
   * Busca tarjas por criterios múltiples
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarTarjas(req, res) {
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

      const tarjas = await prisma.tarjas.findMany({
        where: {
          OR: [
            {
              numero_tarja: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              descripcion: {
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
            {
              nombre_proveedor: {
                contains: terminoBusqueda,
                mode: "insensitive",
              },
            },
            {
              guia: {
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
        orderBy: [{ fecha_generacion: "desc" }],
        take: parseInt(limite),
      });

      const tarjasFormateadas = tarjas.map((tarja) => ({
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        tipo_tarja: tarja.tipo_tarja,
        descripcion: tarja.descripcion,
        codigo_material: tarja.codigo_material,
        nombre_material: tarja.nombre_material,
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        proveedor: tarja.nombre_proveedor,
        estado: tarja.estado,
      }));

      return ManejadorRespuestas.exito(
        res,
        tarjasFormateadas,
        `Se encontraron ${tarjasFormateadas.length} tarjas`
      );
    } catch (error) {
      console.error("Error al buscar tarjas:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar tarjas",
        "ERROR_BUSCAR_TARJAS"
      );
    }
  }

  /**
   * Obtiene resumen de tarjas por estado
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenTarjas(req, res) {
    try {
      const { planta, tipo_tarja, fecha_desde, fecha_hasta } = req.query;

      const filtros = {};

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      if (tipo_tarja) {
        filtros.tipo_tarja = {
          equals: tipo_tarja,
          mode: "insensitive",
        };
      }

      if (fecha_desde || fecha_hasta) {
        filtros.fecha_generacion = {};
        if (fecha_desde) {
          filtros.fecha_generacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          filtros.fecha_generacion.lte = new Date(fecha_hasta);
        }
      }

      // Obtener resumen agrupado por estado y tipo
      const resumenTarjas = await prisma.tarjas.groupBy({
        by: ["estado", "tipo_tarja", "planta"],
        where: filtros,
        _count: {
          id: true,
        },
        _sum: {
          cantidad: true,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        resumenTarjas,
        "Resumen de tarjas obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener resumen de tarjas:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener resumen de tarjas",
        "ERROR_OBTENER_RESUMEN_TARJAS"
      );
    }
  }

  /**
   * Obtiene tarjas pendientes de impresión
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTarjasPendientes(req, res) {
    try {
      const { planta, limite = 50 } = req.query;

      const filtros = {
        estado: "generada",
        fecha_impresion: null,
      };

      if (planta) {
        filtros.planta = {
          equals: planta,
          mode: "insensitive",
        };
      }

      const tarjasPendientes = await prisma.tarjas.findMany({
        where: filtros,
        include: {
          materiales: {
            select: {
              codigo_ranco: true,
              nombre_material: true,
            },
          },
        },
        orderBy: [{ fecha_generacion: "asc" }],
        take: parseInt(limite),
      });

      const tarjasFormateadas = tarjasPendientes.map((tarja) => ({
        id: tarja.id,
        numero_tarja: tarja.numero_tarja,
        planta: tarja.planta,
        fecha_generacion: tarja.fecha_generacion,
        tipo_tarja: tarja.tipo_tarja,
        descripcion: tarja.descripcion,
        codigo_material: tarja.codigo_material,
        nombre_material: tarja.nombre_material,
        lote: tarja.lote,
        cantidad: parseFloat(tarja.cantidad),
        proveedor: tarja.nombre_proveedor,
      }));

      return ManejadorRespuestas.exito(
        res,
        tarjasFormateadas,
        "Tarjas pendientes de impresión obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tarjas pendientes:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener tarjas pendientes",
        "ERROR_OBTENER_TARJAS_PENDIENTES"
      );
    }
  }

  /**
   * Crea una nueva tarja
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearTarja(req, res) {
    try {
      const {
        planta,
        fecha_generacion,
        tipo_tarja,
        descripcion,
        material_id,
        codigo_material,
        nombre_material,
        lote,
        cantidad,
        numero_item,
        fecha_item,
        proveedor_id,
        nombre_proveedor,
        guia,
      } = req.body;

      const usuario_id = req.usuario?.id;

      // Validaciones iniciales
      const erroresValidacion = [];

      if (!planta) erroresValidacion.push("Planta es requerida");
      if (!fecha_generacion)
        erroresValidacion.push("Fecha de generación es requerida");
      if (!tipo_tarja) erroresValidacion.push("Tipo de tarja es requerido");
      if (!descripcion) erroresValidacion.push("Descripción es requerida");
      if (!codigo_material)
        erroresValidacion.push("Código de material es requerido");
      if (!nombre_material)
        erroresValidacion.push("Nombre de material es requerido");
      if (!cantidad || cantidad <= 0)
        erroresValidacion.push("Cantidad debe ser mayor a 0");

      // Validaciones específicas por tipo de tarja
      if (tipo_tarja.toUpperCase() === "BODEGA") {
        if (!proveedor_id && !nombre_proveedor) {
          erroresValidacion.push(
            "Proveedor es requerido para tarjas de bodega"
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

        // Generar número de tarja único
        const fechaHoy = new Date(fecha_generacion)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const prefijo = tipo_tarja.toUpperCase() === "CAA" ? "CAA" : "BOD";

        const ultimaTarja = await tx.tarjas.findFirst({
          where: {
            numero_tarja: {
              startsWith: `${prefijo}_${planta.toUpperCase()}_${fechaHoy}`,
            },
            tipo_tarja: tipo_tarja.toUpperCase(),
          },
          orderBy: { numero_tarja: "desc" },
        });

        let secuencial = 1;
        if (ultimaTarja) {
          const ultimoSecuencial = parseInt(ultimaTarja.numero_tarja.slice(-6));
          secuencial = ultimoSecuencial + 1;
        }

        const numero_tarja = `${prefijo}_${planta.toUpperCase()}_${fechaHoy}_${secuencial
          .toString()
          .padStart(6, "0")}`;

        // Crear tarja
        const nuevaTarja = await tx.tarjas.create({
          data: {
            numero_tarja,
            planta: planta.toUpperCase(),
            fecha_generacion: new Date(fecha_generacion),
            tipo_tarja: tipo_tarja.toUpperCase(),
            descripcion,
            material_id: material_id ? parseInt(material_id) : null,
            codigo_material,
            nombre_material,
            lote,
            cantidad: parseFloat(cantidad),
            numero_item: numero_item ? parseInt(numero_item) : null,
            fecha_item: fecha_item ? new Date(fecha_item) : null,
            proveedor_id: proveedor_id ? parseInt(proveedor_id) : null,
            nombre_proveedor,
            guia,
            estado: "generada",
            usuario_id,
          },
          include: {
            materiales: true,
            proveedores: true,
            usuarios: {
              select: {
                nombre_usuario: true,
                nombre_completo: true,
              },
            },
          },
        });

        return nuevaTarja;
      });

      // Formatear respuesta
      const tarjaFormateada = {
        id: resultado.id,
        numero_tarja: resultado.numero_tarja,
        planta: resultado.planta,
        fecha_generacion: resultado.fecha_generacion,
        tipo_tarja: resultado.tipo_tarja,
        descripcion: resultado.descripcion,
        material: {
          id: resultado.material_id,
          codigo: resultado.codigo_material,
          nombre: resultado.nombre_material,
          completo: resultado.materiales,
        },
        lote: resultado.lote,
        cantidad: parseFloat(resultado.cantidad),
        numero_item: resultado.numero_item,
        fecha_item: resultado.fecha_item,
        proveedor: {
          id: resultado.proveedor_id,
          nombre: resultado.nombre_proveedor,
          completo: resultado.proveedores,
        },
        guia: resultado.guia,
        estado: resultado.estado,
        usuario: resultado.usuarios,
        fecha_creacion: resultado.fecha_creacion,
        fecha_impresion: resultado.fecha_impresion,
      };

      return ManejadorRespuestas.exito(
        res,
        tarjaFormateada,
        "Tarja creada exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear tarja:", error);

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
        "Error al crear tarja",
        "ERROR_CREAR_TARJA"
      );
    }
  }

  /**
   * Marca una tarja como impresa
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async marcarTarjaImpresa(req, res) {
    try {
      const { id } = req.params;

      const tarja = await prisma.tarjas.findUnique({
        where: { id: parseInt(id) },
      });

      if (!tarja) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Tarja con ID ${id} no encontrada`
        );
      }

      if (tarja.estado !== "generada") {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Solo se pueden imprimir tarjas en estado 'generada'"],
          "Estado inválido"
        );
      }

      const tarjaActualizada = await prisma.tarjas.update({
        where: { id: parseInt(id) },
        data: {
          estado: "impresa",
          fecha_impresion: new Date(),
        },
        include: {
          materiales: true,
          proveedores: true,
          usuarios: {
            select: {
              nombre_usuario: true,
              nombre_completo: true,
            },
          },
        },
      });

      const tarjaFormateada = {
        id: tarjaActualizada.id,
        numero_tarja: tarjaActualizada.numero_tarja,
        planta: tarjaActualizada.planta,
        fecha_generacion: tarjaActualizada.fecha_generacion,
        tipo_tarja: tarjaActualizada.tipo_tarja,
        descripcion: tarjaActualizada.descripcion,
        material: {
          id: tarjaActualizada.material_id,
          codigo: tarjaActualizada.codigo_material,
          nombre: tarjaActualizada.nombre_material,
          completo: tarjaActualizada.materiales,
        },
        lote: tarjaActualizada.lote,
        cantidad: parseFloat(tarjaActualizada.cantidad),
        numero_item: tarjaActualizada.numero_item,
        fecha_item: tarjaActualizada.fecha_item,
        proveedor: {
          id: tarjaActualizada.proveedor_id,
          nombre: tarjaActualizada.nombre_proveedor,
          completo: tarjaActualizada.proveedores,
        },
        guia: tarjaActualizada.guia,
        estado: tarjaActualizada.estado,
        usuario: tarjaActualizada.usuarios,
        fecha_creacion: tarjaActualizada.fecha_creacion,
        fecha_impresion: tarjaActualizada.fecha_impresion,
      };

      return ManejadorRespuestas.exito(
        res,
        tarjaFormateada,
        "Tarja marcada como impresa exitosamente"
      );
    } catch (error) {
      console.error("Error al marcar tarja como impresa:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al marcar tarja como impresa",
        "ERROR_MARCAR_TARJA_IMPRESA"
      );
    }
  }
}

module.exports = ControladorTarjas;
