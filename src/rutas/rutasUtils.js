const express = require('express');
const CONSTANTES = require('../configuracion/constantes');
const configuracion = require('../configuracion/config');

const router = express.Router();

/**
 * Rutas Utilitarias
 * Endpoints para funciones auxiliares del sistema
 */

/**
 * @route GET /api/utils/health
 * @desc Verificación de salud del sistema
 * @access Público
 */
router.get('/health', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    datos: {
      version: configuracion.aplicacion.version,
      entorno: configuracion.servidor.entorno,
      uptime: process.uptime(),
      memoria: process.memoryUsage(),
      pid: process.pid
    }
  });
});

/**
 * @route GET /api/utils/version
 * @desc Información de versión del sistema
 * @access Público
 */
router.get('/version', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Información de versión obtenida',
    datos: {
      aplicacion: configuracion.aplicacion.nombre,
      version: configuracion.aplicacion.version,
      descripcion: configuracion.aplicacion.descripcion,
      entorno: configuracion.servidor.entorno,
      node_version: process.version
    }
  });
});

/**
 * @route POST /api/utils/generar-codigo
 * @desc Genera códigos únicos para el sistema
 * @access Privado
 */
router.post('/generar-codigo', (req, res) => {
  const { tipo = 'GENERAL', prefijo = 'WMS', longitud = 8 } = req.body;
  
  // Importar ServicioUtilidades dinámicamente para evitar dependencias circulares
  const ServicioUtilidades = require('../servicios/ServicioUtilidades');
  
  const codigo = ServicioUtilidades.generarCodigo(prefijo, longitud);
  
  res.json({
    exito: true,
    mensaje: 'Código generado exitosamente',
    datos: {
      codigo: codigo,
      tipo: tipo,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route POST /api/utils/validar-codigo-barras
 * @desc Valida formato de códigos de barras
 * @access Privado
 */
router.post('/validar-codigo-barras', (req, res) => {
  const { codigoBarras } = req.body;
  
  if (!codigoBarras) {
    return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
      exito: false,
      mensaje: 'Código de barras requerido',
      codigo: 'CODIGO_BARRAS_REQUERIDO'
    });
  }
  
  // Importar ServicioValidacion dinámicamente
  const ServicioValidacion = require('../servicios/ServicioValidacion');
  
  const esValido = ServicioValidacion.validarCodigoBarras(codigoBarras);
  
  res.json({
    exito: true,
    mensaje: 'Validación de código de barras completada',
    datos: {
      codigoBarras: codigoBarras,
      esValido: esValido,
      longitud: codigoBarras.length
    }
  });
});

module.exports = router;