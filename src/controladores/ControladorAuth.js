const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const middlewareAuth = require('../middleware/middlewareAuth');
const ServicioValidacion = require('../servicios/ServicioValidacion');
const configuracion = require('../configuracion/config');
const CONSTANTES = require('../configuracion/constantes');

const prisma = new PrismaClient();

/**
 * Controlador de Autenticación
 * Maneja el login, logout y validación de usuarios
 */
class ControladorAuth {

  /**
   * Iniciar sesión de usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async login(req, res) {
    try {
      // Validar datos de entrada
      const validacion = ServicioValidacion.validarLogin(req.body);
      if (!validacion.esValido) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
          exito: false,
          mensaje: 'Datos de login inválidos',
          errores: validacion.errores
        });
      }

      const { usuario, password } = validacion.datos;

      // Buscar usuario en la base de datos
      const usuarioDb = await prisma.usuarios.findFirst({
        where: {
          OR: [
            { usuario: usuario },
            { email: usuario }
          ]
        }
      });

      if (!usuarioDb) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Credenciales inválidas',
          codigo: 'CREDENCIALES_INVALIDAS'
        });
      }

      // Verificar que el usuario esté activo
      if (!usuarioDb.activo) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Usuario desactivado. Contacte al administrador.',
          codigo: 'USUARIO_DESACTIVADO'
        });
      }

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuarioDb.password_hash);
      if (!passwordValida) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Credenciales inválidas',
          codigo: 'CREDENCIALES_INVALIDAS'
        });
      }

      // Cerrar sesiones anteriores si exceden el límite
      await ControladorAuth.cerrarSesionesExcedentes(usuarioDb.id);

      // Generar token JWT
      const token = middlewareAuth.generarToken(usuarioDb);

      // Crear nueva sesión
      const fechaExpiracion = new Date();
      fechaExpiracion.setHours(fechaExpiracion.getHours() + CONSTANTES.SESION.DURACION_HORAS);

      const nuevaSesion = await prisma.sesionesUsuario.create({
        data: {
          usuario_id: usuarioDb.id,
          token_jwt: token,
          fecha_expiracion: fechaExpiracion,
          ip_cliente: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'] || 'Unknown',
          activa: true
        }
      });

      // Actualizar último acceso
      await prisma.usuarios.update({
        where: { id: usuarioDb.id },
        data: { ultimo_acceso: new Date() }
      });

      // Registrar log de inicio de sesión
      await prisma.logsSistema.create({
        data: {
          usuario_id: usuarioDb.id,
          nivel: CONSTANTES.NIVELES_LOG.INFO,
          mensaje: 'Inicio de sesión exitoso',
          modulo: 'auth',
          accion: 'login',
          ip_cliente: req.ip || req.connection.remoteAddress
        }
      });

      // Preparar respuesta (sin información sensible)
      const datosUsuario = {
        id: usuarioDb.id,
        usuario: usuarioDb.usuario,
        email: usuarioDb.email,
        nombreCompleto: usuarioDb.nombre_completo,
        rol: usuarioDb.rol,
        plantaAsignada: usuarioDb.planta_asignada,
        ultimoAcceso: usuarioDb.ultimo_acceso
      };

      res.json({
        exito: true,
        mensaje: 'Inicio de sesión exitoso',
        datos: {
          usuario: datosUsuario,
          token: token,
          expiracion: fechaExpiracion,
          sesionId: nuevaSesion.id
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        codigo: 'ERROR_INTERNO_LOGIN'
      });
    }
  }

  /**
   * Cerrar sesión del usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async logout(req, res) {
    try {
      const token = middlewareAuth.extraerToken(req);

      if (!token) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
          exito: false,
          mensaje: 'Token requerido para cerrar sesión',
          codigo: 'TOKEN_REQUERIDO'
        });
      }

      // Desactivar la sesión actual
      await prisma.sesionesUsuario.updateMany({
        where: {
          token_jwt: token,
          activa: true
        },
        data: {
          activa: false
        }
      });

      // Registrar log de cierre de sesión
      if (req.usuario) {
        await prisma.logsSistema.create({
          data: {
            usuario_id: req.usuario.id,
            nivel: CONSTANTES.NIVELES_LOG.INFO,
            mensaje: 'Cierre de sesión',
            modulo: 'auth',
            accion: 'logout',
            ip_cliente: req.ip || req.connection.remoteAddress
          }
        });
      }

      res.json({
        exito: true,
        mensaje: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error al cerrar sesión',
        codigo: 'ERROR_INTERNO_LOGOUT'
      });
    }
  }

  /**
   * Refrescar token de acceso
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async refresh(req, res) {
    try {
      const tokenActual = middlewareAuth.extraerToken(req);

      if (!tokenActual) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Token requerido para renovar',
          codigo: 'TOKEN_REQUERIDO'
        });
      }

      // Buscar sesión activa
      const sesion = await prisma.sesionesUsuario.findFirst({
        where: {
          token_jwt: tokenActual,
          activa: true
        },
        include: {
          usuario: true
        }
      });

      if (!sesion) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Sesión inválida',
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

      // Generar nuevo token
      const nuevoToken = middlewareAuth.generarToken(sesion.usuario);
      const nuevaExpiracion = new Date();
      nuevaExpiracion.setHours(nuevaExpiracion.getHours() + CONSTANTES.SESION.DURACION_HORAS);

      // Actualizar sesión
      await prisma.sesionesUsuario.update({
        where: { id: sesion.id },
        data: {
          token_jwt: nuevoToken,
          fecha_expiracion: nuevaExpiracion
        }
      });

      res.json({
        exito: true,
        mensaje: 'Token renovado exitosamente',
        datos: {
          token: nuevoToken,
          expiracion: nuevaExpiracion
        }
      });

    } catch (error) {
      console.error('Error en refresh:', error);
      res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error al renovar token',
        codigo: 'ERROR_INTERNO_REFRESH'
      });
    }
  }

  /**
   * Validar token actual
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async validate(req, res) {
    try {
      if (!req.usuario) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_AUTORIZADO).json({
          exito: false,
          mensaje: 'Token inválido',
          codigo: 'TOKEN_INVALIDO'
        });
      }

      res.json({
        exito: true,
        mensaje: 'Token válido',
        datos: {
          usuario: req.usuario
        }
      });

    } catch (error) {
      console.error('Error en validate:', error);
      res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error al validar token',
        codigo: 'ERROR_INTERNO_VALIDATE'
      });
    }
  }

  /**
   * Cambiar contraseña del usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async cambiarPassword(req, res) {
    try {
      const { passwordActual, passwordNueva } = req.body;

      if (!passwordActual || !passwordNueva) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
          exito: false,
          mensaje: 'Contraseña actual y nueva son requeridas'
        });
      }

      // Validar nueva contraseña
      const validacion = ServicioValidacion.validar(
        { password: passwordNueva },
        { password: ServicioValidacion.esquemaUsuario.crear.extract('password') }
      );

      if (!validacion.esValido) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
          exito: false,
          mensaje: 'Nueva contraseña no cumple con los requisitos',
          errores: validacion.errores
        });
      }

      // Obtener usuario actual
      const usuario = await prisma.usuarios.findUnique({
        where: { id: req.usuario.id }
      });

      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!passwordValida) {
        return res.status(CONSTANTES.CODIGOS_RESPUESTA.BAD_REQUEST).json({
          exito: false,
          mensaje: 'Contraseña actual incorrecta',
          codigo: 'PASSWORD_ACTUAL_INCORRECTA'
        });
      }

      // Hashear nueva contraseña
      const saltRounds = configuracion.bcrypt.saltRounds;
      const passwordHash = await bcrypt.hash(passwordNueva, saltRounds);

      // Actualizar contraseña
      await prisma.usuarios.update({
        where: { id: req.usuario.id },
        data: { password_hash: passwordHash }
      });

      // Registrar log
      await prisma.logsSistema.create({
        data: {
          usuario_id: req.usuario.id,
          nivel: CONSTANTES.NIVELES_LOG.INFO,
          mensaje: 'Contraseña cambiada',
          modulo: 'auth',
          accion: 'cambiar_password',
          ip_cliente: req.ip || req.connection.remoteAddress
        }
      });

      res.json({
        exito: true,
        mensaje: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(CONSTANTES.CODIGOS_RESPUESTA.ERROR_INTERNO).json({
        exito: false,
        mensaje: 'Error al cambiar contraseña',
        codigo: 'ERROR_INTERNO_CAMBIAR_PASSWORD'
      });
    }
  }

  /**
   * Cierra sesiones excedentes para mantener el límite máximo
   * @param {number} usuarioId - ID del usuario
   */
  static async cerrarSesionesExcedentes(usuarioId) {
    try {
      const sesionesActivas = await prisma.sesionesUsuario.findMany({
        where: {
          usuario_id: usuarioId,
          activa: true,
          fecha_expiracion: {
            gte: new Date()
          }
        },
        orderBy: {
          fecha_inicio: 'asc'
        }
      });

      if (sesionesActivas.length >= CONSTANTES.SESION.MAX_SESIONES_SIMULTANEAS) {
        const sesionesACerrar = sesionesActivas.slice(0, -CONSTANTES.SESION.MAX_SESIONES_SIMULTANEAS + 1);
        
        await prisma.sesionesUsuario.updateMany({
          where: {
            id: {
              in: sesionesACerrar.map(s => s.id)
            }
          },
          data: {
            activa: false
          }
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesiones excedentes:', error);
    }
  }
}

module.exports = ControladorAuth;