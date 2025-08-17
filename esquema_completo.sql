-- =====================================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA WMS RANCO CHERRIES
-- Versión: 1.0
-- Fecha: 2024
-- Descripción: Estructura completa para sistema de trazabilidad
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE wms_ranco_cherries;
-- \c wms_ranco_cherries;

-- =====================================================
-- 1. TABLAS PRINCIPALES
-- =====================================================

-- 1.1 Tabla: materiales
-- Descripción: Contiene información acerca de los materiales
CREATE TABLE materiales (
    id SERIAL PRIMARY KEY,
    codigo_ranco VARCHAR(50) UNIQUE NOT NULL, -- Código del material: "BOGR2062"
    nombre_material VARCHAR(300) NOT NULL, -- BOLSA CE 2,5KG VF FLEX REGINA GENERICA
    clasificacion VARCHAR(50), -- Kit, Normal, Armado, Guagua, Por armar
    unidad_medida VARCHAR(50), -- Unidad, Litros, Rollo, etc.
    frio VARCHAR(10) DEFAULT 'No', -- Indica si el material se utiliza en Frio (Si – No)
    cod_nombre VARCHAR(400), -- Combinación código + nombre
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Tabla: ubicacion
-- Descripción: Contiene las bodegas y ubicaciones de los movimientos
CREATE TABLE ubicacion (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL, -- Ubicación (Altillo Packing, Carpa 1, Carpa 2, etc.)
    bodega_deposito VARCHAR(100), -- Chimbarongo, Centro Armado, Ranco, etc.
    planta VARCHAR(50), -- Rancagua - Chimbarongo
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Tabla: proveedores
-- Descripción: Información de proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL, -- nombre del proveedor
    ingreso_proveedores_100 DECIMAL(10,2) DEFAULT 0,
    total_general DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Tabla: temporadas_app
-- Descripción: Configuración de temporadas
CREATE TABLE temporadas_app (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL, -- R8 2023-2024, R9 2024-2025, etc.
    activo BOOLEAN DEFAULT true,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 Tabla: tipo_movimientos_app
-- Descripción: Tipos de movimientos disponibles
CREATE TABLE tipo_movimientos_app (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL, -- Recepción, Despacho, Consumo, etc.
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 Tabla: trazabilidad_materiales_r9
-- Descripción: Lista principal que lleva registro de cada movimiento de material
CREATE TABLE trazabilidad_materiales_r9 (
    id SERIAL PRIMARY KEY,
    tipo_movimiento VARCHAR(100) NOT NULL, -- Despacho, Recepción Interna, Ingreso proveedor, etc.
    planta VARCHAR(50) NOT NULL, -- Rancagua - Chimbarongo
    guia_sii VARCHAR(50),
    fecha DATE NOT NULL, -- 22/10/2024
    mes VARCHAR(20),
    id_movimiento VARCHAR(100) UNIQUE NOT NULL, -- identificador único del movimiento
    proveedor VARCHAR(200),
    lote VARCHAR(100),
    title VARCHAR(100) NOT NULL, -- código del material
    nombre VARCHAR(300) NOT NULL, -- del material
    cod_nombre VARCHAR(400), -- Unión entre código del material y su nombre
    clasificacion VARCHAR(50), -- Kit, Normal, Armado, Guagua, Por armar
    total_pallet INTEGER DEFAULT 0,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(50), -- Unidad, Litros, Rollo, etc.
    bod_origen VARCHAR(100), -- Bodega de origen
    bod_destino VARCHAR(100), -- Bodega de destino
    ubicacion_origen VARCHAR(100),
    ubicacion_destino VARCHAR(100),
    turno VARCHAR(20), -- Turno 1 – Turno 2
    temporada VARCHAR(50), -- R9 2024-2025
    observacion TEXT,
    bodega_stock VARCHAR(100), -- Bodega dónde se agrega o resta stock
    ubicacion_stock VARCHAR(100), -- Ubicación dónde se agrega o resta stock
    total_stock DECIMAL(10,2), -- Total agregado o restado de cierto stock
    numero_embarque VARCHAR(50), -- Opcional, solo en pantalla Frio y Despacho
    patente_camion VARCHAR(20), -- Opcional, solo en pantalla Frio y Despacho
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    material_id INTEGER REFERENCES materiales(id),
    proveedor_id INTEGER REFERENCES proveedores(id),
    ubicacion_origen_id INTEGER REFERENCES ubicacion(id),
    ubicacion_destino_id INTEGER REFERENCES ubicacion(id),
    temporada_id INTEGER REFERENCES temporadas_app(id),
    tipo_movimiento_id INTEGER REFERENCES tipo_movimientos_app(id)
);

-- =====================================================
-- 2. TABLAS DE INVENTARIO
-- =====================================================

-- 2.1 Tabla: inventario_rancagua
-- 2.1 Tabla: inventario
-- Descripción: Tabla para llevar registros de inventarios en ambas plantas
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    planta VARCHAR(50) NOT NULL, -- Rancagua o Chimbarongo
    title VARCHAR(100) NOT NULL, -- código del material
    nombre_material VARCHAR(300),
    unidad_medida VARCHAR(50), -- Unidad, Litros, Rollo, etc.
    cod_nombre VARCHAR(400),
    fecha_inventario DATE NOT NULL,
    pallets INTEGER DEFAULT 0,
    stock DECIMAL(10,2) NOT NULL,
    bodega VARCHAR(100),
    ubicacion VARCHAR(100),
    lote VARCHAR(100),
    condicion_armado VARCHAR(50),
    contado_por VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    material_id INTEGER REFERENCES materiales(id),
    ubicacion_id INTEGER REFERENCES ubicacion(id)
);

-- =====================================================
-- 3. TABLAS DE SISTEMA
-- =====================================================

-- 3.1 Tabla: usuarios
-- Descripción: Usuarios del sistema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    planta_asignada VARCHAR(50), -- Rancagua, Chimbarongo, Ambas
    rol VARCHAR(50) DEFAULT 'operador', -- admin, supervisor, operador
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Tabla: sesiones_usuario
-- Descripción: Control de sesiones activas
CREATE TABLE sesiones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    planta_seleccionada VARCHAR(50) NOT NULL,
    token_jwt TEXT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- 3.3 Tabla: logs_sistema
-- Descripción: Registro de actividades del sistema
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para trazabilidad_materiales_r9
CREATE INDEX idx_trazabilidad_fecha ON trazabilidad_materiales_r9(fecha);
CREATE INDEX idx_trazabilidad_planta ON trazabilidad_materiales_r9(planta);
CREATE INDEX idx_trazabilidad_material ON trazabilidad_materiales_r9(title);
CREATE INDEX idx_trazabilidad_movimiento ON trazabilidad_materiales_r9(id_movimiento);
CREATE INDEX idx_trazabilidad_temporada ON trazabilidad_materiales_r9(temporada);

-- Índices para materiales
CREATE INDEX idx_materiales_codigo ON materiales(codigo_ranco);
CREATE INDEX idx_materiales_nombre ON materiales(nombre_material);
CREATE INDEX idx_materiales_clasificacion ON materiales(clasificacion);

-- Índices para ubicacion
CREATE INDEX idx_ubicacion_planta ON ubicacion(planta);
CREATE INDEX idx_ubicacion_bodega ON ubicacion(bodega_deposito);

-- Índices para inventarios
CREATE INDEX idx_inventario_fecha ON inventario(fecha_inventario);
CREATE INDEX idx_inventario_material ON inventario(title);
CREATE INDEX idx_inventario_planta ON inventario(planta);

-- Índices para usuarios y sesiones
CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_sesiones_usuario_id ON sesiones_usuario(usuario_id);
CREATE INDEX idx_sesiones_activa ON sesiones_usuario(activa);

-- =====================================================
-- 5. TRIGGERS PARA AUDITORÍA
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas principales
CREATE TRIGGER trigger_actualizar_materiales
    BEFORE UPDATE ON materiales
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_ubicacion
    BEFORE UPDATE ON ubicacion
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_proveedores
    BEFORE UPDATE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_temporadas
    BEFORE UPDATE ON temporadas_app
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_tipo_movimientos
    BEFORE UPDATE ON tipo_movimientos_app
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_trazabilidad
    BEFORE UPDATE ON trazabilidad_materiales_r9
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_inventario
    BEFORE UPDATE ON inventario
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- 6. COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE materiales IS 'Catálogo de materiales del sistema';
COMMENT ON TABLE ubicacion IS 'Ubicaciones y bodegas disponibles';
COMMENT ON TABLE proveedores IS 'Catálogo de proveedores';
COMMENT ON TABLE temporadas_app IS 'Configuración de temporadas de trabajo';
COMMENT ON TABLE tipo_movimientos_app IS 'Tipos de movimientos permitidos';
COMMENT ON TABLE trazabilidad_materiales_r9 IS 'Registro principal de movimientos de materiales';
COMMENT ON TABLE inventario IS 'Registros de inventarios de ambas plantas';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema';
COMMENT ON TABLE sesiones_usuario IS 'Control de sesiones activas';
COMMENT ON TABLE logs_sistema IS 'Registro de actividades del sistema';