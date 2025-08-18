/**
 * Script para crear usuario administrador por defecto
 * Crea un usuario admin con contraseña "1234567"
 *
 * USO: node scripts/crear-usuario-admin.js
 */

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const configuracion = require("../src/configuracion/config");

const prisma = new PrismaClient();

// Datos del usuario administrador por defecto
const ADMIN_DATA = {
  nombre_usuario: "admin",
  nombre_completo: "Administrador del Sistema",
  email: "admin@rancocherries.com",
  password: "1234567",
  planta_asignada: "RANCAGUA",
  rol: "administrador",
};

/**
 * Función principal para crear usuario administrador
 */
async function crearUsuarioAdmin() {
  try {
    console.log("👤 Creando usuario administrador...");
    console.log(`📧 Email: ${ADMIN_DATA.email}`);
    console.log(`👨‍💼 Usuario: ${ADMIN_DATA.nombre_usuario}`);
    console.log(`🔐 Contraseña: ${ADMIN_DATA.password}`);

    // Verificar si ya existe un usuario con el mismo nombre o email
    const usuarioExistente = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { nombre_usuario: ADMIN_DATA.nombre_usuario },
          { email: ADMIN_DATA.email },
        ],
      },
    });

    if (usuarioExistente) {
      console.log("⚠️  Ya existe un usuario con el mismo nombre o email");
      console.log(`   ID: ${usuarioExistente.id}`);
      console.log(`   Usuario: ${usuarioExistente.nombre_usuario}`);
      console.log(`   Email: ${usuarioExistente.email}`);
      console.log(`   Activo: ${usuarioExistente.activo ? "Sí" : "No"}`);

      const respuesta = await preguntarConfirmacion(
        "¿Desea actualizar la contraseña del usuario existente? (s/n): "
      );

      if (respuesta.toLowerCase() === "s" || respuesta.toLowerCase() === "si") {
        // Actualizar contraseña del usuario existente
        const saltRounds = configuracion.bcrypt.saltRounds;
        const passwordHash = await bcrypt.hash(ADMIN_DATA.password, saltRounds);

        await prisma.usuarios.update({
          where: { id: usuarioExistente.id },
          data: {
            password_hash: passwordHash,
            activo: true,
            fecha_actualizacion: new Date(),
          },
        });

        console.log("✅ Contraseña actualizada exitosamente");
      } else {
        console.log("❌ Operación cancelada");
        return;
      }
    } else {
      // Crear nuevo usuario
      const saltRounds = configuracion.bcrypt.saltRounds;
      const passwordHash = await bcrypt.hash(ADMIN_DATA.password, saltRounds);

      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          nombre_usuario: ADMIN_DATA.nombre_usuario,
          nombre_completo: ADMIN_DATA.nombre_completo,
          email: ADMIN_DATA.email,
          password_hash: passwordHash,
          planta_asignada: ADMIN_DATA.planta_asignada,
          rol: ADMIN_DATA.rol,
          activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        },
      });

      console.log("✅ Usuario administrador creado exitosamente");
      console.log(`   ID: ${nuevoUsuario.id}`);
    }

    // Crear log de auditoría
    const usuario = await prisma.usuarios.findFirst({
      where: {
        nombre_usuario: ADMIN_DATA.nombre_usuario,
      },
    });

    await prisma.logs_sistema.create({
      data: {
        usuario_id: usuario.id,
        accion: "usuario_admin_creado",
        modulo: "admin_script",
        descripcion: "Usuario administrador creado/actualizado por script",
        datos_anteriores: null,
        datos_nuevos: {
          usuario: ADMIN_DATA.nombre_usuario,
          rol: ADMIN_DATA.rol,
          email: ADMIN_DATA.email,
        },
        ip_address: "127.0.0.1",
        fecha_creacion: new Date(),
      },
    });

    console.log("\n🎉 OPERACIÓN COMPLETADA");
    console.log("═══════════════════════");
    console.log("📝 Datos de acceso:");
    console.log(`   Usuario: ${ADMIN_DATA.nombre_usuario}`);
    console.log(`   Contraseña: ${ADMIN_DATA.password}`);
    console.log(`   Email: ${ADMIN_DATA.email}`);
    console.log(`   Rol: ${ADMIN_DATA.rol}`);
    console.log(`   Planta: ${ADMIN_DATA.planta_asignada}`);
    console.log("\n💡 Puede usar estos datos para hacer login en:");
    console.log("   POST /api/auth/login");
  } catch (error) {
    console.error("❌ ERROR durante la creación:", error);

    if (error.code === "P2002") {
      console.error("   Error: Ya existe un usuario con estos datos únicos");
    } else {
      console.error("   Error desconocido:", error.message);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Conexión a base de datos cerrada");
  }
}

/**
 * Función para preguntar confirmación al usuario
 */
function preguntarConfirmacion(pregunta) {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

/**
 * Función para listar todos los usuarios
 */
async function listarUsuarios() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre_usuario: true,
        nombre_completo: true,
        email: true,
        rol: true,
        planta_asignada: true,
        activo: true,
        ultimo_acceso: true,
        fecha_creacion: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    console.log(`📋 LISTA DE USUARIOS (${usuarios.length} total)`);
    console.log(
      "════════════════════════════════════════════════════════════════"
    );

    if (usuarios.length === 0) {
      console.log("   No hay usuarios registrados");
    } else {
      usuarios.forEach((usuario, index) => {
        console.log(
          `${index + 1}. ${usuario.nombre_usuario} (${usuario.nombre_completo})`
        );
        console.log(`   📧 Email: ${usuario.email}`);
        console.log(`   👨‍💼 Rol: ${usuario.rol}`);
        console.log(
          `   🏭 Planta: ${usuario.planta_asignada || "No asignada"}`
        );
        console.log(`   ✅ Activo: ${usuario.activo ? "Sí" : "No"}`);
        console.log(
          `   📅 Creado: ${
            usuario.fecha_creacion?.toLocaleString("es-CL") || "N/A"
          }`
        );
        console.log(
          `   🕒 Último acceso: ${
            usuario.ultimo_acceso?.toLocaleString("es-CL") || "Nunca"
          }`
        );
        console.log(
          "   ────────────────────────────────────────────────────────────"
        );
      });
    }
  } catch (error) {
    console.error("❌ Error al listar usuarios:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log("📖 AYUDA - Script de Creación de Usuario Administrador");
  console.log("══════════════════════════════════════════════════════");
  console.log("");
  console.log("USO:");
  console.log(
    "  node scripts/crear-usuario-admin.js           # Crear usuario administrador"
  );
  console.log(
    "  node scripts/crear-usuario-admin.js --list    # Listar todos los usuarios"
  );
  console.log(
    "  node scripts/crear-usuario-admin.js --help    # Mostrar esta ayuda"
  );
  console.log("");
  console.log("DESCRIPCIÓN:");
  console.log("  Crea un usuario administrador con credenciales por defecto");
  console.log(
    "  Si el usuario ya existe, pregunta si desea actualizar la contraseña"
  );
  console.log("");
  console.log("DATOS DEL USUARIO:");
  console.log(`  Usuario: ${ADMIN_DATA.nombre_usuario}`);
  console.log(`  Contraseña: ${ADMIN_DATA.password}`);
  console.log(`  Email: ${ADMIN_DATA.email}`);
  console.log(`  Rol: ${ADMIN_DATA.rol}`);
  console.log("");
  process.exit(0);
}

if (args.includes("--list")) {
  listarUsuarios();
} else {
  crearUsuarioAdmin();
}
