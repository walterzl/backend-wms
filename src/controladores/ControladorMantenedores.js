const { PrismaClient } = require('@prisma/client');
const CONSTANTES = require('../configuracion/constantes');
const ManejadorRespuestas = require('../utilidades/ManejadorRespuestas');
const ServicioBaseCRUD = require('../servicios/ServicioBaseCRUD');

const prisma = new PrismaClient();

/**
 * Controlador de Mantenedores - APIs Centralizadas
 * Maneja todas las operaciones relacionadas con datos maestros del sistema
 */
class ControladorMantenedores {

  /**
   * Obtiene todas las plantas del sistema
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerPlantas(req, res) {
    try {
      const plantas = Object.entries(CONSTANTES.PLANTAS).map(([clave, valor]) => ({
        codigo: valor,
        nombre: valor,
        descripcion: `Planta ${valor}`
      }));

      return ManejadorRespuestas.exito(
        res, 
        plantas, 
        'Plantas obtenidas exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener plantas:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener plantas',
        'ERROR_OBTENER_PLANTAS'
      );
    }
  }

  /**
   * Obtiene todos los materiales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMateriales(req, res) {
    try {
      const { activo = true } = req.query;

      const materiales = await prisma.materiales.findMany({
        where: {
          activo: activo === 'true' || activo === true
        },
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

      // Formatear datos para mantener compatibilidad con frontend
      const materialesFormateados = materiales.map(material => ({
        id: material.id,
        codigo: material.codigo_ranco,
        nombre: material.nombre_material,
        unidad_medida: material.unidad_medida,
        requiere_frio: material.frio === 'Si' || material.frio === 'Sí',
        activo: material.activo
      }));

      return ManejadorRespuestas.exito(
        res,
        materialesFormateados,
        'Materiales obtenidos exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener materiales:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener materiales',
        'ERROR_OBTENER_MATERIALES'
      );
    }
  }

  /**
   * Obtiene un material por código
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerMaterialPorCodigo(req, res) {
    try {
      const { codigo } = req.params;

      const material = await prisma.materiales.findFirst({
        where: {
          codigo_ranco: codigo,
          activo: true
        },
        select: {
          id: true,
          codigo_ranco: true,
          nombre_material: true,
          unidad_medida: true,
          frio: true,
          activo: true
        }
      });

      if (!material) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Material con código ${codigo} no encontrado`
        );
      }

      const materialFormateado = {
        id: material.id,
        codigo: material.codigo_ranco,
        nombre: material.nombre_material,
        unidad_medida: material.unidad_medida,
        requiere_frio: material.frio === 'Si' || material.frio === 'Sí',
        activo: material.activo
      };

      return ManejadorRespuestas.exito(
        res,
        materialFormateado,
        'Material obtenido exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener material por código:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener material',
        'ERROR_OBTENER_MATERIAL'
      );
    }
  }

  /**
   * Obtiene todos los proveedores
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerProveedores(req, res) {
    try {
      const { activo = true } = req.query;

      const proveedores = await prisma.proveedores.findMany({
        where: {
          activo: activo === 'true' || activo === true
        },
        select: {
          id: true,
          title: true,
          activo: true
        },
        orderBy: {
          title: 'asc'
        }
      });

      // Formatear datos para mantener compatibilidad con frontend
      const proveedoresFormateados = proveedores.map(proveedor => ({
        id: proveedor.id,
        codigo: `PROV${proveedor.id.toString().padStart(3, '0')}`,
        nombre: proveedor.title,
        rut: null,
        contacto: null,
        telefono: null,
        email: null,
        activo: proveedor.activo
      }));

      return ManejadorRespuestas.exito(
        res,
        proveedoresFormateados,
        'Proveedores obtenidos exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener proveedores',
        'ERROR_OBTENER_PROVEEDORES'
      );
    }
  }

  /**
   * Obtiene un proveedor por código
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerProveedorPorCodigo(req, res) {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ['Código de proveedor requerido'],
          'Datos de entrada inválidos'
        );
      }

      // Buscar por ID si el código es numérico (extraer número del formato PROV###)
      let whereClause;
      if (codigo.startsWith('PROV')) {
        const id = parseInt(codigo.replace('PROV', ''));
        if (!isNaN(id)) {
          whereClause = { id: id, activo: true };
        } else {
          whereClause = { title: { contains: codigo, mode: 'insensitive' }, activo: true };
        }
      } else {
        whereClause = { title: { contains: codigo, mode: 'insensitive' }, activo: true };
      }

      const proveedor = await prisma.proveedores.findFirst({
        where: whereClause,
        select: {
          id: true,
          title: true,
          activo: true
        }
      });

      if (!proveedor) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Proveedor con código ${codigo} no encontrado`
        );
      }

      const proveedorFormateado = {
        id: proveedor.id,
        codigo: `PROV${proveedor.id.toString().padStart(3, '0')}`,
        nombre: proveedor.title,
        rut: null,
        contacto: null,
        telefono: null,
        email: null,
        activo: proveedor.activo
      };

      return ManejadorRespuestas.exito(
        res,
        proveedorFormateado,
        'Proveedor obtenido exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener proveedor por código:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener proveedor',
        'ERROR_OBTENER_PROVEEDOR'
      );
    }
  }

  /**
   * Obtiene todas las ubicaciones
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerUbicaciones(req, res) {
    try {
      const { activo = true } = req.query;

      const ubicaciones = await prisma.ubicacion.findMany({
        where: {
          activo: activo === 'true' || activo === true
        },
        select: {
          id: true,
          title: true,
          bodega_deposito: true,
          planta: true,
          activo: true
        },
        orderBy: [
          { planta: 'asc' },
          { bodega_deposito: 'asc' },
          { title: 'asc' }
        ]
      });

      // Formatear datos para mantener compatibilidad con frontend
      const ubicacionesFormateadas = ubicaciones.map(ubicacion => ({
        id: ubicacion.id,
        codigo: `UB${ubicacion.id.toString().padStart(3, '0')}`,
        nombre: ubicacion.title,
        bodega: ubicacion.bodega_deposito,
        planta: ubicacion.planta,
        tipo: 'bodega',
        activo: ubicacion.activo
      }));

      return ManejadorRespuestas.exito(
        res,
        ubicacionesFormateadas,
        'Ubicaciones obtenidas exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener ubicaciones',
        'ERROR_OBTENER_UBICACIONES'
      );
    }
  }

  /**
   * Obtiene ubicaciones por planta
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerUbicacionesPorPlanta(req, res) {
    try {
      const { planta } = req.params;
      const { activo = true } = req.query;

      if (!planta) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ['Planta requerida'],
          'Datos de entrada inválidos'
        );
      }

      const ubicaciones = await prisma.ubicacion.findMany({
        where: {
          planta: planta.toUpperCase(),
          activo: activo === 'true' || activo === true
        },
        select: {
          id: true,
          title: true,
          bodega_deposito: true,
          planta: true,
          activo: true
        },
        orderBy: [
          { bodega_deposito: 'asc' },
          { title: 'asc' }
        ]
      });

      const ubicacionesFormateadas = ubicaciones.map(ubicacion => ({
        id: ubicacion.id,
        codigo: `UB${ubicacion.id.toString().padStart(3, '0')}`,
        nombre: ubicacion.title,
        bodega: ubicacion.bodega_deposito,
        planta: ubicacion.planta,
        tipo: 'bodega',
        activo: ubicacion.activo
      }));

      return ManejadorRespuestas.exito(
        res,
        ubicacionesFormateadas,
        `Ubicaciones de planta ${planta.toUpperCase()} obtenidas exitosamente`
      );

    } catch (error) {
      console.error('Error al obtener ubicaciones por planta:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener ubicaciones por planta',
        'ERROR_OBTENER_UBICACIONES_PLANTA'
      );
    }
  }

  /**
   * Obtiene todas las temporadas
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTemporadas(req, res) {
    try {
      const { activo = true } = req.query;

      const temporadas = await prisma.temporadas_app.findMany({
        where: {
          activo: activo === 'true' || activo === true
        },
        select: {
          id: true,
          title: true,
          fecha_inicio: true,
          fecha_fin: true,
          activo: true
        },
        orderBy: {
          fecha_inicio: 'desc'
        }
      });

      return ManejadorRespuestas.exito(
        res,
        temporadas,
        'Temporadas obtenidas exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener temporadas:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener temporadas',
        'ERROR_OBTENER_TEMPORADAS'
      );
    }
  }

  /**
   * Obtiene la temporada activa
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTemporadaActiva(req, res) {
    try {
      const temporadaActiva = await prisma.temporadas_app.findFirst({
        where: {
          activo: true
        },
        select: {
          id: true,
          title: true,
          fecha_inicio: true,
          fecha_fin: true,
          activo: true
        }
      });

      if (!temporadaActiva) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'No hay temporada activa configurada'
        );
      }

      const temporadaFormateada = {
        id: temporadaActiva.id,
        codigo: temporadaActiva.title,
        nombre: temporadaActiva.title,
        fecha_inicio: temporadaActiva.fecha_inicio,
        fecha_termino: temporadaActiva.fecha_fin,
        activa: temporadaActiva.activo
      };

      return ManejadorRespuestas.exito(
        res,
        temporadaFormateada,
        'Temporada activa obtenida exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener temporada activa:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener temporada activa',
        'ERROR_OBTENER_TEMPORADA_ACTIVA'
      );
    }
  }

  /**
   * Obtiene todos los tipos de movimiento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerTiposMovimiento(req, res) {
    try {
      const { activo = true } = req.query;

      const tiposMovimiento = await prisma.tipo_movimientos_app.findMany({
        where: {
          activo: activo === 'true' || activo === true
        },
        select: {
          id: true,
          title: true,
          descripcion: true,
          activo: true
        },
        orderBy: {
          title: 'asc'
        }
      });

      const tiposMovimientoFormateados = tiposMovimiento.map(tipo => ({
        id: tipo.id,
        codigo: tipo.title,
        nombre: tipo.title,
        descripcion: tipo.descripcion,
        activo: tipo.activo
      }));

      return ManejadorRespuestas.exito(
        res,
        tiposMovimientoFormateados,
        'Tipos de movimiento obtenidos exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener tipos de movimiento:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener tipos de movimiento',
        'ERROR_OBTENER_TIPOS_MOVIMIENTO'
      );
    }
  }

  /**
   * Obtiene todas las unidades de medida disponibles
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerUnidadesMedida(req, res) {
    try {
      const unidadesMedida = Object.entries(CONSTANTES.UNIDADES_MEDIDA).map(([clave, valor]) => ({
        codigo: valor,
        nombre: clave.toLowerCase().replace(/_/g, ' '),
        descripcion: valor
      }));

      return ManejadorRespuestas.exito(
        res,
        unidadesMedida,
        'Unidades de medida obtenidas exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener unidades de medida:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener unidades de medida',
        'ERROR_OBTENER_UNIDADES_MEDIDA'
      );
    }
  }

  /**
   * Obtiene resumen de todos los mantenedores
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerResumenMantenedores(req, res) {
    try {
      const [
        totalMateriales,
        totalProveedores,
        totalUbicaciones,
        temporadaActiva,
        totalTiposMovimiento
      ] = await Promise.all([
        prisma.materiales.count({ where: { activo: true } }),
        prisma.proveedores.count({ where: { activo: true } }),
        prisma.ubicacion.count({ where: { activo: true } }),
        prisma.temporadas_app.findFirst({ where: { activa: true } }),
        prisma.tipo_movimientos_app.count({ where: { activo: true } })
      ]);

      const resumen = {
        materiales: totalMateriales,
        proveedores: totalProveedores,
        ubicaciones: totalUbicaciones,
        tiposMovimiento: totalTiposMovimiento,
        plantas: Object.keys(CONSTANTES.PLANTAS).length,
        unidadesMedida: Object.keys(CONSTANTES.UNIDADES_MEDIDA).length,
        temporadaActiva: temporadaActiva ? temporadaActiva.nombre : null
      };

      return ManejadorRespuestas.exito(
        res,
        resumen,
        'Resumen de mantenedores obtenido exitosamente'
      );

    } catch (error) {
      console.error('Error al obtener resumen de mantenedores:', error);
      return ManejadorRespuestas.error(
        res,
        'Error al obtener resumen de mantenedores',
        'ERROR_OBTENER_RESUMEN_MANTENEDORES'
      );
    }
  }
}

module.exports = ControladorMantenedores;