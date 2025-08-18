/**
 * Script para actualizar todas las contraseñas de usuarios
 * Cambia todas las contraseñas a "1234567"
 *
 * USO: node scripts/actualizar-passwords.js
 *
 * PRECAUCIÓN: Este script cambiará TODAS las contraseñas en la base de datos.
 * Úsalo solo en entornos de desarrollo o testing.
 */

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const configuracion = require("../src/configuracion/config");

const prisma = new PrismaClient();

// Nueva contraseña que se asignará a todos los usuarios
const NUEVA_PASSWORD = "1234567";

/**
 * Función principal del script
 */
async function actualizarPasswords() {
  try {
    console.log("🔐 Iniciando actualización de contraseñas...");
    console.log(`📋 Nueva contraseña: ${NUEVA_PASSWORD}`);
    console.log(
      "⚠️  ADVERTENCIA: Este script cambiará TODAS las contraseñas de usuarios"
    );

    // Confirmar ejecución en producción
    if (configuracion.servidor.entorno === "production") {
      console.log("❌ ERROR: Este script no debe ejecutarse en producción");
      console.log(
        '   Cambie el entorno a "development" o "testing" para continuar'
      );
      process.exit(1);
    }

    // Obtener todos los usuarios activos
    const usuarios = await prisma.usuarios.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre_usuario: true,
        nombre_completo: true,
        email: true,
        rol: true,
      },
    });

    console.log(`📊 Se encontraron ${usuarios.length} usuarios activos`);

    if (usuarios.length === 0) {
      console.log("ℹ️  No hay usuarios para actualizar");
      return;
    }

    // Generar hash de la nueva contraseña
    console.log("🔒 Generando hash de la nueva contraseña...");
    const saltRounds = configuracion.bcrypt.saltRounds;
    const passwordHash = await bcrypt.hash(NUEVA_PASSWORD, saltRounds);

    console.log(`🔢 Salt rounds utilizados: ${saltRounds}`);
    console.log("📝 Usuarios que serán actualizados:");

    usuarios.forEach((usuario, index) => {
      console.log(
        `   ${index + 1}. ${usuario.nombre_usuario} (${
          usuario.nombre_completo
        }) - ${usuario.rol}`
      );
    });

    // Pausa para confirmar
    console.log("\n⏳ Esperando 3 segundos antes de continuar...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Actualizar todas las contraseñas
    console.log("🚀 Actualizando contraseñas...");

    const resultado = await prisma.usuarios.updateMany({
      where: {
        activo: true,
      },
      data: {
        password_hash: passwordHash,
        fecha_actualizacion: new Date(),
      },
    });

    console.log(
      `✅ Se actualizaron ${resultado.count} contraseñas exitosamente`
    );

    // Cerrar todas las sesiones activas para forzar nuevo login
    console.log("🔄 Cerrando todas las sesiones activas...");

    const sesionesDesactivadas = await prisma.sesiones_usuario.updateMany({
      where: {
        activa: true,
      },
      data: {
        activa: false,
      },
    });

    console.log(
      `🚪 Se cerraron ${sesionesDesactivadas.count} sesiones activas`
    );

    // Crear logs del sistema para auditoría
    console.log("📋 Registrando logs de auditoría...");

    const logsData = usuarios.map((usuario) => ({
      usuario_id: usuario.id,
      accion: "password_reset_masivo",
      modulo: "admin_script",
      descripcion: `Contraseña actualizada masivamente por script administrativo`,
      datos_anteriores: null,
      datos_nuevos: { password_actualizada: true },
      ip_address: "127.0.0.1",
      fecha_creacion: new Date(),
    }));

    await prisma.logs_sistema.createMany({
      data: logsData,
    });

    console.log(`📝 Se registraron ${logsData.length} logs de auditoría`);

    // Resumen final
    console.log("\n🎉 ACTUALIZACIÓN COMPLETADA EXITOSAMENTE");
    console.log("═══════════════════════════════════════");
    console.log(`📊 Usuarios actualizados: ${resultado.count}`);
    console.log(`🚪 Sesiones cerradas: ${sesionesDesactivadas.count}`);
    console.log(`📝 Logs registrados: ${logsData.length}`);
    console.log(`🔐 Nueva contraseña: ${NUEVA_PASSWORD}`);
    console.log("\n⚠️  IMPORTANTE:");
    console.log("   • Todos los usuarios deberán usar la nueva contraseña");
    console.log("   • Se cerraron todas las sesiones activas");
    console.log("   • Se registraron logs de auditoría");
    console.log(
      "\n💡 Los usuarios pueden cambiar su contraseña usando el endpoint:"
    );
    console.log("   PUT /api/auth/cambiar-password");
  } catch (error) {
    console.error("❌ ERROR durante la actualización:", error);

    if (error.code === "P2002") {
      console.error("   Error de constraint único en la base de datos");
    } else if (error.code === "P2025") {
      console.error("   Registro no encontrado");
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
 * Función para verificar contraseña (testing)
 */
async function verificarPassword(usuario, password) {
  const usuarioDb = await prisma.usuarios.findFirst({
    where: {
      nombre_usuario: usuario,
    },
  });

  if (!usuarioDb) {
    console.log("❌ Usuario no encontrado");
    return false;
  }

  const esValida = await bcrypt.compare(password, usuarioDb.password_hash);
  console.log(
    `🔍 Contraseña para ${usuario}: ${esValida ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`
  );
  return esValida;
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log("📖 AYUDA - Script de Actualización de Contraseñas");
  console.log("═══════════════════════════════════════════════");
  console.log("");
  console.log("USO:");
  console.log(
    "  node scripts/actualizar-passwords.js           # Actualizar todas las contraseñas"
  );
  console.log(
    "  node scripts/actualizar-passwords.js --verify <usuario>  # Verificar contraseña de un usuario"
  );
  console.log(
    "  node scripts/actualizar-passwords.js --help    # Mostrar esta ayuda"
  );
  console.log("");
  console.log("DESCRIPCIÓN:");
  console.log(
    '  Este script actualiza todas las contraseñas de usuarios activos a "1234567"'
  );
  console.log(
    "  También cierra todas las sesiones activas y registra logs de auditoría"
  );
  console.log("");
  console.log("PRECAUCIONES:");
  console.log("  • No se ejecuta en entorno de producción");
  console.log("  • Afecta a TODOS los usuarios activos");
  console.log("  • Cierra todas las sesiones existentes");
  console.log("");
  process.exit(0);
}

if (args.includes("--verify")) {
  const usuarioIndex = args.indexOf("--verify") + 1;
  const usuario = args[usuarioIndex];

  if (!usuario) {
    console.log("❌ ERROR: Especifique el nombre de usuario a verificar");
    console.log(
      "   Ejemplo: node scripts/actualizar-passwords.js --verify admin"
    );
    process.exit(1);
  }

  console.log(`🔍 Verificando contraseña para usuario: ${usuario}`);
  verificarPassword(usuario, NUEVA_PASSWORD)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
} else {
  // Ejecutar actualización normal
  actualizarPasswords();
}
