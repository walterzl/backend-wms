const express = require("express");
const ControladorOperacionesFrioDespacho = require("../controladores/ControladorOperacionesFrioDespacho");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * @route GET /api/operaciones-frio-despacho
 * @desc Obtener todas las operaciones de frío y despacho
 * @access Privado - Requiere autenticación
 */
router.get(
  "/",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.obtenerOperaciones
);

/**
 * @route POST /api/operaciones-frio-despacho
 * @desc Crear nueva operación de frío y despacho
 * @access Privado - Requiere autenticación
 */
router.post(
  "/",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.crearOperacionFrioDespacho
);

/**
 * @route GET /api/operaciones-frio-despacho/resumen
 * @desc Obtener resumen de operaciones
 * @access Privado - Requiere autenticación
 */
router.get(
  "/resumen",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.obtenerResumenOperaciones
);

/**
 * @route GET /api/operaciones-frio-despacho/buscar
 * @desc Buscar operaciones por criterios múltiples
 * @access Privado - Requiere autenticación
 */
router.get(
  "/buscar",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.buscarOperaciones
);

/**
 * @route GET /api/operaciones-frio-despacho/embarque/:numero_embarque
 * @desc Obtener operaciones por número de embarque
 * @access Privado - Requiere autenticación
 */
router.get(
  "/embarque/:numero_embarque",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.obtenerOperacionesPorEmbarque
);

/**
 * @route GET /api/operaciones-frio-despacho/:id
 * @desc Obtener operación por ID
 * @access Privado - Requiere autenticación
 */
router.get(
  "/:id",
  middlewareAuth.autenticar,
  ControladorOperacionesFrioDespacho.obtenerOperacionPorId
);

module.exports = router;
