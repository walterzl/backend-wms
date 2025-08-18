const express = require("express");
const ControladorTrazabilidad = require("../controladores/ControladorTrazabilidad");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * Rutas de Trazabilidad
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(middlewareAuth.autenticar);

// Rutas principales
router.get("/", ControladorTrazabilidad.obtenerMovimientos);
router.post("/", ControladorTrazabilidad.crearMovimientoManual);
router.get("/resumen", ControladorTrazabilidad.obtenerResumenMovimientos);
router.get("/buscar", ControladorTrazabilidad.buscarMovimientos);
router.get(
  "/material/:material_id",
  ControladorTrazabilidad.obtenerMovimientosPorMaterial
);
router.get(
  "/planta/:planta",
  ControladorTrazabilidad.obtenerMovimientosPorPlanta
);
router.get("/:id", ControladorTrazabilidad.obtenerMovimientoPorId);

module.exports = router;
