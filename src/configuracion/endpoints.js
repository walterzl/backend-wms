// Endpoints del sistema WMS Ranco Cherries

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const ENDPOINTS = {
  // Base
  BASE: '/api',

  // Autenticación
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VALIDATE: '/api/auth/validate',
    CAMBIAR_PASSWORD: '/api/auth/cambiar-password'
  },

  // Usuarios
  USUARIOS: {
    BASE: '/api/usuarios',
    LISTAR: '/api/usuarios',
    OBTENER: '/api/usuarios/:id',
    CREAR: '/api/usuarios',
    ACTUALIZAR: '/api/usuarios/:id',
    ELIMINAR: '/api/usuarios/:id',
    PERFIL: '/api/usuarios/perfil'
  },

  // Mantenedores (APIs centralizadas)
  MANTENEDORES: {
    BASE: '/api/mantenedores',
    
    // Plantas
    PLANTAS: '/api/mantenedores/plantas',
    
    // Materiales
    MATERIALES: '/api/mantenedores/materiales',
    MATERIAL_POR_CODIGO: '/api/mantenedores/materiales/codigo/:codigo',
    
    // Proveedores  
    PROVEEDORES: '/api/mantenedores/proveedores',
    PROVEEDOR_POR_CODIGO: '/api/mantenedores/proveedores/codigo/:codigo',
    
    // Ubicaciones
    UBICACIONES: '/api/mantenedores/ubicaciones',
    UBICACIONES_POR_PLANTA: '/api/mantenedores/ubicaciones/planta/:planta',
    
    // Temporadas
    TEMPORADAS: '/api/mantenedores/temporadas',
    TEMPORADA_ACTIVA: '/api/mantenedores/temporadas/activa',
    
    // Tipos de Movimiento
    TIPOS_MOVIMIENTO: '/api/mantenedores/tipos-movimiento',
    
    // Unidades de Medida
    UNIDADES_MEDIDA: '/api/mantenedores/unidades-medida'
  },

  // Trazabilidad
  TRAZABILIDAD: {
    BASE: '/api/trazabilidad',
    LISTAR: '/api/trazabilidad',
    OBTENER: '/api/trazabilidad/:id',
    CREAR: '/api/trazabilidad',
    ACTUALIZAR: '/api/trazabilidad/:id',
    ELIMINAR: '/api/trazabilidad/:id',
    POR_FOLIO: '/api/trazabilidad/folio/:folio',
    POR_MATERIAL: '/api/trazabilidad/material/:materialId',
    POR_FECHA: '/api/trazabilidad/fecha/:fechaInicio/:fechaFin',
    REPORTE: '/api/trazabilidad/reporte'
  },

  // Inventario
  INVENTARIO: {
    BASE: '/api/inventario',
    
    // Inventario consolidado
    CONSOLIDADO: '/api/inventario/consolidado',
    
    // Por planta
    POR_PLANTA: '/api/inventario/planta/:planta',
    
    // Operaciones
    AJUSTAR: '/api/inventario/ajustar',
    TRANSFERIR: '/api/inventario/transferir',
    
    // Reportes
    REPORTE_STOCK: '/api/inventario/reporte/stock',
    REPORTE_MOVIMIENTOS: '/api/inventario/reporte/movimientos',
    
    // Por ubicación
    POR_UBICACION: '/api/inventario/ubicacion/:ubicacionId',
    
    // Por material
    POR_MATERIAL: '/api/inventario/material/:materialId'
  },

  // Reportes
  REPORTES: {
    BASE: '/api/reportes',
    TRAZABILIDAD: '/api/reportes/trazabilidad',
    INVENTARIO: '/api/reportes/inventario',
    MOVIMIENTOS: '/api/reportes/movimientos',
    STOCK_CRITICO: '/api/reportes/stock-critico',
    EXPORTAR_PDF: '/api/reportes/exportar/pdf',
    EXPORTAR_EXCEL: '/api/reportes/exportar/excel'
  },

  // Utilitarios
  UTILS: {
    BASE: '/api/utils',
    HEALTH: '/api/utils/health',
    VERSION: '/api/utils/version',
    GENERAR_CODIGO: '/api/utils/generar-codigo',
    VALIDAR_CODIGO_BARRAS: '/api/utils/validar-codigo-barras'
  },

  // Logs
  LOGS: {
    BASE: '/api/logs',
    LISTAR: '/api/logs',
    POR_USUARIO: '/api/logs/usuario/:usuarioId',
    POR_FECHA: '/api/logs/fecha/:fechaInicio/:fechaFin',
    POR_NIVEL: '/api/logs/nivel/:nivel'
  }
};

// Función helper para construir URLs completas
const construirUrl = (endpoint) => {
  return `${BASE_URL}${endpoint}`;
};

// Función helper para reemplazar parámetros en endpoints
const reemplazarParametros = (endpoint, parametros = {}) => {
  let url = endpoint;
  Object.keys(parametros).forEach(key => {
    url = url.replace(`:${key}`, parametros[key]);
  });
  return url;
};

module.exports = {
  ENDPOINTS,
  construirUrl,
  reemplazarParametros,
  BASE_URL
};