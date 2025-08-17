const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Servicio de Utilidades - Funciones comunes del sistema
 * Centraliza funciones utilitarias para mantener coherencia
 */
class ServicioUtilidades {
  
  /**
   * Genera un ID único usando UUID v4
   * @returns {string} UUID v4
   */
  static generarId() {
    return uuidv4();
  }

  /**
   * Genera un código único con prefijo y timestamp
   * @param {string} prefijo - Prefijo para el código
   * @param {number} longitud - Longitud del código (por defecto 8)
   * @returns {string} Código único generado
   */
  static generarCodigo(prefijo = 'WMS', longitud = 8) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, longitud);
    return `${prefijo}-${timestamp.slice(-6)}-${random.toUpperCase()}`;
  }

  /**
   * Genera un folio para documentos
   * @param {string} tipoMovimiento - Tipo de movimiento
   * @param {string} planta - Código de planta
   * @returns {string} Folio generado
   */
  static generarFolio(tipoMovimiento, planta) {
    const fecha = moment().format('YYYYMMDD');
    const hora = moment().format('HHmmss');
    const prefijo = `${tipoMovimiento.substring(0, 3)}-${planta.substring(0, 3)}`;
    return `${prefijo}-${fecha}-${hora}`;
  }

  /**
   * Formatea una fecha según el formato especificado
   * @param {Date|string} fecha - Fecha a formatear
   * @param {string} formato - Formato deseado (por defecto 'YYYY-MM-DD HH:mm:ss')
   * @returns {string} Fecha formateada
   */
  static formatearFecha(fecha, formato = 'YYYY-MM-DD HH:mm:ss') {
    return moment(fecha).format(formato);
  }

  /**
   * Formatea una fecha para mostrar en la UI
   * @param {Date|string} fecha - Fecha a formatear
   * @returns {string} Fecha formateada para UI
   */
  static formatearFechaUI(fecha) {
    return moment(fecha).format('DD/MM/YYYY HH:mm');
  }

  /**
   * Formatea una fecha solo con día/mes/año
   * @param {Date|string} fecha - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  static formatearFechaCorta(fecha) {
    return moment(fecha).format('DD/MM/YYYY');
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {Date|string} fechaInicio - Fecha inicial
   * @param {Date|string} fechaFin - Fecha final
   * @returns {number} Diferencia en días
   */
  static calcularDiferenciaDias(fechaInicio, fechaFin) {
    return moment(fechaFin).diff(moment(fechaInicio), 'days');
  }

  /**
   * Valida si una fecha es válida
   * @param {string} fecha - Fecha a validar
   * @returns {boolean} True si es válida
   */
  static esFechaValida(fecha) {
    return moment(fecha).isValid();
  }

  /**
   * Formatea un número con separadores de miles
   * @param {number} numero - Número a formatear
   * @param {number} decimales - Cantidad de decimales (por defecto 2)
   * @returns {string} Número formateado
   */
  static formatearNumero(numero, decimales = 2) {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(numero);
  }

  /**
   * Formatea un número para mostrar stock
   * @param {number} cantidad - Cantidad de stock
   * @param {string} unidad - Unidad de medida
   * @returns {string} Stock formateado
   */
  static formatearStock(cantidad, unidad) {
    const cantidadFormateada = this.formatearNumero(cantidad);
    return `${cantidadFormateada} ${unidad}`;
  }

  /**
   * Calcula el stock después de un movimiento
   * @param {number} stockActual - Stock actual
   * @param {number} cantidadMovimiento - Cantidad del movimiento
   * @param {string} tipoMovimiento - Tipo de movimiento (entrada/salida)
   * @returns {number} Nuevo stock calculado
   */
  static calcularNuevoStock(stockActual, cantidadMovimiento, tipoMovimiento) {
    const stock = parseFloat(stockActual) || 0;
    const cantidad = parseFloat(cantidadMovimiento) || 0;

    switch (tipoMovimiento.toLowerCase()) {
      case 'recepcion':
      case 'entrada':
      case 'ajuste_positivo':
        return stock + cantidad;
      
      case 'despacho':
      case 'salida':
      case 'merma':
      case 'ajuste_negativo':
        return Math.max(0, stock - cantidad);
      
      default:
        return stock;
    }
  }

  /**
   * Valida si un RUT chileno es válido
   * @param {string} rut - RUT a validar (formato: 12345678-9)
   * @returns {boolean} True si es válido
   */
  static validarRut(rut) {
    if (!rut || typeof rut !== 'string') return false;
    
    const rutLimpio = rut.replace(/[.-]/g, '');
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toLowerCase();
    
    if (!/^\d+$/.test(cuerpo)) return false;
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();
    
    return dv === dvFinal;
  }

  /**
   * Formatea un RUT chileno
   * @param {string} rut - RUT sin formato
   * @returns {string} RUT formateado (12.345.678-9)
   */
  static formatearRut(rut) {
    if (!rut) return '';
    
    const rutLimpio = rut.replace(/[.-]/g, '');
    if (rutLimpio.length < 8) return rut;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoFormateado}-${dv}`;
  }

  /**
   * Capitaliza la primera letra de cada palabra
   * @param {string} texto - Texto a capitalizar
   * @returns {string} Texto capitalizado
   */
  static capitalizarTexto(texto) {
    if (!texto) return '';
    return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Limpia un texto removiendo caracteres especiales
   * @param {string} texto - Texto a limpiar
   * @returns {string} Texto limpio
   */
  static limpiarTexto(texto) {
    if (!texto) return '';
    return texto.replace(/[^\w\s-]/gi, '').trim();
  }

  /**
   * Genera un hash simple para verificación de integridad
   * @param {string} texto - Texto a hashear
   * @returns {string} Hash generado
   */
  static generarHashSimple(texto) {
    let hash = 0;
    if (texto.length === 0) return hash.toString();
    
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convierte a 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Valida si un email es válido
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Convierte bytes a formato legible
   * @param {number} bytes - Cantidad de bytes
   * @param {number} decimales - Decimales a mostrar
   * @returns {string} Tamaño formateado
   */
  static formatearTamaño(bytes, decimales = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimales < 0 ? 0 : decimales;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Pausa la ejecución por un tiempo determinado
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise} Promesa que se resuelve después del tiempo especificado
   */
  static async esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clona profundamente un objeto
   * @param {Object} obj - Objeto a clonar
   * @returns {Object} Objeto clonado
   */
  static clonarObjeto(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Verifica si un objeto está vacío
   * @param {Object} obj - Objeto a verificar
   * @returns {boolean} True si está vacío
   */
  static estaVacio(obj) {
    return Object.keys(obj).length === 0;
  }
}

module.exports = ServicioUtilidades;