-- =====================================================
-- DATOS INICIALES - SISTEMA WMS RANCO CHERRIES
-- Descripción: Datos de configuración inicial del sistema
-- =====================================================

-- =====================================================
-- 1. TEMPORADAS
-- =====================================================
INSERT INTO temporadas_app (title, fecha_inicio, fecha_fin, activo) VALUES
('R8 2023-2024', '2023-10-01', '2024-09-30', false),
('R9 2024-2025', '2024-10-01', '2025-09-30', true),
('R10 2025-2026', '2025-10-01', '2026-09-30', false);

-- =====================================================
-- 2. TIPOS DE MOVIMIENTOS
-- =====================================================
INSERT INTO tipo_movimientos_app (title, descripcion, activo) VALUES
('Recepción', 'Ingreso de materiales desde proveedores', true),
('Despacho', 'Salida de materiales hacia destino final', true),
('Recepción Interna', 'Movimiento interno entre ubicaciones', true),
('Ingreso Proveedor', 'Ingreso directo desde proveedor', true),
('Consumo', 'Consumo de materiales en proceso', true),
('Ajuste Inventario', 'Ajuste por diferencias de inventario', true),
('Transferencia', 'Transferencia entre plantas', true),
('Devolución', 'Devolución de materiales', true);

-- =====================================================
-- 3. UBICACIONES Y BODEGAS
-- =====================================================

-- Ubicaciones Rancagua
INSERT INTO ubicacion (title, bodega_deposito, planta, activo) VALUES
('Altillo Packing', 'Bodega Principal', 'Rancagua', true),
('Carpa 1', 'Bodega Exterior', 'Rancagua', true),
('Carpa 2', 'Bodega Exterior', 'Rancagua', true),
('Carpa 3', 'Bodega Exterior', 'Rancagua', true),
('Bodega Frio', 'Cámara Fría', 'Rancagua', true),
('Patio Carga', 'Área Externa', 'Rancagua', true),
('Oficina Recepción', 'Área Administrativa', 'Rancagua', true),
('Zona Despacho', 'Área Despacho', 'Rancagua', true);

-- Ubicaciones Chimbarongo
INSERT INTO ubicacion (title, bodega_deposito, planta, activo) VALUES
('Centro Armado', 'Bodega Principal', 'Chimbarongo', true),
('Bodega A', 'Almacén General', 'Chimbarongo', true),
('Bodega B', 'Almacén General', 'Chimbarongo', true),
('Área Clasificación', 'Zona Proceso', 'Chimbarongo', true),
('Patio Exterior', 'Área Externa', 'Chimbarongo', true),
('Oficina Central', 'Área Administrativa', 'Chimbarongo', true);

-- =====================================================
-- 4. PROVEEDORES EJEMPLO
-- =====================================================
INSERT INTO proveedores (title, ingreso_proveedores_100, total_general, activo) VALUES
('PROVEEDOR GENÉRICO', 0.00, 0.00, true),
('EMBALAJES RANCO', 0.00, 0.00, true),
('SUMINISTROS INDUSTRIALES', 0.00, 0.00, true),
('MATERIALES PACKAGING', 0.00, 0.00, true),
('LOGÍSTICA INTEGRAL', 0.00, 0.00, true);

-- =====================================================
-- 5. MATERIALES EJEMPLO
-- =====================================================
INSERT INTO materiales (codigo_ranco, nombre_material, clasificacion, unidad_medida, frio, cod_nombre, activo) VALUES
('BOGR2062', 'BOLSA CE 2,5KG VF FLEX REGINA GENERICA', 'Normal', 'Unidad', 'Si', 'BOGR2062 - BOLSA CE 2,5KG VF FLEX REGINA GENERICA', true),
('ETIQ001', 'ETIQUETA TRAZABILIDAD LOTE', 'Normal', 'Unidad', 'No', 'ETIQ001 - ETIQUETA TRAZABILIDAD LOTE', true),
('CAJA500', 'CAJA CARTON 500GR CEREZAS', 'Normal', 'Unidad', 'Si', 'CAJA500 - CAJA CARTON 500GR CEREZAS', true),
('PALL001', 'PALLET MADERA EXPORTACION', 'Normal', 'Unidad', 'No', 'PALL001 - PALLET MADERA EXPORTACION', true),
('FILM001', 'FILM PLASTICO PROTECTOR', 'Normal', 'Rollo', 'No', 'FILM001 - FILM PLASTICO PROTECTOR', true),
('KIT001', 'KIT EMBALAJE COMPLETO', 'Kit', 'Kit', 'Si', 'KIT001 - KIT EMBALAJE COMPLETO', true),
('TAPE001', 'CINTA ADHESIVA REFORZADA', 'Normal', 'Rollo', 'No', 'TAPE001 - CINTA ADHESIVA REFORZADA', true),
('LABEL001', 'ETIQUETA CODIGO BARRAS', 'Normal', 'Unidad', 'No', 'LABEL001 - ETIQUETA CODIGO BARRAS', true);

-- =====================================================
-- 6. USUARIO ADMINISTRADOR INICIAL
-- =====================================================
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO usuarios (nombre_usuario, nombre_completo, email, password_hash, planta_asignada, rol, activo) VALUES
('admin', 'Administrador Sistema', 'admin@rancocheries.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Ambas', 'admin', true),
('operador_rancagua', 'Operador Rancagua', 'operador.rancagua@rancocheries.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Rancagua', 'operador', true),
('operador_chimbarongo', 'Operador Chimbarongo', 'operador.chimbarongo@rancocheries.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Chimbarongo', 'operador', true);

-- =====================================================
-- 7. DATOS DE PRUEBA - INVENTARIO INICIAL
-- =====================================================

-- Inventario Rancagua
-- Inventario Unificado
INSERT INTO inventario (planta, title, nombre_material, unidad_medida, cod_nombre, fecha_inventario, pallets, stock, bodega, ubicacion, lote, condicion_armado, contado_por, material_id, ubicacion_id) VALUES
-- Rancagua
('Rancagua', 'BOGR2062', 'BOLSA CE 2,5KG VF FLEX REGINA GENERICA', 'Unidad', 'BOGR2062 - BOLSA CE 2,5KG VF FLEX REGINA GENERICA', CURRENT_DATE, 2, 1000, 'Bodega Principal', 'Altillo Packing', 'LOTE001', 'Normal', 'Sistema', 1, 1),
('Rancagua', 'CAJA500', 'CAJA CARTON 500GR CEREZAS', 'Unidad', 'CAJA500 - CAJA CARTON 500GR CEREZAS', CURRENT_DATE, 5, 2500, 'Bodega Exterior', 'Carpa 1', 'LOTE002', 'Normal', 'Sistema', 3, 2),
('Rancagua', 'PALL001', 'PALLET MADERA EXPORTACION', 'Unidad', 'PALL001 - PALLET MADERA EXPORTACION', CURRENT_DATE, 0, 50, 'Área Externa', 'Patio Carga', 'LOTE003', 'Normal', 'Sistema', 4, 6),
-- Chimbarongo
('Chimbarongo', 'ETIQ001', 'ETIQUETA TRAZABILIDAD LOTE', 'Unidad', 'ETIQ001 - ETIQUETA TRAZABILIDAD LOTE', CURRENT_DATE, 1, 5000, 'Bodega Principal', 'Centro Armado', 'LOTE004', 'Normal', 'Sistema', 2, 9),
('Chimbarongo', 'FILM001', 'FILM PLASTICO PROTECTOR', 'Rollo', 'FILM001 - FILM PLASTICO PROTECTOR', CURRENT_DATE, 1, 20, 'Almacén General', 'Bodega A', 'LOTE005', 'Normal', 'Sistema', 5, 10),
('Chimbarongo', 'KIT001', 'KIT EMBALAJE COMPLETO', 'Kit', 'KIT001 - KIT EMBALAJE COMPLETO', CURRENT_DATE, 3, 100, 'Zona Proceso', 'Área Clasificación', 'LOTE006', 'Armado', 'Sistema', 6, 12);

-- =====================================================
-- 8. CONFIGURACIÓN INICIAL DEL SISTEMA
-- =====================================================

-- Crear vista para consultas frecuentes de inventario consolidado
CREATE OR REPLACE VIEW vista_inventario_consolidado AS
SELECT 
    planta,
    title,
    nombre_material,
    unidad_medida,
    stock,
    pallets,
    bodega,
    ubicacion,
    fecha_inventario,
    lote,
    condicion_armado
FROM inventario
WHERE stock > 0;

-- Crear vista para movimientos recientes
CREATE OR REPLACE VIEW vista_movimientos_recientes AS
SELECT 
    tm.id,
    tm.tipo_movimiento,
    tm.planta,
    tm.fecha,
    tm.id_movimiento,
    tm.title as codigo_material,
    tm.nombre as nombre_material,
    tm.cantidad,
    tm.unidad_medida,
    tm.bod_origen,
    tm.bod_destino,
    tm.proveedor,
    tm.temporada,
    tm.fecha_creacion
FROM trazabilidad_materiales_r9 tm
ORDER BY tm.fecha_creacion DESC;

-- Comentarios en vistas
COMMENT ON VIEW vista_inventario_consolidado IS 'Vista consolidada de inventarios de ambas plantas';
COMMENT ON VIEW vista_movimientos_recientes IS 'Vista de movimientos ordenados por fecha de creación';