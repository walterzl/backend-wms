const express = require("express");
const ControladorStockUbicaciones = require("../controladores/ControladorStockUbicaciones");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * @route GET /api/stock-ubicaciones
 * @desc Obtener stock por ubicaciones
 * @access Privado - Requiere autenticación
 */
router.get(
  "/",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.obtenerStockUbicaciones
);

/**
 * @route GET /api/stock-ubicaciones/resumen
 * @desc Obtener resumen consolidado de stock
 * @access Privado - Requiere autenticación
 */
router.get(
  "/resumen",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.obtenerResumenStock
);

/**
 * @route GET /api/stock-ubicaciones/buscar
 * @desc Buscar stock por criterios múltiples
 * @access Privado - Requiere autenticación
 */
router.get(
  "/buscar",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.buscarStock
);

/**
 * @route GET /api/stock-ubicaciones/material/:material_id
 * @desc Obtener stock por material específico
 * @access Privado - Requiere autenticación
 */
router.get(
  "/material/:material_id",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.obtenerStockPorMaterial
);

/**
 * @route GET /api/stock-ubicaciones/ubicacion/:ubicacion_id
 * @desc Obtener stock por ubicación específica
 * @access Privado - Requiere autenticación
 */
router.get(
  "/ubicacion/:ubicacion_id",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.obtenerStockPorUbicacion
);

/**
 * @route GET /api/stock-ubicaciones/:id
 * @desc Obtener registro de stock por ID
 * @access Privado - Requiere autenticación
 */
router.get(
  "/:id",
  middlewareAuth.autenticar,
  ControladorStockUbicaciones.obtenerStockPorId
);

module.exports = router;
