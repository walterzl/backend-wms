const express = require('express');

const router = express.Router();

/**
 * Rutas de Inventario - Placeholder
 * TODO: Implementar controladores completos
 */

router.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Endpoint de inventario - En desarrollo',
    version: '1.0.0'
  });
});

module.exports = router;