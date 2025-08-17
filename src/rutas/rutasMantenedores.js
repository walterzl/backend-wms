const express = require('express');
const ControladorMantenedores = require('../controladores/ControladorMantenedores');

const router = express.Router();

/**
 * Rutas de Mantenedores - APIs Centralizadas
 * Proporciona acceso a todos los datos maestros del sistema
 */

/**
 * @route GET /api/mantenedores
 * @desc Obtiene resumen de todos los mantenedores
 * @access Privado
 */
router.get('/', ControladorMantenedores.obtenerResumenMantenedores);

/**
 * @route GET /api/mantenedores/plantas
 * @desc Obtiene todas las plantas
 * @access Privado
 */
router.get('/plantas', ControladorMantenedores.obtenerPlantas);

/**
 * @route GET /api/mantenedores/materiales
 * @desc Obtiene todos los materiales
 * @access Privado
 * @query {boolean} activo - Filtrar por estado activo (default: true)
 */
router.get('/materiales', ControladorMantenedores.obtenerMateriales);

/**
 * @route GET /api/mantenedores/materiales/codigo/:codigo
 * @desc Obtiene un material por código
 * @access Privado
 * @param {string} codigo - Código del material
 */
router.get('/materiales/codigo/:codigo', ControladorMantenedores.obtenerMaterialPorCodigo);

/**
 * @route GET /api/mantenedores/proveedores
 * @desc Obtiene todos los proveedores
 * @access Privado
 * @query {boolean} activo - Filtrar por estado activo (default: true)
 */
router.get('/proveedores', ControladorMantenedores.obtenerProveedores);

/**
 * @route GET /api/mantenedores/proveedores/codigo/:codigo
 * @desc Obtiene un proveedor por código
 * @access Privado
 * @param {string} codigo - Código del proveedor
 */
router.get('/proveedores/codigo/:codigo', ControladorMantenedores.obtenerProveedorPorCodigo);

/**
 * @route GET /api/mantenedores/ubicaciones
 * @desc Obtiene todas las ubicaciones
 * @access Privado
 * @query {boolean} activo - Filtrar por estado activo (default: true)
 */
router.get('/ubicaciones', ControladorMantenedores.obtenerUbicaciones);

/**
 * @route GET /api/mantenedores/ubicaciones/planta/:planta
 * @desc Obtiene ubicaciones por planta
 * @access Privado
 * @param {string} planta - Código de la planta
 * @query {boolean} activo - Filtrar por estado activo (default: true)
 */
router.get('/ubicaciones/planta/:planta', ControladorMantenedores.obtenerUbicacionesPorPlanta);

/**
 * @route GET /api/mantenedores/temporadas
 * @desc Obtiene todas las temporadas
 * @access Privado
 */
router.get('/temporadas', ControladorMantenedores.obtenerTemporadas);

/**
 * @route GET /api/mantenedores/temporadas/activa
 * @desc Obtiene la temporada activa
 * @access Privado
 */
router.get('/temporadas/activa', ControladorMantenedores.obtenerTemporadaActiva);

/**
 * @route GET /api/mantenedores/tipos-movimiento
 * @desc Obtiene todos los tipos de movimiento
 * @access Privado
 * @query {boolean} activo - Filtrar por estado activo (default: true)
 */
router.get('/tipos-movimiento', ControladorMantenedores.obtenerTiposMovimiento);

/**
 * @route GET /api/mantenedores/unidades-medida
 * @desc Obtiene todas las unidades de medida
 * @access Privado
 */
router.get('/unidades-medida', ControladorMantenedores.obtenerUnidadesMedida);

module.exports = router;