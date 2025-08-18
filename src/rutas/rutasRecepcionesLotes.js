const express = require("express");
const ControladorRecepcionesLotes = require("../controladores/ControladorRecepcionesLotes");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * @route GET /api/recepciones-lotes
 * @desc Obtener todas las recepciones de lotes
 * @access Privado - Requiere autenticación
 */
router.get(
  "/",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.obtenerRecepciones
);

/**
 * @route POST /api/recepciones-lotes
 * @desc Crear nueva recepción de lote
 * @access Privado - Requiere autenticación
 */
router.post(
  "/",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.crearRecepcionLote
);

/**
 * @route GET /api/recepciones-lotes/resumen
 * @desc Obtener resumen de recepciones
 * @access Privado - Requiere autenticación
 */
router.get(
  "/resumen",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.obtenerResumenRecepciones
);

/**
 * @route GET /api/recepciones-lotes/buscar
 * @desc Buscar recepciones por criterios múltiples
 * @access Privado - Requiere autenticación
 */
router.get(
  "/buscar",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.buscarRecepciones
);

/**
 * @route GET /api/recepciones-lotes/proveedor/:proveedor_id
 * @desc Obtener recepciones por proveedor
 * @access Privado - Requiere autenticación
 */
router.get(
  "/proveedor/:proveedor_id",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.obtenerRecepcionesPorProveedor
);

/**
 * @route GET /api/recepciones-lotes/:id
 * @desc Obtener recepción por ID
 * @access Privado - Requiere autenticación
 */
router.get(
  "/:id",
  middlewareAuth.autenticar,
  ControladorRecepcionesLotes.obtenerRecepcionPorId
);

module.exports = router;
