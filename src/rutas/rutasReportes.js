const express = require("express");
const ControladorReportes = require("../controladores/ControladorReportes");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * Rutas de Reportes
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(middlewareAuth.autenticar);

// Rutas de reportes
router.get("/", ControladorReportes.obtenerReportes);
router.get("/dashboard", ControladorReportes.dashboard);
router.get("/inventario/planta", ControladorReportes.reporteInventarioPlanta);
router.get(
  "/movimientos/periodo",
  ControladorReportes.reporteMovimientosPeriodo
);
router.get("/stock/material", ControladorReportes.reporteStockMaterial);

// Rutas que requieren permisos de administrador
const verificarAdminOSupervisor = (req, res, next) => {
  if (!["administrador", "supervisor"].includes(req.usuario.rol)) {
    return res.status(403).json({
      exito: false,
      mensaje:
        "Acceso denegado. Se requiere rol de administrador o supervisor.",
      codigo: "ACCESO_DENEGADO",
    });
  }
  next();
};

router.get(
  "/auditoria",
  verificarAdminOSupervisor,
  ControladorReportes.reporteAuditoria
);

module.exports = router;
