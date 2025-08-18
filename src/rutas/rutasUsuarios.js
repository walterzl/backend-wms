const express = require("express");
const ControladorUsuarios = require("../controladores/ControladorUsuarios");
const middlewareAuth = require("../middleware/middlewareAuth");

const router = express.Router();

/**
 * Rutas de Usuarios
 * Todas las rutas requieren autenticación y rol de administrador
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(middlewareAuth.autenticar);

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== "administrador") {
    return res.status(403).json({
      exito: false,
      mensaje: "Acceso denegado. Se requiere rol de administrador.",
      codigo: "ACCESO_DENEGADO",
    });
  }
  next();
};

// Rutas que requieren rol de administrador
router.get("/", verificarAdmin, ControladorUsuarios.obtenerUsuarios);
router.post("/", verificarAdmin, ControladorUsuarios.crearUsuario);
router.get("/buscar", verificarAdmin, ControladorUsuarios.buscarUsuarios);
router.get("/:id", verificarAdmin, ControladorUsuarios.obtenerUsuarioPorId);
router.put("/:id", verificarAdmin, ControladorUsuarios.actualizarUsuario);
router.patch(
  "/:id/estado",
  verificarAdmin,
  ControladorUsuarios.cambiarEstadoUsuario
);
router.post(
  "/:id/resetear-password",
  verificarAdmin,
  ControladorUsuarios.resetearPassword
);
router.get(
  "/:id/sesiones",
  verificarAdmin,
  ControladorUsuarios.obtenerSesionesUsuario
);

module.exports = router;
