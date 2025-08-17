const winston = require('winston');
const path = require('path');
const fs = require('fs');
const configuracion = require('../configuracion/config');

// Crear directorio de logs si no existe
const logsDir = path.dirname(configuracion.logs.archivo);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configurar Winston
const logger = winston.createLogger({
  level: configuracion.logs.nivel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    servicio: configuracion.aplicacion.nombre,
    version: configuracion.aplicacion.version
  },
  transports: [
    // Escribir logs de error a archivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Escribir todos los logs al archivo principal
    new winston.transports.File({
      filename: configuracion.logs.archivo,
      maxsize: configuracion.logs.maxSize || 20 * 1024 * 1024,
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// En desarrollo, también logear a consola
if (configuracion.servidor.entorno !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Middleware para logging de requests y sistema
 */
class MiddlewareLogs {

  /**
   * Middleware para registrar requests HTTP
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Función next de Express
   */
  static registrarRequest(req, res, next) {
    const inicioTiempo = Date.now();
    
    // Capturar el método original de res.json para interceptar la respuesta
    const jsonOriginal = res.json;
    let statusCode = 200;
    let respuestaBody = null;

    res.json = function(body) {
      respuestaBody = body;
      statusCode = res.statusCode;
      return jsonOriginal.call(this, body);
    };

    // Cuando la respuesta termine, logear la información
    res.on('finish', () => {
      const duracion = Date.now() - inicioTiempo;
      
      const logData = {
        metodo: req.method,
        url: req.originalUrl,
        statusCode: statusCode,
        duracion: `${duracion}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        usuario: req.usuario?.usuario || null,
        timestamp: new Date().toISOString()
      };

      // Logear según el status code
      if (statusCode >= 500) {
        logger.error('Request con error del servidor', {
          ...logData,
          respuesta: respuestaBody
        });
      } else if (statusCode >= 400) {
        logger.warn('Request con error del cliente', logData);
      } else {
        logger.info('Request exitoso', logData);
      }
    });

    next();
  }

  /**
   * Registra eventos del sistema en logs
   * @param {string} nivel - Nivel del log (info, warn, error, debug)
   * @param {string} mensaje - Mensaje del log
   * @param {Object} metadata - Información adicional
   * @param {Object} usuario - Información del usuario (opcional)
   */
  static registrarEvento(nivel, mensaje, metadata = {}, usuario = null) {
    const logData = {
      mensaje,
      ...metadata,
      usuario: usuario?.usuario || null,
      usuarioId: usuario?.id || null,
      timestamp: new Date().toISOString()
    };

    switch (nivel.toLowerCase()) {
      case 'error':
        logger.error(logData);
        break;
      case 'warn':
      case 'warning':
        logger.warn(logData);
        break;
      case 'debug':
        logger.debug(logData);
        break;
      default:
        logger.info(logData);
    }
  }

  /**
   * Registra errores de autenticación
   * @param {string} tipoError - Tipo de error de autenticación
   * @param {Object} req - Request object
   * @param {Object} detalles - Detalles adicionales del error
   */
  static registrarErrorAuth(tipoError, req, detalles = {}) {
    logger.warn('Error de autenticación', {
      tipo: tipoError,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      url: req.originalUrl,
      metodo: req.method,
      ...detalles,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra operaciones importantes del sistema
   * @param {string} operacion - Nombre de la operación
   * @param {Object} datos - Datos de la operación
   * @param {Object} usuario - Usuario que realiza la operación
   * @param {string} resultado - Resultado de la operación ('exito' | 'fallo')
   */
  static registrarOperacion(operacion, datos, usuario, resultado = 'exito') {
    const nivel = resultado === 'exito' ? 'info' : 'warn';
    
    logger.log(nivel, 'Operación del sistema', {
      operacion,
      resultado,
      datos,
      usuario: usuario?.usuario || null,
      usuarioId: usuario?.id || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra intentos de acceso a recursos restringidos
   * @param {Object} req - Request object
   * @param {string} recurso - Recurso al que se intentó acceder
   * @param {string} razon - Razón de la restricción
   */
  static registrarAccesoDenegado(req, recurso, razon) {
    logger.warn('Acceso denegado', {
      recurso,
      razon,
      usuario: req.usuario?.usuario || 'No autenticado',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      url: req.originalUrl,
      metodo: req.method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra cambios en datos críticos
   * @param {string} tabla - Tabla afectada
   * @param {string} accion - Acción realizada (create, update, delete)
   * @param {Object} datosAnteriores - Datos antes del cambio (para update/delete)
   * @param {Object} datosNuevos - Datos nuevos (para create/update)
   * @param {Object} usuario - Usuario que realizó el cambio
   */
  static registrarCambioDatos(tabla, accion, datosAnteriores, datosNuevos, usuario) {
    logger.info('Cambio en datos críticos', {
      tabla,
      accion,
      datosAnteriores,
      datosNuevos,
      usuario: usuario?.usuario || null,
      usuarioId: usuario?.id || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtiene el logger de Winston para uso directo
   * @returns {Object} Logger de Winston
   */
  static obtenerLogger() {
    return logger;
  }

  /**
   * Cierra los transportes de logs gracefully
   * @returns {Promise} Promesa que se resuelve cuando se cierran los logs
   */
  static async cerrarLogs() {
    return new Promise((resolve) => {
      logger.end(resolve);
    });
  }
}

module.exports = MiddlewareLogs;