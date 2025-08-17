const express = require('express');

const router = express.Router();

/**
 * Rutas de Usuarios - Placeholder
 * TODO: Implementar controladores completos
 */

router.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Endpoint de usuarios - En desarrollo',
    version: '1.0.0'
  });
});

module.exports = router;