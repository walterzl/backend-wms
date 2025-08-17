const express = require('express');
const ControladorAuth = require('../controladores/ControladorAuth');
const middlewareAuth = require('../middleware/middlewareAuth');

const router = express.Router();

/**
 * Rutas de Autenticación
 * Maneja el login, logout, refresh y validación de tokens
 */

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión de usuario
 * @access Público
 */
router.post('/login', ControladorAuth.login);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión del usuario
 * @access Privado (requiere token)
 */
router.post('/logout', middlewareAuth.autenticacionOpcional, ControladorAuth.logout);

/**
 * @route POST /api/auth/refresh
 * @desc Refrescar token de acceso
 * @access Privado (requere token válido)
 */
router.post('/refresh', ControladorAuth.refresh);

/**
 * @route GET /api/auth/validate
 * @desc Validar token actual
 * @access Privado (requiere token válido)
 */
router.get('/validate', middlewareAuth.autenticar, ControladorAuth.validate);

/**
 * @route PUT /api/auth/cambiar-password
 * @desc Cambiar contraseña del usuario
 * @access Privado (requiere autenticación)
 */
router.put('/cambiar-password', middlewareAuth.autenticar, ControladorAuth.cambiarPassword);

module.exports = router;