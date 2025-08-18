/**
 * Utilidad centralizada para respuestas HTTP consistentes
 * Evita duplicación de código y estandariza las respuestas
 */
class ManejadorRespuestas {
  /**
   * Respuesta exitosa estándar
   */
  static exito(res, datos, mensaje = "Operación exitosa", codigoEstado = 200) {
    return res.status(codigoEstado).json({
      exito: true,
      mensaje,
      datos,
      total: Array.isArray(datos) ? datos.length : undefined,
    });
  }

  /**
   * Respuesta de error estándar
   */
  static error(res, mensaje, codigo = "ERROR_GENERICO", codigoEstado = 500) {
    return res.status(codigoEstado).json({
      exito: false,
      mensaje,
      codigo,
    });
  }

  /**
   * Respuesta de validación fallida
   */
  static validacionFallida(
    res,
    errores,
    mensaje = "Datos de entrada inválidos"
  ) {
    return res.status(400).json({
      exito: false,
      mensaje,
      codigo: "VALIDACION_FALLIDA",
      errores,
    });
  }

  /**
   * Respuesta de recurso no encontrado
   */
  static noEncontrado(res, mensaje = "Recurso no encontrado") {
    return res.status(404).json({
      exito: false,
      mensaje,
      codigo: "RECURSO_NO_ENCONTRADO",
    });
  }

  /**
   * Respuesta de conflicto (recurso duplicado)
   */
  static conflicto(
    res,
    mensaje = "Conflicto con recurso existente",
    codigo = "CONFLICTO"
  ) {
    return res.status(409).json({
      exito: false,
      mensaje,
      codigo,
    });
  }

  /**
   * Respuesta de no autorizado
   */
  static noAutorizado(
    res,
    mensaje = "No autorizado",
    codigo = "NO_AUTORIZADO"
  ) {
    return res.status(401).json({
      exito: false,
      mensaje,
      codigo,
    });
  }

  /**
   * Respuesta de prohibido (sin permisos)
   */
  static prohibido(
    res,
    mensaje = "Acceso prohibido",
    codigo = "ACCESO_PROHIBIDO"
  ) {
    return res.status(403).json({
      exito: false,
      mensaje,
      codigo,
    });
  }

  /**
   * Respuesta de creado exitosamente
   */
  static creado(res, datos, mensaje = "Recurso creado exitosamente") {
    return this.exito(res, datos, mensaje, 201);
  }

  /**
   * Respuesta sin contenido
   */
  static sinContenido(res, mensaje = "Operación exitosa sin contenido") {
    return res.status(204).json({
      exito: true,
      mensaje,
    });
  }
}

module.exports = ManejadorRespuestas;
