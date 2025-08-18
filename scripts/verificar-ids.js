const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verificarDatos() {
  console.log("🔍 VERIFICANDO CAMPOS _ID EN LAS TABLAS:");

  // Verificar inventario
  const inventarios = await prisma.inventario.findMany({
    orderBy: { fecha_creacion: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      material_id: true,
      ubicacion_id: true,
      fecha_creacion: true,
    },
  });
  console.log("\n📦 INVENTARIO:");
  inventarios.forEach((i) => {
    console.log(
      `- ID: ${i.id}, Material: ${i.title}, material_id: ${i.material_id}, ubicacion_id: ${i.ubicacion_id}`
    );
  });

  // Verificar tarjas
  const tarjas = await prisma.tarjas.findMany({
    orderBy: { fecha_creacion: "desc" },
    take: 3,
    select: {
      id: true,
      numero_tarja: true,
      material_id: true,
      proveedor_id: true,
      fecha_creacion: true,
    },
  });
  console.log("\n🏷️ TARJAS:");
  tarjas.forEach((t) => {
    console.log(
      `- ID: ${t.id}, Tarja: ${t.numero_tarja}, material_id: ${t.material_id}, proveedor_id: ${t.proveedor_id}`
    );
  });

  // Verificar recepciones
  const recepciones = await prisma.recepciones_lotes.findMany({
    orderBy: { fecha_creacion: "desc" },
    take: 3,
    select: {
      id: true,
      numero_recepcion: true,
      material_id: true,
      proveedor_id: true,
      ubicacion_destino_id: true,
      fecha_creacion: true,
    },
  });
  console.log("\n📥 RECEPCIONES:");
  recepciones.forEach((r) => {
    console.log(
      `- ID: ${r.id}, Recepción: ${r.numero_recepcion}, material_id: ${r.material_id}, proveedor_id: ${r.proveedor_id}, ubicacion_destino_id: ${r.ubicacion_destino_id}`
    );
  });

  // Verificar trazabilidad
  const trazabilidad = await prisma.trazabilidad_materiales_r9.findMany({
    orderBy: { fecha_creacion: "desc" },
    take: 3,
    select: {
      id: true,
      id_movimiento: true,
      material_id: true,
      proveedor_id: true,
      ubicacion_origen_id: true,
      ubicacion_destino_id: true,
      temporada_id: true,
      tipo_movimiento_id: true,
    },
  });
  console.log("\n📋 TRAZABILIDAD:");
  trazabilidad.forEach((t) => {
    console.log(`- ID: ${t.id}, Movimiento: ${t.id_movimiento}`);
    console.log(
      `  material_id: ${t.material_id}, proveedor_id: ${t.proveedor_id}`
    );
    console.log(
      `  ubicacion_origen_id: ${t.ubicacion_origen_id}, ubicacion_destino_id: ${t.ubicacion_destino_id}`
    );
    console.log(
      `  temporada_id: ${t.temporada_id}, tipo_movimiento_id: ${t.tipo_movimiento_id}`
    );
  });

  // Verificar operaciones frio
  const operaciones = await prisma.operaciones_frio_despacho.findMany({
    orderBy: { fecha_creacion: "desc" },
    take: 3,
    select: {
      id: true,
      numero_operacion: true,
      material_id: true,
      ubicacion_origen_id: true,
      ubicacion_destino_id: true,
      usuario_id: true,
    },
  });
  console.log("\n🧊 OPERACIONES FRÍO:");
  operaciones.forEach((o) => {
    console.log(
      `- ID: ${o.id}, Operación: ${o.numero_operacion}, material_id: ${o.material_id}, ubicacion_origen_id: ${o.ubicacion_origen_id}, ubicacion_destino_id: ${o.ubicacion_destino_id}, usuario_id: ${o.usuario_id}`
    );
  });

  await prisma.$disconnect();
}

verificarDatos().catch(console.error);
