/**
 * Utilidad centralizada para respuestas HTTP consistentes
 * Evita duplicación de código y estandariza las respuestas
 */
class ManejadorRespuestas {
  
  /**
   * Respuesta exitosa estándar
   */
  static exito(res, datos, mensaje = 'Operación exitosa', codigoEstado = 200) {
    return res.status(codigoEstado).json({
      exito: true,
      mensaje,
      datos,
      total: Array.isArray(datos) ? datos.length : undefined
    });
  }

  /**
   * Respuesta de error estándar
   */
  static error(res, mensaje, codigo = 'ERROR_GENERICO', codigoEstado = 500) {
    return res.status(codigoEstado).json({
      exito: false,
      mensaje,
      codigo
    });
  }

  /**
   * Respuesta de validación fallida
   */
  static validacionFallida(res, errores, mensaje = 'Datos de entrada inválidos') {
    return res.status(400).json({
      exito: false,
      mensaje,
      codigo: 'VALIDACION_FALLIDA',
      errores
    });
  }

  /**
   * Respuesta de recurso no encontrado
   */
  static noEncontrado(res, mensaje = 'Recurso no encontrado') {
    return res.status(404).json({
      exito: false,
      mensaje,
      codigo: 'RECURSO_NO_ENCONTRADO'
    });
  }
}

module.exports = ManejadorRespuestas;