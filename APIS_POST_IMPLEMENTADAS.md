# APIs POST Implementadas - Documentación

## Resumen de Implementación

Se han implementado exitosamente las APIs POST para insertar datos en las tablas principales del sistema WMS, siguiendo la lógica especificada en `logica_tblas.md` y manteniendo los patrones establecidos en el código base.

## APIs Implementadas

### 1. Inventario

**Endpoint:** `POST /api/inventario`

**Descripción:** Crea un nuevo registro de inventario con actualización automática del stock consolidado.

**Request Body:**

```json
{
  "planta": "SJM",
  "title": "MAT001",
  "nombre_material": "Material de ejemplo",
  "unidad_medida": "KG",
  "cod_nombre": "Código opcional",
  "fecha_inventario": "2024-01-15T00:00:00.000Z",
  "pallets": 2,
  "stock": 100.5,
  "bodega": "BODEGA_A",
  "ubicacion": "A01-001",
  "lote": "L001",
  "condicion_armado": "Armado",
  "contado_por": "Juan Pérez",
  "material_id": 1,
  "ubicacion_id": 5
}
```

**Funcionalidades:**

- Validación de datos obligatorios
- Actualización automática de `stock_ubicaciones`
- Vinculación con materiales y ubicaciones existentes
- Formateo de respuesta con datos completos

---

### 2. Recepciones de Lotes

**Endpoint:** `POST /api/recepciones-lotes`

**Descripción:** Registra la recepción de un lote con actualización de stock y trazabilidad.

**Request Body:**

```json
{
  "numero_guia": "GR-2024-001",
  "material_id": 1,
  "proveedor_id": 2,
  "ubicacion_id": 3,
  "planta": "SJM",
  "cantidad_recibida": 500,
  "lote": "L2024-001",
  "fecha_recepcion": "2024-01-15T08:30:00.000Z",
  "numero_factura": "FAC-001",
  "observaciones": "Recepción normal",
  "qr_code": "QR123456"
}
```

**Funcionalidades:**

- Transacción completa que incluye:
  - Creación del registro de recepción
  - Actualización/creación en `stock_ubicaciones`
  - Registro en `trazabilidad`
- Validación de existencia de material, proveedor y ubicación
- Generación automática de QR si no se proporciona

---

### 3. Operaciones Frío/Despacho

**Endpoint:** `POST /api/operaciones-frio-despacho`

**Descripción:** Registra operaciones de consumo o despacho con validación de stock.

**Request Body:**

```json
{
  "material_id": 1,
  "ubicacion_origen_id": 3,
  "ubicacion_destino_id": 4,
  "tipo_operacion": "consumo",
  "planta": "SJM",
  "cantidad": 50,
  "lote": "L2024-001",
  "embarque": "EMB-001",
  "observaciones": "Operación de consumo"
}
```

**Tipos de Operación:**

- `consumo`: Reduce stock en ubicación origen
- `despacho`: Transfiere stock entre ubicaciones

**Funcionalidades:**

- Validación de stock disponible
- Actualización automática de stock según tipo de operación
- Generación automática de número de operación
- Registro de trazabilidad

---

### 4. Tarjas

**Endpoint:** `POST /api/tarjas`

**Descripción:** Crea una nueva tarja (CAA o BODEGA).

**Request Body:**

```json
{
  "tipo_tarja": "CAA",
  "planta": "SJM",
  "descripcion": "Tarja para certificación",
  "observaciones": "Creada para proceso específico"
}
```

**Endpoint adicional:** `PUT /api/tarjas/:id/imprimir`

**Descripción:** Marca una tarja como impresa.

**Funcionalidades:**

- Generación automática de número de tarja
- Validación de tipo de tarja (CAA/BODEGA)
- Estado de impresión con fecha y hora
- Validaciones específicas por tipo

---

### 5. Mantenedores

#### 5.1 Materiales

**Endpoint:** `POST /api/mantenedores/materiales`

```json
{
  "codigo_ranco": "MAT001",
  "nombre_material": "Material nuevo",
  "unidad_medida": "KG",
  "frio": "No",
  "descripcion": "Descripción del material"
}
```

#### 5.2 Proveedores

**Endpoint:** `POST /api/mantenedores/proveedores`

```json
{
  "codigo_proveedor": "PROV001",
  "nombre": "Proveedor Ejemplo",
  "razon_social": "Proveedor Ejemplo S.A.",
  "rut": "12345678-9",
  "contacto": "Juan Pérez",
  "telefono": "+56912345678",
  "email": "contacto@proveedor.com",
  "direccion": "Dirección ejemplo 123"
}
```

#### 5.3 Ubicaciones

**Endpoint:** `POST /api/mantenedores/ubicaciones`

```json
{
  "title": "A01-001",
  "bodega_deposito": "BODEGA_A",
  "es_bodega_frio": false,
  "capacidad_maxima": 1000,
  "descripcion": "Ubicación en bodega principal"
}
```

#### 5.4 Temporadas

**Endpoint:** `POST /api/mantenedores/temporadas`

```json
{
  "title": "Temporada 2024",
  "fecha_inicio": "2024-01-01T00:00:00.000Z",
  "fecha_fin": "2024-12-31T23:59:59.999Z",
  "activo": true
}
```

#### 5.5 Tipos de Movimiento

**Endpoint:** `POST /api/mantenedores/tipos-movimiento`

```json
{
  "title": "ENTRADA_MATERIAL",
  "descripcion": "Entrada de material al sistema"
}
```

---

## Características Generales

### Autenticación

Todas las APIs requieren autenticación mediante token JWT en el header:

```
Authorization: Bearer <token>
```

### Validaciones Implementadas

- **Datos obligatorios:** Validación de campos requeridos
- **Integridad referencial:** Verificación de existencia de registros relacionados
- **Duplicados:** Prevención de códigos/nombres duplicados
- **Formatos:** Validación de tipos de datos y formatos

### Transacciones

- Todas las operaciones que involucran múltiples tablas utilizan transacciones Prisma
- Rollback automático en caso de error
- Consistencia de datos garantizada

### Respuestas Estandarizadas

Todas las APIs utilizan el formato de respuesta estándar:

**Éxito (201):**

```json
{
  "exito": true,
  "mensaje": "Registro creado exitosamente",
  "datos": {
    /* objeto creado */
  },
  "codigo": "EXITO"
}
```

**Error de validación (400):**

```json
{
  "exito": false,
  "mensaje": "Datos de entrada inválidos",
  "errores": ["Campo requerido", "Formato inválido"],
  "codigo": "VALIDACION_FALLIDA"
}
```

**Conflicto (409):**

```json
{
  "exito": false,
  "mensaje": "Ya existe un registro con ese código",
  "codigo": "REGISTRO_DUPLICADO"
}
```

### Logging y Trazabilidad

- Registro automático en tabla `trazabilidad` para operaciones de stock
- Logs de sistema para operaciones críticas
- Timestamps automáticos en todos los registros

## Script de Pruebas

Se incluye un script completo de pruebas en `scripts/test-post-apis.js` que:

- Realiza login automático
- Prueba todas las APIs implementadas
- Utiliza datos reales del sistema
- Reporta éxitos y errores de manera clara

**Ejecución:**

```bash
node scripts/test-post-apis.js
```

## Próximos Pasos Recomendados

1. **Pruebas exhaustivas** con datos reales del sistema
2. **Actualización de documentación** de la API principal
3. **Implementación de APIs PUT/PATCH** para actualizaciones
4. **APIs DELETE** para eliminación lógica de registros
5. **Optimización de consultas** para mejor rendimiento
6. **Middleware de validación** más granular por endpoint

---

**Implementación completada exitosamente siguiendo patrones establecidos y buenas prácticas de desarrollo.**
