const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const configuracion = require('../configuracion/config');
const CONSTANTES = require('../configuracion/constantes');

const prisma = new PrismaClient();

/**
 * Middleware de autenticación JWT
 * Valida tokens JWT y gestiona sesiones de usuario
 */
class MiddlewareAuth {

  /**
   * Middleware principal de autenticación
   * @param {Request} req - Objeto de request de Express
   * @param {Response} res - Objeto de response de Express  
   * @param {Function} next - Función next de Express
   */
  static async autenticar(req, res, next) {
    try {
      // Extraer token del header Authorization
      const token = MiddlewareAuth.extraerToken(req);
      
      if (!token) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Token de acceso requerido',
          codigo: 'TOKEN_REQUERIDO'
        });
      }

      // Verificar y decodificar el token
      let payload;
      try {
        payload = jwt.verify(token, configuracion.jwt.secreto);
      } catch (errorJwt) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Token inválido o expirado',
          codigo: 'TOKEN_INVALIDO'
        });
      }

      // Verificar que la sesión exista y esté activa
      const sesion = await prisma.sesionesUsuario.findFirst({
        where: {
          token_jwt: token,
          activa: true,
          fecha_expiracion: {
            gte: new Date()
          }
        },
        include: {
          usuario: {
            select: {
              id: true,
              usuario: true,
              email: true,
              nombre_completo: true,
              rol: true,
              planta_asignada: true,
              activo: true
            }
          }
        }
      });

      if (!sesion) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Sesión inválida o expirada',
          codigo: 'SESION_INVALIDA'
        });
      }

      // Verificar que el usuario esté activo
      if (!sesion.usuario.activo) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Usuario desactivado',
          codigo: 'USUARIO_DESACTIVADO'
        });
      }

      // Agregar información del usuario al request
      req.usuario = {
        id: sesion.usuario.id,
        usuario: sesion.usuario.usuario,
        email: sesion.usuario.email,
        nombreCompleto: sesion.usuario.nombre_completo,
        rol: sesion.usuario.rol,
        plantaAsignada: sesion.usuario.planta_asignada,
        sesionId: sesion.id
      };

      // Actualizar último acceso del usuario
      await prisma.usuarios.update({
        where: { id: sesion.usuario.id },
        data: { ultimo_acceso: new Date() }
      });

      next();

    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error interno de autenticación',
        codigo: 'ERROR_INTERNO_AUTH'
      });
    }
  }

  /**
   * Middleware para validar roles específicos
   * @param {string|Array} rolesPermitidos - Rol o array de roles permitidos
   * @returns {Function} Middleware de autorización
   */
  static autorizarRoles(rolesPermitidos) {
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    return (req, res, next) => {
      if (!req.usuario) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Usuario no autenticado',
          codigo: 'USUARIO_NO_AUTENTICADO'
        });
      }

      if (!roles.includes(req.usuario.rol)) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.PROHIBIDO).json({
          exito: false,
          mensaje: 'No tiene permisos para realizar esta acción',
          codigo: 'PERMISOS_INSUFICIENTES'
        });
      }

      next();
    };
  }

  /**
   * Middleware para validar acceso a planta específica
   * @param {string} planta - Planta requerida (opcional, si no se especifica usa la asignada al usuario)
   * @returns {Function} Middleware de autorización de planta
   */
  static autorizarPlanta(planta = null) {
    return (req, res, next) => {
      if (!req.usuario) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Usuario no autenticado',
          codigo: 'USUARIO_NO_AUTENTICADO'
        });
      }

      // Los administradores tienen acceso a todas las plantas
      if (req.usuario.rol === CONSTANTES.ROLES.ADMINISTRADOR) {
        return next();
      }

      // Si se especifica una planta, validar acceso
      const plantaRequerida = planta || req.params.planta || req.body.planta;
      
      if (plantaRequerida && req.usuario.plantaAsignada !== plantaRequerida) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.PROHIBIDO).json({
          exito: false,
          mensaje: 'No tiene acceso a esta planta',
          codigo: 'ACCESO_PLANTA_DENEGADO'
        });
      }

      next();
    };
  }

  /**
   * Middleware opcional - no falla si no hay token
   * Usado para endpoints que pueden funcionar con o sin autenticación
   * @param {Request} req - Objeto de request de Express
   * @param {Response} res - Objeto de response de Express
   * @param {Function} next - Función next de Express
   */
  static async autenticacionOpcional(req, res, next) {
    try {
      const token = MiddlewareAuth.extraerToken(req);
      
      if (!token) {
        return next(); // Continuar sin autenticación
      }

      // Intentar autenticar, pero no fallar si hay error
      await MiddlewareAuth.autenticar(req, res, next);
    } catch (error) {
      // Ignorar errores de autenticación y continuar
      next();
    }
  }

  /**
   * Extrae el token JWT del header Authorization
   * @param {Request} req - Objeto de request de Express
   * @returns {string|null} Token JWT o null si no existe
   */
  static extraerToken(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Genera un token JWT para un usuario
   * @param {Object} usuario - Datos del usuario
   * @returns {string} Token JWT generado
   */
  static generarToken(usuario) {
    const payload = {
      id: usuario.id,
      usuario: usuario.usuario,
      email: usuario.email,
      rol: usuario.rol,
      plantaAsignada: usuario.planta_asignada,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, configuracion.jwt.secreto, {
      expiresIn: configuracion.jwt.tiempoExpiracion,
      issuer: configuracion.jwt.issuer,
      audience: configuracion.jwt.audience
    });
  }

  /**
   * Verifica si un token JWT es válido
   * @param {string} token - Token a verificar
   * @returns {Object|null} Payload del token o null si es inválido
   */
  static verificarToken(token) {
    try {
      return jwt.verify(token, configuracion.jwt.secreto);
    } catch (error) {
      return null;
    }
  }

  /**
   * Middleware para logging de requests autenticados
   * @param {Request} req - Objeto de request de Express
   * @param {Response} res - Objeto de response de Express
   * @param {Function} next - Función next de Express
   */
  static logearRequest(req, res, next) {
    if (req.usuario) {
      console.log(`[${new Date().toISOString()}] Usuario: ${req.usuario.usuario} - ${req.method} ${req.path}`);
    }
    next();
  }

  /**
   * Middleware para verificar si una sesión debe renovarse
   * Renueva automáticamente tokens que estén cerca de expirar
   * @param {Request} req - Objeto de request de Express
   * @param {Response} res - Objeto de response de Express
   * @param {Function} next - Función next de Express
   */
  static async renovarSesionSiEsNecesario(req, res, next) {
    if (!req.usuario) {
      return next();
    }

    try {
      const token = MiddlewareAuth.extraerToken(req);
      const decoded = jwt.decode(token);
      
      // Renovar si el token expira en menos de 1 hora
      const tiempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
      const unaHoraEnSegundos = 60 * 60;

      if (tiempoRestante < unaHoraEnSegundos) {
        const nuevoToken = MiddlewareAuth.generarToken(req.usuario);
        
        // Actualizar la sesión en la base de datos
        await prisma.sesionesUsuario.update({
          where: { id: req.usuario.sesionId },
          data: {
            token_jwt: nuevoToken,
            fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
          }
        });

        // Agregar el nuevo token al response header
        res.setHeader('X-New-Token', nuevoToken);
      }

      next();
    } catch (error) {
      console.error('Error al renovar sesión:', error);
      next(); // Continuar sin renovar
    }
  }
}

module.exports = MiddlewareAuth;