const CONSTANTES = require('../configuracion/constantes');

/**
 * Middleware para manejo de errores
 * Centraliza el manejo de errores de la aplicación
 */
class MiddlewareErrores {

  /**
   * Manejo general de errores
   * @param {Error} error - Error capturado
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Función next de Express
   */
  static manejarErrores(error, req, res, next) {
    console.error('Error capturado:', {
      mensaje: error.message,
      stack: error.stack,
      url: req.originalUrl,
      metodo: req.method,
      usuario: req.usuario?.usuario || 'No autenticado',
      timestamp: new Date().toISOString()
    });

    // Error de validación de Prisma
    if (error.code === 'P2002') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.CONFLICTO).json({
        exito: false,
        mensaje: 'Violación de restricción única',
        codigo: 'RESTRICCION_UNICA',
        detalles: error.meta
      });
    }

    // Error de registro no encontrado en Prisma
    if (error.code === 'P2025') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_ENCONTRADO).json({
        exito: false,
        mensaje: 'Registro no encontrado',
        codigo: 'REGISTRO_NO_ENCONTRADO'
      });
    }

    // Error de conexión a base de datos
    if (error.code === 'P1001' || error.code === 'ECONNREFUSED') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.SERVICIO_NO_DISPONIBLE).json({
        exito: false,
        mensaje: 'Error de conexión a la base de datos',
        codigo: 'ERROR_CONEXION_BD'
      });
    }

    // Error de validación personalizado
    if (error.name === 'ValidationError') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
        exito: false,
        mensaje: 'Error de validación',
        codigo: 'ERROR_VALIDACION',
        errores: error.errors
      });
    }

    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
        exito: false,
        mensaje: 'Token JWT inválido',
        codigo: 'TOKEN_INVALIDO'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
        exito: false,
        mensaje: 'Token JWT expirado',
        codigo: 'TOKEN_EXPIRADO'
      });
    }

    // Error genérico del servidor
    res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      codigo: 'ERROR_INTERNO',
      ...(process.env.NODE_ENV === 'development' && {
        detalles: {
          mensaje: error.message,
          stack: error.stack
        }
      })
    });
  }

  /**
   * Manejo de errores no capturados
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Función next de Express
   */
  static manejarErroresNoCapturados(req, res, next) {
    if (res.headersSent) {
      return next();
    }

    res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_ENCONTRADO).json({
      exito: false,
      mensaje: 'Endpoint no encontrado',
      codigo: 'ENDPOINT_NO_ENCONTRADO',
      datos: {
        path: req.originalUrl,
        metodo: req.method
      }
    });
  }

  /**
   * Wrapper para funciones async que captura errores automáticamente
   * @param {Function} fn - Función async a envolver
   * @returns {Function} Función envuelta que captura errores
   */
  static capturarErroresAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

// Manejar excepciones no capturadas globalmente
process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  console.error('Stack:', error.stack);
  
  // Intentar cerrar el servidor gracefully
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  console.error('Promesa:', promise);
  
  // No cerrar el proceso, solo logear
});

module.exports = MiddlewareErrores;