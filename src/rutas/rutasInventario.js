const express = require("express");
const ControladorInventario = require("../controladores/ControladorInventario");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * Rutas de Inventario
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(middlewareAuth.autenticar);

// Rutas principales
router.get("/", ControladorInventario.obtenerInventario);
router.get("/resumen-stock", ControladorInventario.obtenerResumenStock);
router.get("/buscar", ControladorInventario.buscarInventarioPorMaterial);
router.get("/planta/:planta", ControladorInventario.obtenerInventarioPorPlanta);
router.get("/:id", ControladorInventario.obtenerInventarioPorId);

// Ruta para crear registro de inventario
router.post("/", ControladorInventario.crearInventario);

module.exports = router;
