const axios = require("axios");

async function testInventario() {
  try {
    console.log("🔐 Haciendo login...");
    // Login
    const login = await axios.post("http://localhost:3001/api/auth/login", {
      usuario: "admin",
      password: "1234567",
    });

    const token = login.data.datos.token;
    console.log("✅ Login exitoso");

    // Obtener materiales y ubicaciones
    console.log("📋 Obteniendo materiales y ubicaciones...");
    const materiales = await axios.get(
      "http://localhost:3001/api/mantenedores/materiales",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const ubicaciones = await axios.get(
      "http://localhost:3001/api/mantenedores/ubicaciones",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Material ID disponible:", materiales.data.datos[0]?.id);
    console.log("Ubicacion ID disponible:", ubicaciones.data.datos[0]?.id);

    // Intentar crear inventario
    const inventarioData = {
      planta: "RANCAGUA",
      title: "TEST_DEBUG",
      nombre_material: "Material Debug",
      unidad_medida: "KG",
      fecha_inventario: new Date().toISOString(),
      stock: 100,
      bodega: "BODEGA_TEST",
      ubicacion: "UBC001",
      contado_por: "Usuario Test",
      material_id: materiales.data.datos[0]?.id,
      ubicacion_id: ubicaciones.data.datos[0]?.id,
    };

    console.log("📦 Datos enviados:");
    console.log(JSON.stringify(inventarioData, null, 2));

    const response = await axios.post(
      "http://localhost:3001/api/inventario",
      inventarioData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Respuesta exitosa:", response.data);

    // Verificar que se guardó correctamente
    const inventarioCreado = await axios.get(
      `http://localhost:3001/api/inventario/${response.data.datos.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("🔍 Inventario guardado en BD:");
    console.log(`- ID: ${inventarioCreado.data.datos.id}`);
    console.log(
      `- material_id: ${inventarioCreado.data.datos.material_completo?.id}`
    );
    console.log(
      `- ubicacion_id: ${inventarioCreado.data.datos.ubicacion_completa?.id}`
    );
  } catch (error) {
    console.error("❌ Error completo:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error(
        "   Detalles:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

testInventario();
