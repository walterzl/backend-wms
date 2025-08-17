const Joi = require('joi');
const CONSTANTES = require('../configuracion/constantes');

/**
 * Servicio de Validación - Centraliza todas las validaciones del sistema
 * Utiliza Joi para validaciones estructuradas y consistentes
 */
class ServicioValidacion {

  /**
   * Esquemas de validación para usuarios
   */
  static get esquemaUsuario() {
    return {
      crear: Joi.object({
        usuario: Joi.string()
          .alphanum()
          .min(3)
          .max(50)
          .required()
          .messages({
            'string.alphanum': 'El usuario solo puede contener letras y números',
            'string.min': 'El usuario debe tener al menos 3 caracteres',
            'string.max': 'El usuario no puede exceder 50 caracteres',
            'any.required': 'El usuario es requerido'
          }),

        email: Joi.string()
          .email()
          .max(255)
          .required()
          .messages({
            'string.email': 'Debe proporcionar un email válido',
            'string.max': 'El email no puede exceder 255 caracteres',
            'any.required': 'El email es requerido'
          }),

        password: Joi.string()
          .min(CONSTANTES.VALIDACIONES.MIN_PASSWORD_LENGTH)
          .max(CONSTANTES.VALIDACIONES.MAX_PASSWORD_LENGTH)
          .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
          .required()
          .messages({
            'string.min': `La contraseña debe tener al menos ${CONSTANTES.VALIDACIONES.MIN_PASSWORD_LENGTH} caracteres`,
            'string.max': `La contraseña no puede exceder ${CONSTANTES.VALIDACIONES.MAX_PASSWORD_LENGTH} caracteres`,
            'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
            'any.required': 'La contraseña es requerida'
          }),

        nombre_completo: Joi.string()
          .min(2)
          .max(255)
          .required()
          .messages({
            'string.min': 'El nombre completo debe tener al menos 2 caracteres',
            'string.max': 'El nombre completo no puede exceder 255 caracteres',
            'any.required': 'El nombre completo es requerido'
          }),

        rol: Joi.string()
          .valid(...Object.values(CONSTANTES.ROLES))
          .required()
          .messages({
            'any.only': 'Debe seleccionar un rol válido',
            'any.required': 'El rol es requerido'
          }),

        planta_asignada: Joi.string()
          .valid(...Object.values(CONSTANTES.PLANTAS))
          .allow(null, '')
          .messages({
            'any.only': 'Debe seleccionar una planta válida'
          })
      }),

      actualizar: Joi.object({
        email: Joi.string().email().max(255),
        nombre_completo: Joi.string().min(2).max(255),
        rol: Joi.string().valid(...Object.values(CONSTANTES.ROLES)),
        planta_asignada: Joi.string().valid(...Object.values(CONSTANTES.PLANTAS)).allow(null, ''),
        activo: Joi.boolean()
      }).min(1)
    };
  }

  /**
   * Esquemas de validación para materiales
   */
  static get esquemaMaterial() {
    return {
      crear: Joi.object({
        codigo: Joi.string()
          .max(CONSTANTES.VALIDACIONES.MAX_CODIGO_LENGTH)
          .required()
          .messages({
            'string.max': `El código no puede exceder ${CONSTANTES.VALIDACIONES.MAX_CODIGO_LENGTH} caracteres`,
            'any.required': 'El código es requerido'
          }),

        nombre: Joi.string()
          .max(CONSTANTES.VALIDACIONES.MAX_NOMBRE_LENGTH)
          .required()
          .messages({
            'string.max': `El nombre no puede exceder ${CONSTANTES.VALIDACIONES.MAX_NOMBRE_LENGTH} caracteres`,
            'any.required': 'El nombre es requerido'
          }),

        unidad_medida: Joi.string()
          .valid(...Object.values(CONSTANTES.UNIDADES_MEDIDA))
          .required()
          .messages({
            'any.only': 'Debe seleccionar una unidad de medida válida',
            'any.required': 'La unidad de medida es requerida'
          }),

        requiere_frio: Joi.boolean().default(false)
      }),

      actualizar: Joi.object({
        nombre: Joi.string().max(CONSTANTES.VALIDACIONES.MAX_NOMBRE_LENGTH),
        unidad_medida: Joi.string().valid(...Object.values(CONSTANTES.UNIDADES_MEDIDA)),
        requiere_frio: Joi.boolean(),
        activo: Joi.boolean()
      }).min(1)
    };
  }

  /**
   * Esquemas de validación para trazabilidad
   */
  static get esquemaTrazabilidad() {
    return {
      crear: Joi.object({
        folio_documento: Joi.string()
          .max(100)
          .required()
          .messages({
            'string.max': 'El folio no puede exceder 100 caracteres',
            'any.required': 'El folio del documento es requerido'
          }),

        fecha_movimiento: Joi.date()
          .max('now')
          .required()
          .messages({
            'date.max': 'La fecha de movimiento no puede ser futura',
            'any.required': 'La fecha de movimiento es requerida'
          }),

        material_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.integer': 'El ID del material debe ser un número entero',
            'number.positive': 'El ID del material debe ser positivo',
            'any.required': 'El material es requerido'
          }),

        proveedor_id: Joi.number()
          .integer()
          .positive()
          .allow(null)
          .messages({
            'number.integer': 'El ID del proveedor debe ser un número entero',
            'number.positive': 'El ID del proveedor debe ser positivo'
          }),

        ubicacion_origen_id: Joi.number()
          .integer()
          .positive()
          .allow(null)
          .messages({
            'number.integer': 'El ID de ubicación origen debe ser un número entero',
            'number.positive': 'El ID de ubicación origen debe ser positivo'
          }),

        ubicacion_destino_id: Joi.number()
          .integer()
          .positive()
          .allow(null)
          .messages({
            'number.integer': 'El ID de ubicación destino debe ser un número entero',
            'number.positive': 'El ID de ubicación destino debe ser positivo'
          }),

        temporada_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.integer': 'El ID de temporada debe ser un número entero',
            'number.positive': 'El ID de temporada debe ser positivo',
            'any.required': 'La temporada es requerida'
          }),

        tipo_movimiento_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.integer': 'El ID del tipo de movimiento debe ser un número entero',
            'number.positive': 'El ID del tipo de movimiento debe ser positivo',
            'any.required': 'El tipo de movimiento es requerido'
          }),

        cantidad: Joi.number()
          .precision(2)
          .positive()
          .required()
          .messages({
            'number.positive': 'La cantidad debe ser positiva',
            'any.required': 'La cantidad es requerida'
          }),

        unidad_medida: Joi.string()
          .valid(...Object.values(CONSTANTES.UNIDADES_MEDIDA))
          .required()
          .messages({
            'any.only': 'Debe seleccionar una unidad de medida válida',
            'any.required': 'La unidad de medida es requerida'
          }),

        lote: Joi.string()
          .max(100)
          .allow(null, '')
          .messages({
            'string.max': 'El lote no puede exceder 100 caracteres'
          }),

        observaciones: Joi.string()
          .max(CONSTANTES.VALIDACIONES.MAX_OBSERVACIONES_LENGTH)
          .allow(null, '')
          .messages({
            'string.max': `Las observaciones no pueden exceder ${CONSTANTES.VALIDACIONES.MAX_OBSERVACIONES_LENGTH} caracteres`
          }),

        usuario_registro: Joi.string()
          .max(100)
          .required()
          .messages({
            'string.max': 'El usuario de registro no puede exceder 100 caracteres',
            'any.required': 'El usuario de registro es requerido'
          })
      })
    };
  }

  /**
   * Esquemas de validación para login
   */
  static get esquemaLogin() {
    return Joi.object({
      usuario: Joi.string()
        .required()
        .messages({
          'any.required': 'El usuario es requerido'
        }),

      password: Joi.string()
        .required()
        .messages({
          'any.required': 'La contraseña es requerida'
        })
    });
  }

  /**
   * Esquemas de validación para paginación
   */
  static get esquemaPaginacion() {
    return Joi.object({
      pagina: Joi.number()
        .integer()
        .min(1)
        .default(CONSTANTES.PAGINACION.PAGINA_DEFAULT)
        .messages({
          'number.integer': 'La página debe ser un número entero',
          'number.min': 'La página debe ser mayor a 0'
        }),

      limite: Joi.number()
        .integer()
        .min(1)
        .max(CONSTANTES.PAGINACION.LIMITE_MAXIMO)
        .default(CONSTANTES.PAGINACION.LIMITE_DEFAULT)
        .messages({
          'number.integer': 'El límite debe ser un número entero',
          'number.min': 'El límite debe ser mayor a 0',
          'number.max': `El límite no puede exceder ${CONSTANTES.PAGINACION.LIMITE_MAXIMO}`
        }),

      ordenar_por: Joi.string()
        .optional(),

      orden: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
          'any.only': 'El orden debe ser "asc" o "desc"'
        })
    });
  }

  /**
   * Valida datos usando un esquema específico
   * @param {Object} datos - Datos a validar
   * @param {Object} esquema - Esquema de validación Joi
   * @returns {Object} Resultado de la validación
   */
  static validar(datos, esquema) {
    const { error, value } = esquema.validate(datos, {
      abortEarly: false, // Retorna todos los errores
      allowUnknown: false, // No permite campos desconocidos
      stripUnknown: true // Remueve campos desconocidos
    });

    if (error) {
      return {
        esValido: false,
        errores: error.details.map(detalle => ({
          campo: detalle.path.join('.'),
          mensaje: detalle.message
        })),
        datos: null
      };
    }

    return {
      esValido: true,
      errores: null,
      datos: value
    };
  }

  /**
   * Valida datos de usuario para creación
   * @param {Object} datosUsuario - Datos del usuario
   * @returns {Object} Resultado de la validación
   */
  static validarUsuarioCrear(datosUsuario) {
    return this.validar(datosUsuario, this.esquemaUsuario.crear);
  }

  /**
   * Valida datos de usuario para actualización
   * @param {Object} datosUsuario - Datos del usuario
   * @returns {Object} Resultado de la validación
   */
  static validarUsuarioActualizar(datosUsuario) {
    return this.validar(datosUsuario, this.esquemaUsuario.actualizar);
  }

  /**
   * Valida datos de material para creación
   * @param {Object} datosMaterial - Datos del material
   * @returns {Object} Resultado de la validación
   */
  static validarMaterialCrear(datosMaterial) {
    return this.validar(datosMaterial, this.esquemaMaterial.crear);
  }

  /**
   * Valida datos de trazabilidad
   * @param {Object} datosTrazabilidad - Datos de trazabilidad
   * @returns {Object} Resultado de la validación
   */
  static validarTrazabilidad(datosTrazabilidad) {
    return this.validar(datosTrazabilidad, this.esquemaTrazabilidad.crear);
  }

  /**
   * Valida credenciales de login
   * @param {Object} credenciales - Credenciales de login
   * @returns {Object} Resultado de la validación
   */
  static validarLogin(credenciales) {
    return this.validar(credenciales, this.esquemaLogin);
  }

  /**
   * Valida parámetros de paginación
   * @param {Object} parametros - Parámetros de paginación
   * @returns {Object} Resultado de la validación
   */
  static validarPaginacion(parametros) {
    return this.validar(parametros, this.esquemaPaginacion);
  }

  /**
   * Valida que una fecha no sea futura
   * @param {Date|string} fecha - Fecha a validar
   * @returns {boolean} True si la fecha no es futura
   */
  static validarFechaNoFutura(fecha) {
    const fechaValidacion = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
    return fechaValidacion <= hoy;
  }

  /**
   * Valida que un stock sea suficiente para un movimiento
   * @param {number} stockActual - Stock actual
   * @param {number} cantidadMovimiento - Cantidad del movimiento
   * @param {string} tipoMovimiento - Tipo de movimiento
   * @returns {Object} Resultado de la validación
   */
  static validarStockSuficiente(stockActual, cantidadMovimiento, tipoMovimiento) {
    const stock = parseFloat(stockActual) || 0;
    const cantidad = parseFloat(cantidadMovimiento) || 0;

    // Solo validar para movimientos de salida
    const movimientosSalida = ['despacho', 'salida', 'merma', 'ajuste_negativo'];
    const esSalida = movimientosSalida.includes(tipoMovimiento.toLowerCase());

    if (esSalida && stock < cantidad) {
      return {
        esValido: false,
        mensaje: `Stock insuficiente. Stock actual: ${stock}, cantidad requerida: ${cantidad}`
      };
    }

    return {
      esValido: true,
      mensaje: null
    };
  }

  /**
   * Valida que un código de barras tenga el formato correcto
   * @param {string} codigoBarras - Código de barras a validar
   * @returns {boolean} True si el formato es válido
   */
  static validarCodigoBarras(codigoBarras) {
    if (!codigoBarras || typeof codigoBarras !== 'string') {
      return false;
    }

    // Remover espacios en blanco
    const codigo = codigoBarras.trim();

    // Validar longitud (códigos comunes: EAN-13, EAN-8, Code-128, etc.)
    if (codigo.length < 8 || codigo.length > 128) {
      return false;
    }

    // Validar que contenga solo caracteres permitidos para códigos de barras
    const caracteresPermitidos = /^[0-9A-Za-z\-\._\s]+$/;
    return caracteresPermitidos.test(codigo);
  }
}

module.exports = ServicioValidacion;