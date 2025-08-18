const express = require("express");
const ControladorTarjas = require("../controladores/ControladorTarjas");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * @route GET /api/tarjas
 * @desc Obtener todas las tarjas
 * @access Privado - Requiere autenticación
 */
router.get("/", middlewareAuth.autenticar, ControladorTarjas.obtenerTarjas);

/**
 * @route POST /api/tarjas
 * @desc Crear nueva tarja
 * @access Privado - Requiere autenticación
 */
router.post("/", middlewareAuth.autenticar, ControladorTarjas.crearTarja);

/**
 * @route GET /api/tarjas/resumen
 * @desc Obtener resumen de tarjas por estado
 * @access Privado - Requiere autenticación
 */
router.get(
  "/resumen",
  middlewareAuth.autenticar,
  ControladorTarjas.obtenerResumenTarjas
);

/**
 * @route GET /api/tarjas/buscar
 * @desc Buscar tarjas por criterios múltiples
 * @access Privado - Requiere autenticación
 */
router.get(
  "/buscar",
  middlewareAuth.autenticar,
  ControladorTarjas.buscarTarjas
);

/**
 * @route GET /api/tarjas/pendientes
 * @desc Obtener tarjas pendientes de impresión
 * @access Privado - Requiere autenticación
 */
router.get(
  "/pendientes",
  middlewareAuth.autenticar,
  ControladorTarjas.obtenerTarjasPendientes
);

/**
 * @route GET /api/tarjas/tipo/:tipo_tarja
 * @desc Obtener tarjas por tipo
 * @access Privado - Requiere autenticación
 */
router.get(
  "/tipo/:tipo_tarja",
  middlewareAuth.autenticar,
  ControladorTarjas.obtenerTarjasPorTipo
);

/**
 * @route GET /api/tarjas/numero/:numero_tarja
 * @desc Obtener tarja por número
 * @access Privado - Requiere autenticación
 */
router.get(
  "/numero/:numero_tarja",
  middlewareAuth.autenticar,
  ControladorTarjas.obtenerTarjaPorNumero
);

/**
 * @route PUT /api/tarjas/:id/imprimir
 * @desc Marcar tarja como impresa
 * @access Privado - Requiere autenticación
 */
router.put(
  "/:id/imprimir",
  middlewareAuth.autenticar,
  ControladorTarjas.marcarTarjaImpresa
);

/**
 * @route GET /api/tarjas/:id
 * @desc Obtener tarja por ID
 * @access Privado - Requiere autenticación
 */
router.get(
  "/:id",
  middlewareAuth.autenticar,
  ControladorTarjas.obtenerTarjaPorId
);

module.exports = router;
