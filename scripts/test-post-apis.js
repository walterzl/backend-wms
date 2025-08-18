const axios = require("axios");

// Configuración
const BASE_URL = "http://localhost:3001/api";
const TEST_USER = {
  usuario: "admin",
  password: "1234567",
};

let authToken = "";

console.log("🚀 Iniciando pruebas de APIs POST...\n");

// Función para hacer login
async function login() {
  try {
    console.log("🔐 Iniciando sesión...");
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);

    if (response.data.exito) {
      authToken = response.data.datos.token;
      console.log("✅ Login exitoso");
      return true;
    } else {
      console.error("❌ Error en login:", response.data.mensaje);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Error en login:",
      error.response?.data?.mensaje || error.message
    );
    return false;
  }
}

// Función helper para requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    };
    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (error) {
    return error.response?.data || { exito: false, mensaje: error.message };
  }
}

// Función principal
async function main() {
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("❌ No se pudo hacer login. Terminando pruebas.");
    return;
  }

  try {
    // 0. Obtener datos existentes para relaciones FK
    console.log("\n🔍 Obteniendo datos existentes para relaciones FK...");
    const materiales = await makeRequest("GET", "/mantenedores/materiales");
    const proveedores = await makeRequest("GET", "/mantenedores/proveedores");
    const ubicaciones = await makeRequest("GET", "/mantenedores/ubicaciones");
    const temporadas = await makeRequest("GET", "/mantenedores/temporadas");
    const tiposMovimiento = await makeRequest(
      "GET",
      "/mantenedores/tipos-movimiento"
    );

    console.log(
      `✅ Encontrados: ${materiales.datos?.length || 0} materiales, ${
        proveedores.datos?.length || 0
      } proveedores, ${ubicaciones.datos?.length || 0} ubicaciones, ${
        temporadas.datos?.length || 0
      } temporadas, ${tiposMovimiento.datos?.length || 0} tipos de movimiento`
    );

    // 1. Test Inventario API (CON RELACIONES FK)
    console.log("\n📦 Probando API de Inventario...");
    const inventarioData = {
      planta: "RANCAGUA",
      title: "TEST001",
      nombre_material: "Material de Prueba",
      unidad_medida: "KG",
      fecha_inventario: new Date().toISOString(),
      stock: 100,
      bodega: "BODEGA_TEST",
      ubicacion: "UBC001",
      contado_por: "Usuario Test",
      // ⭐ AGREGAMOS LAS RELACIONES FK
      material_id: materiales.datos?.length > 0 ? materiales.datos[0].id : null,
      ubicacion_id:
        ubicaciones.datos?.length > 0 ? ubicaciones.datos[0].id : null,
    };

    const inventarioResult = await makeRequest(
      "POST",
      "/inventario",
      inventarioData
    );
    if (inventarioResult.exito) {
      console.log(
        "✅ Inventario creado:",
        inventarioResult.datos.codigo_material
      );
    } else {
      console.log("❌ Error creando inventario:", inventarioResult.mensaje);
    }

    // 2. Test Mantenedores - Material
    console.log("\n📋 Probando API de Materiales...");
    const materialData = {
      codigo_ranco: `MAT-${Date.now()}`,
      nombre_material: "Material de Prueba Script",
      clasificacion: "MATERIA_PRIMA",
      unidad_medida: "KG",
      frio: "No",
    };

    const materialResult = await makeRequest(
      "POST",
      "/mantenedores/materiales",
      materialData
    );
    if (materialResult.exito) {
      console.log("✅ Material creado:", materialResult.datos.codigo);
    } else {
      console.log("❌ Error creando material:", materialResult.mensaje);
    }

    // 3. Test Mantenedores - Proveedor
    console.log("\n🏢 Probando API de Proveedores...");
    const proveedorData = {
      title: `Proveedor de Prueba Script ${Date.now()}`,
      ingreso_proveedores_100: 150.5,
      total_general: 1500.75,
    };

    const proveedorResult = await makeRequest(
      "POST",
      "/mantenedores/proveedores",
      proveedorData
    );
    if (proveedorResult.exito) {
      console.log("✅ Proveedor creado:", proveedorResult.datos.title);
    } else {
      console.log("❌ Error creando proveedor:", proveedorResult.mensaje);
    }

    // 4. Test Mantenedores - Ubicación
    console.log("\n📍 Probando API de Ubicaciones...");
    const ubicacionData = {
      title: `UBC-${Date.now()}`,
      bodega_deposito: "BODEGA_PRUEBA",
      planta: "RANCAGUA",
    };

    const ubicacionResult = await makeRequest(
      "POST",
      "/mantenedores/ubicaciones",
      ubicacionData
    );
    if (ubicacionResult.exito) {
      console.log("✅ Ubicación creada:", ubicacionResult.datos.codigo);
    } else {
      console.log("❌ Error creando ubicación:", ubicacionResult.mensaje);
    }

    // 5. Test Temporadas
    console.log("\n📅 Probando API de Temporadas...");
    const temporadaData = {
      title: `Temporada Prueba ${new Date().getFullYear()}`,
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activo: false,
    };

    const temporadaResult = await makeRequest(
      "POST",
      "/mantenedores/temporadas",
      temporadaData
    );
    if (temporadaResult.exito) {
      console.log("✅ Temporada creada:", temporadaResult.datos.title);
    } else {
      console.log("❌ Error creando temporada:", temporadaResult.mensaje);
    }

    // 6. Test Tipos de Movimiento
    console.log("\n🔄 Probando API de Tipos de Movimiento...");
    const tipoMovData = {
      title: `TIPO_PRUEBA_${Date.now()}`,
      descripcion: "Tipo de movimiento creado por script de prueba",
    };

    const tipoResult = await makeRequest(
      "POST",
      "/mantenedores/tipos-movimiento",
      tipoMovData
    );
    if (tipoResult.exito) {
      console.log("✅ Tipo de movimiento creado:", tipoResult.datos.codigo);
    } else {
      console.log("❌ Error creando tipo de movimiento:", tipoResult.mensaje);
    }

    // 7. Test Tarjas (CON RELACIONES FK)
    console.log("\n🏷️ Probando API de Tarjas...");
    const tarjaData = {
      planta: "RANCAGUA",
      fecha_generacion: new Date().toISOString().split("T")[0],
      tipo_tarja: "BODEGA", // Cambiar a BODEGA para probar proveedor_id también
      descripcion: "Tarja de prueba desde script",
      codigo_material: "TEST001",
      nombre_material: "Material de Prueba Para Tarja",
      cantidad: 100.0,
      lote: `LOTE-TARJA-${Date.now()}`,
      // ⭐ TODAS LAS RELACIONES FK
      material_id: materiales.datos?.length > 0 ? materiales.datos[0].id : null,
      proveedor_id:
        proveedores.datos?.length > 0 ? proveedores.datos[0].id : null,
      nombre_proveedor:
        proveedores.datos?.length > 0 ? proveedores.datos[0].title : null,
    };

    const tarjaResult = await makeRequest("POST", "/tarjas", tarjaData);
    if (tarjaResult.exito) {
      console.log("✅ Tarja creada:", tarjaResult.datos.numero_tarja);

      // Test marcar como impresa
      const imprimirResult = await makeRequest(
        "PUT",
        `/tarjas/${tarjaResult.datos.id}/imprimir`
      );
      if (imprimirResult.exito) {
        console.log("✅ Tarja marcada como impresa");
      } else {
        console.log(
          "❌ Error marcando tarja como impresa:",
          imprimirResult.mensaje
        );
      }
    } else {
      console.log("❌ Error creando tarja:", tarjaResult.mensaje);
    }

    // 8. Test Recepciones Lotes (con datos existentes)
    console.log("\n📥 Probando API de Recepciones Lotes...");

    if (
      materiales.exito &&
      proveedores.exito &&
      ubicaciones.exito &&
      materiales.datos.length > 0 &&
      proveedores.datos.length > 0 &&
      ubicaciones.datos.length > 0
    ) {
      const recepcionData = {
        planta: "RANCAGUA",
        fecha_recepcion: new Date().toISOString().split("T")[0],
        // ⭐ RELACIONES FK CORRECTAS
        proveedor_id: proveedores.datos[0].id,
        nombre_proveedor: proveedores.datos[0].title || "Proveedor Test",
        guia_sii: `GUIA-${Date.now()}`,
        material_id: materiales.datos[0].id,
        codigo_material: materiales.datos[0].codigo_ranco || "TEST001",
        nombre_material: materiales.datos[0].nombre_material || "Material Test",
        unidad_medida: "KG",
        clasificacion: "MATERIA_PRIMA",
        lote: `LOTE-${Date.now()}`,
        cantidad: 500,
        pallets: 10,
        ubicacion_destino_id: ubicaciones.datos[0].id,
        bodega_destino: ubicaciones.datos[0].bodega_deposito || "BODEGA_01",
        ubicacion_destino: ubicaciones.datos[0].title || "UBC_01",
        observaciones: "Recepción de prueba desde script",
      };
      const recepcionResult = await makeRequest(
        "POST",
        "/recepciones-lotes",
        recepcionData
      );
      if (recepcionResult.exito) {
        console.log(
          "✅ Recepción de lote creada:",
          recepcionResult.datos.numero_recepcion
        );
      } else {
        console.log("❌ Error creando recepción:", recepcionResult.mensaje);
      }
    } else {
      console.log("❌ No hay datos suficientes para crear recepción de lote");
    }

    // 9. Test Trazabilidad Manual
    console.log("\n📋 Probando API de Trazabilidad Manual...");

    if (
      materiales.exito &&
      ubicaciones.exito &&
      materiales.datos.length > 0 &&
      ubicaciones.datos.length > 0
    ) {
      const trazabilidadData = {
        planta: "RANCAGUA",
        fecha: new Date().toISOString().split("T")[0],
        tipo_movimiento: "RECEPCION",
        // ⭐ TODAS LAS RELACIONES FK CORRECTAS
        material_id: materiales.datos[0].id,
        codigo_material: materiales.datos[0].codigo_ranco || "TEST001",
        nombre_material: materiales.datos[0].nombre_material || "Material Test",
        cantidad: 25,
        lote: `LOTE-TRAZ-${Date.now()}`,
        ubicacion_destino_id: ubicaciones.datos[0].id,
        temporada_id:
          temporadas.datos?.length > 0 ? temporadas.datos[0].id : null,
        tipo_movimiento_id:
          tiposMovimiento.datos?.length > 0
            ? tiposMovimiento.datos[0].id
            : null,
        turno: "TARDE",
        observacion: "Movimiento manual de prueba desde script",
      };
      const trazabilidadResult = await makeRequest(
        "POST",
        "/trazabilidad",
        trazabilidadData
      );
      if (trazabilidadResult.exito) {
        console.log(
          "✅ Movimiento de trazabilidad creado:",
          trazabilidadResult.datos.id_movimiento
        );
      } else {
        console.log(
          "❌ Error creando movimiento de trazabilidad:",
          trazabilidadResult.mensaje
        );
        console.log(
          "❌ Detalles del error:",
          JSON.stringify(trazabilidadResult, null, 2)
        );
      }
    } else {
      console.log(
        "❌ No hay datos suficientes para crear movimiento de trazabilidad"
      );
    }

    // 10. Test Operaciones Frío/Despacho (con stock previo creado)
    console.log("\n🧊 Probando API de Operaciones Frío/Despacho...");

    if (
      materiales.exito &&
      ubicaciones.exito &&
      materiales.datos.length > 0 &&
      ubicaciones.datos.length > 0
    ) {
      // Primero crear stock usando trazabilidad manual para poder hacer la operación
      const loteParaFrio = `LOTE-FRIO-${Date.now()}`;
      const stockInicialData = {
        planta: "RANCAGUA",
        fecha: new Date().toISOString().split("T")[0],
        tipo_movimiento: "RECEPCION",
        // ⭐ TODAS LAS RELACIONES FK CORRECTAS
        material_id: materiales.datos[0].id,
        codigo_material: materiales.datos[0].codigo_ranco || "TEST001",
        nombre_material:
          materiales.datos[0].nombre_material || "Material Test Frío",
        cantidad: 100,
        lote: loteParaFrio,
        ubicacion_destino_id: ubicaciones.datos[0].id,
        temporada_id:
          temporadas.datos?.length > 0 ? temporadas.datos[0].id : null,
        tipo_movimiento_id:
          tiposMovimiento.datos?.length > 0
            ? tiposMovimiento.datos[0].id
            : null,
        turno: "MAÑANA",
        observacion: "Stock inicial para prueba de operación frío",
      };
      const stockResult = await makeRequest(
        "POST",
        "/trazabilidad",
        stockInicialData
      );

      if (stockResult.exito) {
        console.log("✅ Stock inicial creado para operación frío");

        // Ahora probar la operación frío/despacho con el mismo lote
        const operacionData = {
          planta: "RANCAGUA",
          fecha_operacion: new Date().toISOString().split("T")[0],
          tipo_operacion: "consumo",
          turno: "MAÑANA",
          // ⭐ RELACIONES FK CORRECTAS
          material_id: materiales.datos[0].id,
          codigo_material: materiales.datos[0].codigo_ranco || "TEST001",
          nombre_material:
            materiales.datos[0].nombre_material || "Material Test Frío",
          unidad_medida: "KG",
          clasificacion: "MATERIA_PRIMA",
          lote: loteParaFrio, // Usar el mismo lote del stock creado
          cantidad: 25, // Consumir menos de lo que tenemos en stock
          ubicacion_origen_id: ubicaciones.datos[0].id,
          bodega_origen: ubicaciones.datos[0].bodega_deposito || "BODEGA_01",
          ubicacion_origen: ubicaciones.datos[0].title || "UBC_01",
          ubicacion_destino_id:
            ubicaciones.datos.length > 1
              ? ubicaciones.datos[1].id
              : ubicaciones.datos[0].id,
          bodega_destino:
            ubicaciones.datos.length > 1
              ? ubicaciones.datos[1].bodega_deposito || "BODEGA_02"
              : ubicaciones.datos[0].bodega_deposito || "BODEGA_01",
          ubicacion_destino:
            ubicaciones.datos.length > 1
              ? ubicaciones.datos[1].title || "UBC_02"
              : ubicaciones.datos[0].title || "UBC_01",
          observaciones: "Operación de prueba desde script con stock previo",
        };
        const operacionResult = await makeRequest(
          "POST",
          "/operaciones-frio-despacho",
          operacionData
        );
        if (operacionResult.exito) {
          console.log(
            "✅ Operación frío/despacho creada:",
            operacionResult.datos.numero_operacion
          );
        } else {
          console.log("❌ Error creando operación:", operacionResult.mensaje);
          console.log(
            "❌ Detalles del error:",
            JSON.stringify(operacionResult, null, 2)
          );
        }
      } else {
        console.log("❌ Error creando stock inicial para operación frío");
      }
    } else {
      console.log("❌ No hay datos suficientes para crear operación");
    }

    console.log("\n🎉 ¡Todas las pruebas de APIs POST completadas!");
  } catch (error) {
    console.error("\n❌ Error durante las pruebas:", error.message);
  }
}

// Ejecutar
main().catch(console.error);
