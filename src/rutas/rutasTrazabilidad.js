const express = require('express');

const router = express.Router();

/**
 * Rutas de Trazabilidad - Placeholder
 * TODO: Implementar controladores completos
 */

router.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Endpoint de trazabilidad - En desarrollo',
    version: '1.0.0'
  });
});

module.exports = router;