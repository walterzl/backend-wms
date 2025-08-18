const axios = require("axios");

/**
 * Script para hacer login y obtener un token válido
 */

const obtenerTokenValido = async () => {
  console.log("🔐 OBTENIENDO TOKEN VÁLIDO\n");

  const baseURL = "http://localhost:3001";

  try {
    console.log("1️⃣ Realizando login...");
    const response = await axios.post(
      `${baseURL}/api/auth/login`,
      {
        usuario: "admin",
        password: "admin123", // Asumiendo esta contraseña, ajústala si es diferente
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.exito) {
      console.log("   ✅ Login exitoso");
      console.log("   🔑 Token obtenido:");
      console.log(`   ${response.data.datos.token}`);
      console.log("\n   📋 Información de usuario:");
      console.log(
        `   • Usuario: ${response.data.datos.usuario.nombre_usuario}`
      );
      console.log(`   • Rol: ${response.data.datos.usuario.rol}`);
      console.log(
        `   • Planta: ${response.data.datos.usuario.planta_asignada}`
      );
      console.log(
        `   • Expira: ${new Date(response.data.datos.expiracion).toLocaleString(
          "es-CL"
        )}`
      );

      // Probar el token con el endpoint de inventario
      console.log("\n2️⃣ Probando token con endpoint de inventario...");
      try {
        const inventarioResponse = await axios.get(
          `${baseURL}/api/inventario`,
          {
            headers: {
              Authorization: `Bearer ${response.data.datos.token}`,
            },
          }
        );

        console.log("   ✅ Endpoint de inventario funciona correctamente");
        console.log(
          `   📊 Registros de inventario: ${
            inventarioResponse.data.datos?.length || 0
          }`
        );
      } catch (inventarioError) {
        console.log("   ❌ Error probando endpoint de inventario:");
        console.log(`   Status: ${inventarioError.response?.status}`);
        console.log(`   Error: ${inventarioError.response?.data?.mensaje}`);
      }
    } else {
      console.log("   ❌ Login fallido:", response.data.mensaje);
    }
  } catch (error) {
    if (error.response) {
      console.log("   ❌ Error en login:");
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.mensaje || error.message}`);
    } else if (error.request) {
      console.log("   ❌ No se pudo conectar al servidor");
      console.log(
        "   Verifica que el servidor esté ejecutándose en http://localhost:3001"
      );
    } else {
      console.log("   ❌ Error:", error.message);
    }
  }
};

obtenerTokenValido().catch(console.error);
