const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const CONSTANTES = require("../configuracion/constantes");
const ManejadorRespuestas = require("../utilidades/ManejadorRespuestas");
const ServicioValidacion = require("../servicios/ServicioValidacion");
const configuracion = require("../configuracion/config");

const prisma = new PrismaClient();

/**
 * Controlador de Usuarios
 * Maneja todas las operaciones CRUD relacionadas con usuarios
 */
class ControladorUsuarios {
  /**
   * Obtiene todos los usuarios con filtros opcionales
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerUsuarios(req, res) {
    try {
      const { activo = true, rol, planta, pagina = 1, limite = 50 } = req.query;

      // Construir filtros
      const filtros = {};

      if (activo !== undefined) {
        filtros.activo = activo === "true" || activo === true;
      }

      if (rol) {
        filtros.rol = rol;
      }

      if (planta) {
        filtros.planta_asignada = {
          equals: planta,
          mode: "insensitive",
        };
      }

      // Calcular offset para paginación
      const offset = (parseInt(pagina) - 1) * parseInt(limite);

      const [usuarios, total] = await Promise.all([
        prisma.usuarios.findMany({
          where: filtros,
          select: {
            id: true,
            nombre_usuario: true,
            nombre_completo: true,
            email: true,
            planta_asignada: true,
            rol: true,
            activo: true,
            ultimo_acceso: true,
            fecha_creacion: true,
            fecha_actualizacion: true,
          },
          orderBy: [{ activo: "desc" }, { nombre_completo: "asc" }],
          skip: offset,
          take: parseInt(limite),
        }),
        prisma.usuarios.count({ where: filtros }),
      ]);

      return ManejadorRespuestas.exito(
        res,
        {
          usuarios,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / parseInt(limite)),
            total_registros: total,
            registros_por_pagina: parseInt(limite),
          },
        },
        "Usuarios obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener usuarios",
        "ERROR_OBTENER_USUARIOS"
      );
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerUsuarioPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuarios.findUnique({
        where: {
          id: parseInt(id),
        },
        select: {
          id: true,
          nombre_usuario: true,
          nombre_completo: true,
          email: true,
          planta_asignada: true,
          rol: true,
          activo: true,
          ultimo_acceso: true,
          fecha_creacion: true,
          fecha_actualizacion: true,
        },
      });

      if (!usuario) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Usuario con ID ${id} no encontrado`
        );
      }

      return ManejadorRespuestas.exito(
        res,
        usuario,
        "Usuario obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener usuario",
        "ERROR_OBTENER_USUARIO"
      );
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async crearUsuario(req, res) {
    try {
      // Validar datos de entrada
      const validacion = ServicioValidacion.validarUsuarioCrear(req.body);
      if (!validacion.esValido) {
        return ManejadorRespuestas.validacionFallida(
          res,
          validacion.errores.map((e) => e.mensaje),
          "Datos de usuario inválidos"
        );
      }

      const {
        usuario,
        email,
        password,
        nombre_completo,
        rol,
        planta_asignada,
      } = validacion.datos;

      // Verificar que no exista otro usuario con el mismo nombre o email
      const usuarioExistente = await prisma.usuarios.findFirst({
        where: {
          OR: [{ nombre_usuario: usuario }, { email: email }],
        },
      });

      if (usuarioExistente) {
        let mensaje = "Ya existe un usuario";
        if (usuarioExistente.nombre_usuario === usuario) {
          mensaje += ` con el nombre "${usuario}"`;
        } else if (usuarioExistente.email === email) {
          mensaje += ` con el email "${email}"`;
        }

        return ManejadorRespuestas.conflicto(res, mensaje, "USUARIO_DUPLICADO");
      }

      // Hashear contraseña
      const saltRounds = configuracion.bcrypt.saltRounds;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          nombre_usuario: usuario,
          nombre_completo,
          email,
          password_hash: passwordHash,
          rol,
          planta_asignada: planta_asignada || null,
          activo: true,
        },
        select: {
          id: true,
          nombre_usuario: true,
          nombre_completo: true,
          email: true,
          planta_asignada: true,
          rol: true,
          activo: true,
          fecha_creacion: true,
        },
      });

      // Registrar log de creación
      await prisma.logs_sistema.create({
        data: {
          usuario_id: req.usuario.id,
          accion: "crear_usuario",
          modulo: "usuarios",
          descripcion: `Usuario "${usuario}" creado`,
          datos_nuevos: {
            usuario_creado: usuario,
            email: email,
            rol: rol,
          },
          ip_address: req.ip || req.connection.remoteAddress,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        nuevoUsuario,
        "Usuario creado exitosamente",
        CONSTANTES.CODIGOS_RESPUESTA.CREADO
      );
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al crear usuario",
        "ERROR_CREAR_USUARIO"
      );
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const validacion = ServicioValidacion.validarUsuarioActualizar(req.body);
      if (!validacion.esValido) {
        return ManejadorRespuestas.validacionFallida(
          res,
          validacion.errores.map((e) => e.mensaje),
          "Datos de actualización inválidos"
        );
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id: parseInt(id) },
      });

      if (!usuarioExistente) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Usuario con ID ${id} no encontrado`
        );
      }

      const datosActualizacion = { ...validacion.datos };

      // Si se está actualizando email, verificar que no esté en uso
      if (
        datosActualizacion.email &&
        datosActualizacion.email !== usuarioExistente.email
      ) {
        const emailEnUso = await prisma.usuarios.findFirst({
          where: {
            email: datosActualizacion.email,
            id: { not: parseInt(id) },
          },
        });

        if (emailEnUso) {
          return ManejadorRespuestas.conflicto(
            res,
            `El email "${datosActualizacion.email}" ya está en uso`,
            "EMAIL_DUPLICADO"
          );
        }
      }

      // Actualizar fecha de modificación
      datosActualizacion.fecha_actualizacion = new Date();

      // Actualizar usuario
      const usuarioActualizado = await prisma.usuarios.update({
        where: { id: parseInt(id) },
        data: datosActualizacion,
        select: {
          id: true,
          nombre_usuario: true,
          nombre_completo: true,
          email: true,
          planta_asignada: true,
          rol: true,
          activo: true,
          ultimo_acceso: true,
          fecha_creacion: true,
          fecha_actualizacion: true,
        },
      });

      // Registrar log de actualización
      await prisma.logs_sistema.create({
        data: {
          usuario_id: req.usuario.id,
          accion: "actualizar_usuario",
          modulo: "usuarios",
          descripcion: `Usuario "${usuarioExistente.nombre_usuario}" actualizado`,
          datos_anteriores: {
            email: usuarioExistente.email,
            nombre_completo: usuarioExistente.nombre_completo,
            rol: usuarioExistente.rol,
            planta_asignada: usuarioExistente.planta_asignada,
            activo: usuarioExistente.activo,
          },
          datos_nuevos: datosActualizacion,
          ip_address: req.ip || req.connection.remoteAddress,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        usuarioActualizado,
        "Usuario actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al actualizar usuario",
        "ERROR_ACTUALIZAR_USUARIO"
      );
    }
  }

  /**
   * Desactiva/activa un usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async cambiarEstadoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== "boolean") {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["El estado activo debe ser true o false"],
          "Datos inválidos"
        );
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id: parseInt(id) },
      });

      if (!usuarioExistente) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Usuario con ID ${id} no encontrado`
        );
      }

      // No permitir desactivar el propio usuario
      if (req.usuario.id === parseInt(id) && !activo) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["No puedes desactivar tu propia cuenta"],
          "Operación no permitida"
        );
      }

      // Actualizar estado
      const usuarioActualizado = await prisma.usuarios.update({
        where: { id: parseInt(id) },
        data: {
          activo,
          fecha_actualizacion: new Date(),
        },
        select: {
          id: true,
          nombre_usuario: true,
          nombre_completo: true,
          email: true,
          activo: true,
          fecha_actualizacion: true,
        },
      });

      // Si se desactiva el usuario, cerrar sus sesiones activas
      if (!activo) {
        await prisma.sesiones_usuario.updateMany({
          where: {
            usuario_id: parseInt(id),
            activa: true,
          },
          data: {
            activa: false,
          },
        });
      }

      // Registrar log
      await prisma.logs_sistema.create({
        data: {
          usuario_id: req.usuario.id,
          accion: activo ? "activar_usuario" : "desactivar_usuario",
          modulo: "usuarios",
          descripcion: `Usuario "${usuarioExistente.nombre_usuario}" ${
            activo ? "activado" : "desactivado"
          }`,
          datos_anteriores: { activo: usuarioExistente.activo },
          datos_nuevos: { activo },
          ip_address: req.ip || req.connection.remoteAddress,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        usuarioActualizado,
        `Usuario ${activo ? "activado" : "desactivado"} exitosamente`
      );
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al cambiar estado del usuario",
        "ERROR_CAMBIAR_ESTADO_USUARIO"
      );
    }
  }

  /**
   * Resetea la contraseña de un usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async resetearPassword(req, res) {
    try {
      const { id } = req.params;
      const { nueva_password } = req.body;

      if (!nueva_password) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Nueva contraseña requerida"],
          "Datos inválidos"
        );
      }

      // Validar nueva contraseña
      const validacion = ServicioValidacion.validar(
        { password: nueva_password },
        {
          password: ServicioValidacion.esquemaUsuario.crear.extract("password"),
        }
      );

      if (!validacion.esValido) {
        return ManejadorRespuestas.validacionFallida(
          res,
          validacion.errores.map((e) => e.mensaje),
          "Nueva contraseña no cumple con los requisitos"
        );
      }

      // Verificar que el usuario existe
      const usuario = await prisma.usuarios.findUnique({
        where: { id: parseInt(id) },
      });

      if (!usuario) {
        return ManejadorRespuestas.noEncontrado(
          res,
          `Usuario con ID ${id} no encontrado`
        );
      }

      // Hashear nueva contraseña
      const saltRounds = configuracion.bcrypt.saltRounds;
      const passwordHash = await bcrypt.hash(nueva_password, saltRounds);

      // Actualizar contraseña
      await prisma.usuarios.update({
        where: { id: parseInt(id) },
        data: {
          password_hash: passwordHash,
          fecha_actualizacion: new Date(),
        },
      });

      // Cerrar todas las sesiones activas del usuario
      await prisma.sesiones_usuario.updateMany({
        where: {
          usuario_id: parseInt(id),
          activa: true,
        },
        data: {
          activa: false,
        },
      });

      // Registrar log
      await prisma.logs_sistema.create({
        data: {
          usuario_id: req.usuario.id,
          accion: "resetear_password",
          modulo: "usuarios",
          descripcion: `Contraseña reseteada para usuario "${usuario.nombre_usuario}"`,
          ip_address: req.ip || req.connection.remoteAddress,
        },
      });

      return ManejadorRespuestas.exito(
        res,
        null,
        "Contraseña reseteada exitosamente"
      );
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al resetear contraseña",
        "ERROR_RESETEAR_PASSWORD"
      );
    }
  }

  /**
   * Obtiene las sesiones activas de un usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async obtenerSesionesUsuario(req, res) {
    try {
      const { id } = req.params;

      const sesiones = await prisma.sesiones_usuario.findMany({
        where: {
          usuario_id: parseInt(id),
          activa: true,
          fecha_expiracion: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          planta_seleccionada: true,
          fecha_inicio: true,
          fecha_expiracion: true,
          ip_address: true,
          user_agent: true,
        },
        orderBy: {
          fecha_inicio: "desc",
        },
      });

      return ManejadorRespuestas.exito(
        res,
        sesiones,
        "Sesiones activas obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener sesiones del usuario:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al obtener sesiones del usuario",
        "ERROR_OBTENER_SESIONES_USUARIO"
      );
    }
  }

  /**
   * Busca usuarios por término
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   */
  static async buscarUsuarios(req, res) {
    try {
      const { termino } = req.query;
      const { limite = 20 } = req.query;

      if (!termino || termino.trim().length < 2) {
        return ManejadorRespuestas.validacionFallida(
          res,
          ["Término de búsqueda debe tener al menos 2 caracteres"],
          "Datos de entrada inválidos"
        );
      }

      const terminoBusqueda = termino.trim();

      const usuarios = await prisma.usuarios.findMany({
        where: {
          AND: [
            { activo: true },
            {
              OR: [
                {
                  nombre_usuario: {
                    contains: terminoBusqueda,
                    mode: "insensitive",
                  },
                },
                {
                  nombre_completo: {
                    contains: terminoBusqueda,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: terminoBusqueda,
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          nombre_usuario: true,
          nombre_completo: true,
          email: true,
          rol: true,
          planta_asignada: true,
        },
        orderBy: {
          nombre_completo: "asc",
        },
        take: parseInt(limite),
      });

      return ManejadorRespuestas.exito(
        res,
        usuarios,
        `Se encontraron ${usuarios.length} usuarios`
      );
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      return ManejadorRespuestas.error(
        res,
        "Error al buscar usuarios",
        "ERROR_BUSCAR_USUARIOS"
      );
    }
  }
}

module.exports = ControladorUsuarios;
