// Constantes del sistema WMS Ranco Cherries

const CONSTANTES = {
  // Roles de usuario
  ROLES: {
    ADMINISTRADOR: 'administrador',
    OPERADOR_RANCAGUA: 'operador_rancagua', 
    OPERADOR_CHIMBARONGO: 'operador_chimbarongo',
    SUPERVISOR: 'supervisor'
  },

  // Tipos de movimiento
  TIPOS_MOVIMIENTO: {
    RECEPCION: 'RECEPCION',
    DESPACHO: 'DESPACHO',
    TRANSFERENCIA: 'TRANSFERENCIA',
    AJUSTE_INVENTARIO: 'AJUSTE_INVENTARIO',
    MERMA: 'MERMA',
    DEVOLUCION: 'DEVOLUCION'
  },

  // Estados de movimiento
  ESTADOS_MOVIMIENTO: {
    PENDIENTE: 'pendiente',
    COMPLETADO: 'completado',
    CANCELADO: 'cancelado'
  },

  // Plantas
  PLANTAS: {
    RANCAGUA: 'RANCAGUA',
    CHIMBARONGO: 'CHIMBARONGO'
  },

  // Tipos de ubicación
  TIPOS_UBICACION: {
    BODEGA: 'bodega',
    CAMARA_FRIO: 'camara_frio',
    ZONA_DESPACHO: 'zona_despacho',
    ZONA_RECEPCION: 'zona_recepcion'
  },

  // Unidades de medida
  UNIDADES_MEDIDA: {
    KILOGRAMO: 'kg',
    GRAMO: 'g',
    LITRO: 'l',
    MILILITRO: 'ml',
    UNIDAD: 'un',
    CAJA: 'caja',
    BANDEJA: 'bdj'
  },

  // Niveles de log
  NIVELES_LOG: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Códigos de respuesta HTTP personalizados
  CODIGOS_RESPUESTA: {
    EXITO: 200,
    CREADO: 201,
    SIN_CONTENIDO: 204,
    BAD_REQUEST: 400,
    NO_AUTORIZADO: 401,
    PROHIBIDO: 403,
    NO_ENCONTRADO: 404,
    CONFLICTO: 409,
    ERROR_INTERNO: 500,
    SERVICIO_NO_DISPONIBLE: 503
  },

  // Mensajes de respuesta
  MENSAJES: {
    EXITO_OPERACION: 'Operación realizada exitosamente',
    ERROR_VALIDACION: 'Error de validación en los datos enviados',
    ERROR_AUTENTICACION: 'Credenciales inválidas',
    ERROR_AUTORIZACION: 'No tiene permisos para realizar esta acción',
    ERROR_NO_ENCONTRADO: 'Recurso no encontrado',
    ERROR_SERVIDOR: 'Error interno del servidor',
    SESION_EXPIRADA: 'La sesión ha expirado',
    USUARIO_BLOQUEADO: 'Usuario bloqueado por seguridad'
  },

  // Configuración de paginación
  PAGINACION: {
    LIMITE_DEFAULT: 50,
    LIMITE_MAXIMO: 1000,
    PAGINA_DEFAULT: 1
  },

  // Configuración de archivos
  ARCHIVOS: {
    TAMAÑO_MAXIMO_MB: 10,
    TIPOS_PERMITIDOS: ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'],
    DIRECTORIO_UPLOADS: 'uploads/'
  },

  // Configuración de reportes
  REPORTES: {
    FORMATOS: {
      PDF: 'pdf',
      EXCEL: 'xlsx',
      CSV: 'csv'
    },
    DIRECTORIO_TEMP: 'temp/reportes/'
  },

  // Validaciones de negocio
  VALIDACIONES: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_CODIGO_LENGTH: 50,
    MAX_NOMBRE_LENGTH: 255,
    MAX_OBSERVACIONES_LENGTH: 1000
  },

  // Configuración de sesiones
  SESION: {
    DURACION_HORAS: 24,
    MAX_SESIONES_SIMULTANEAS: 3,
    TIEMPO_INACTIVIDAD_MINUTOS: 30
  }
};

module.exports = CONSTANTES;