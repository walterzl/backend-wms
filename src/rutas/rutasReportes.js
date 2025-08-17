const express = require('express');

const router = express.Router();

/**
 * Rutas de Reportes - Placeholder
 * TODO: Implementar controladores completos
 */

router.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Endpoint de reportes - En desarrollo',
    version: '1.0.0'
  });
});

module.exports = router;