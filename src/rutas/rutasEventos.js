const express = require('express');
const ControladorEventos = require('../controladores/ControladorEventos');
const ServicioEventos = require('../servicios/ServicioEventos');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @route GET /api/eventos/conectar
 * @description Establece una conexión Server-Sent Events (SSE) para recibir actualizaciones en tiempo real.
 * @access Privado - Requiere autenticación.
 */
router.get(
  '/conectar',
  ControladorEventos.conectar
);

/**
 * @route POST /api/eventos/notificar
 * @description Envía una notificación a todos los clientes conectados por SSE. (Endpoint de prueba)
 * @access Privado - Requiere autenticación.
 * @body {string} evento - El nombre del evento a emitir.
 * @body {object} datos - El payload de datos a enviar.
 */
router.post(
  '/notificar',
  [
    body('evento').isString().notEmpty().withMessage('El nombre del evento es requerido.'),
    body('datos').isObject().withMessage('El campo de datos debe ser un objeto.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ exito: false, errores: errors.array() });
    }

    const { evento, datos } = req.body;

    // Usamos el servicio para enviar el evento a todos los clientes.
    ServicioEventos.enviarEvento(datos, evento);

    res.status(200).json({
      exito: true,
      mensaje: `Evento '${evento}' enviado a todos los clientes conectados.`,
    });
  }
);

module.exports = router;
