# API Documentation - WMS Ranco Cherries Backend

## Información General

- **Aplicación**: WMS Ranco Cherries
- **Versión**: 1.0.0
- **Descripción**: Sistema de Trazabilidad de Materiales
- **Puerto por defecto**: 3001

## Base URL

```
http://localhost:3001/api
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT token. Incluir el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

---

# 📋 ENDPOINTS DISPONIBLES

## 🔐 Autenticación (`/api/auth`)

### 1. Login

- **Método**: `POST`
- **URL**: `/api/auth/login`
- **Acceso**: Público
- **Descripción**: Iniciar sesión de usuario

**Body ejemplo**:

```json
{
  "usuario": "admin",
  "password": "1234567"
}
```

**Respuesta exitosa**:

```json
{
  "exito": true,
  "mensaje": "Login exitoso",
  "datos": {
    "token": "jwt_token_aqui",
    "usuario": {
      "id": 1,
      "usuario": "admin",
      "nombre": "Administrador"
    }
  }
}
```

### 2. Logout

- **Método**: `POST`
- **URL**: `/api/auth/logout`
- **Acceso**: Privado (token opcional)
- **Descripción**: Cerrar sesión del usuario

**Headers**:

```
Authorization: Bearer <token>
```

### 3. Refresh Token

- **Método**: `POST`
- **URL**: `/api/auth/refresh`
- **Acceso**: Privado
- **Descripción**: Refrescar token de acceso

**Headers**:

```
Authorization: Bearer <token>
```

### 4. Validar Token

- **Método**: `GET`
- **URL**: `/api/auth/validate`
- **Acceso**: Privado
- **Descripción**: Validar token actual

**Headers**:

```
Authorization: Bearer <token>
```

### 5. Cambiar Contraseña

- **Método**: `PUT`
- **URL**: `/api/auth/cambiar-password`
- **Acceso**: Privado
- **Descripción**: Cambiar contraseña del usuario

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "passwordActual": "password_actual",
  "passwordNuevo": "nuevo_password"
}
```

---

## 🏭 Mantenedores (`/api/mantenedores`)

### 1. Resumen de Mantenedores

- **Método**: `GET`
- **URL**: `/api/mantenedores`
- **Acceso**: Privado
- **Descripción**: Obtiene resumen de todos los mantenedores

**Headers**:

```
Authorization: Bearer <token>
```

### 2. Obtener Plantas

- **Método**: `GET`
- **URL**: `/api/mantenedores/plantas`
- **Acceso**: Privado
- **Descripción**: Obtiene todas las plantas

**Headers**:

```
Authorization: Bearer <token>
```

### 3. Obtener Materiales

- **Método**: `GET`
- **URL**: `/api/mantenedores/materiales`
- **Acceso**: Privado
- **Descripción**: Obtiene todos los materiales

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo (default: true)

**Ejemplo**:

```
GET /api/mantenedores/materiales?activo=true
```

### 4. Obtener Material por Código

- **Método**: `GET`
- **URL**: `/api/mantenedores/materiales/codigo/:codigo`
- **Acceso**: Privado
- **Descripción**: Obtiene un material por código

**Headers**:

```
Authorization: Bearer <token>
```

**Ejemplo**:

```
GET /api/mantenedores/materiales/codigo/MAT001
```

### 5. Obtener Proveedores

- **Método**: `GET`
- **URL**: `/api/mantenedores/proveedores`
- **Acceso**: Privado
- **Descripción**: Obtiene todos los proveedores

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo (default: true)

### 6. Obtener Proveedor por Código

- **Método**: `GET`
- **URL**: `/api/mantenedores/proveedores/codigo/:codigo`
- **Acceso**: Privado
- **Descripción**: Obtiene un proveedor por código

**Headers**:

```
Authorization: Bearer <token>
```

**Ejemplo**:

```
GET /api/mantenedores/proveedores/codigo/PROV001
```

### 7. Obtener Ubicaciones

- **Método**: `GET`
- **URL**: `/api/mantenedores/ubicaciones`
- **Acceso**: Privado
- **Descripción**: Obtiene todas las ubicaciones

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo (default: true)

### 8. Obtener Ubicaciones por Planta

- **Método**: `GET`
- **URL**: `/api/mantenedores/ubicaciones/planta/:planta`
- **Acceso**: Privado
- **Descripción**: Obtiene ubicaciones por planta

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo (default: true)

**Ejemplo**:

```
GET /api/mantenedores/ubicaciones/planta/RANCAGUA?activo=true
```

### 9. Obtener Temporadas

- **Método**: `GET`
- **URL**: `/api/mantenedores/temporadas`
- **Acceso**: Privado
- **Descripción**: Obtiene todas las temporadas

**Headers**:

```
Authorization: Bearer <token>
```

### 10. Obtener Temporada Activa

- **Método**: `GET`
- **URL**: `/api/mantenedores/temporadas/activa`
- **Acceso**: Privado
- **Descripción**: Obtiene la temporada activa

**Headers**:

```
Authorization: Bearer <token>
```

### 11. Obtener Tipos de Movimiento

- **Método**: `GET`
- **URL**: `/api/mantenedores/tipos-movimiento`
- **Acceso**: Privado
- **Descripción**: Obtiene todos los tipos de movimiento

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo (default: true)

### 12. Obtener Unidades de Medida

- **Método**: `GET`
- **URL**: `/api/mantenedores/unidades-medida`
- **Acceso**: Privado
- **Descripción**: Obtiene todas las unidades de medida

**Headers**:

```
Authorization: Bearer <token>
```

---

## 🛠️ Utilidades (`/api/utils`)

### 1. Health Check

- **Método**: `GET`
- **URL**: `/api/utils/health`
- **Acceso**: Público
- **Descripción**: Verificación de salud del sistema

**Respuesta ejemplo**:

```json
{
  "exito": true,
  "mensaje": "Sistema funcionando correctamente",
  "timestamp": "2025-08-17T23:30:00.000Z",
  "datos": {
    "version": "1.0.0",
    "entorno": "development",
    "uptime": 3600,
    "memoria": {
      "rss": 52428800,
      "heapTotal": 29360128,
      "heapUsed": 20971520,
      "external": 1638400
    },
    "pid": 12345
  }
}
```

### 2. Información de Versión

- **Método**: `GET`
- **URL**: `/api/utils/version`
- **Acceso**: Público
- **Descripción**: Información de versión del sistema

**Respuesta ejemplo**:

```json
{
  "exito": true,
  "mensaje": "Información de versión obtenida",
  "datos": {
    "aplicacion": "WMS Ranco Cherries",
    "version": "1.0.0",
    "descripcion": "Sistema de Trazabilidad de Materiales",
    "entorno": "development",
    "node_version": "v18.17.0"
  }
}
```

### 3. Generar Código

- **Método**: `POST`
- **URL**: `/api/utils/generar-codigo`
- **Acceso**: Privado
- **Descripción**: Genera códigos únicos para el sistema

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "tipo": "MATERIAL",
  "prefijo": "MAT",
  "longitud": 10
}
```

**Respuesta ejemplo**:

```json
{
  "exito": true,
  "mensaje": "Código generado exitosamente",
  "datos": {
    "codigo": "MAT12345678",
    "tipo": "MATERIAL",
    "timestamp": "2025-08-17T23:30:00.000Z"
  }
}
```

### 4. Validar Código de Barras

- **Método**: `POST`
- **URL**: `/api/utils/validar-codigo-barras`
- **Acceso**: Privado
- **Descripción**: Valida formato de códigos de barras

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "codigoBarras": "1234567890123"
}
```

**Respuesta ejemplo**:

```json
{
  "exito": true,
  "mensaje": "Validación de código de barras completada",
  "datos": {
    "codigoBarras": "1234567890123",
    "esValido": true,
    "longitud": 13
  }
}
```

---

## � Inventario (`/api/inventario`)

### 1. Obtener Inventario

- **Método**: `GET`
- **URL**: `/api/inventario`
- **Acceso**: Privado
- **Descripción**: Obtiene el inventario con filtros opcionales y paginación

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta específica
- `material_id` (number, opcional): Filtrar por ID de material
- `fecha_desde` (string, opcional): Fecha desde (formato: YYYY-MM-DD)
- `fecha_hasta` (string, opcional): Fecha hasta (formato: YYYY-MM-DD)
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

**Ejemplo**:

```
GET /api/inventario?planta=Rancagua&pagina=1&limite=10
```

**Respuesta exitosa**:

```json
{
  "exito": true,
  "mensaje": "Inventario obtenido exitosamente",
  "datos": {
    "inventario": [
      {
        "id": 1,
        "planta": "Rancagua",
        "codigo_material": "BOGR2062",
        "nombre_material": "BOLSA CE 2,5KG VF FLEX REGINA GENERICA",
        "unidad_medida": "Unidad",
        "fecha_inventario": "2025-08-17T00:00:00.000Z",
        "pallets": 2,
        "stock": 1000,
        "bodega": "Bodega Principal",
        "ubicacion": "Altillo Packing",
        "lote": "LOTE001",
        "condicion_armado": "Normal",
        "contado_por": "Sistema"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 1,
      "total_registros": 6,
      "registros_por_pagina": 50
    }
  }
}
```

### 2. Resumen de Stock

- **Método**: `GET`
- **URL**: `/api/inventario/resumen-stock`
- **Acceso**: Privado
- **Descripción**: Obtiene un resumen consolidado del stock

**Headers**:

```
Authorization: Bearer <token>
```

### 3. Buscar Inventario

- **Método**: `GET`
- **URL**: `/api/inventario/buscar`
- **Acceso**: Privado
- **Descripción**: Búsqueda avanzada de inventario por material

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda

### 4. Inventario por Planta

- **Método**: `GET`
- **URL**: `/api/inventario/planta/:planta`
- **Acceso**: Privado
- **Descripción**: Obtiene inventario filtrado por planta específica

**Headers**:

```
Authorization: Bearer <token>
```

### 5. Inventario por ID

- **Método**: `GET`
- **URL**: `/api/inventario/:id`
- **Acceso**: Privado
- **Descripción**: Obtiene un registro específico de inventario

**Headers**:

```
Authorization: Bearer <token>
```

---

## 📊 Reportes (`/api/reportes`)

### 1. Lista de Reportes Disponibles

- **Método**: `GET`
- **URL**: `/api/reportes`
- **Acceso**: Privado
- **Descripción**: Obtiene la lista de todos los reportes disponibles en el sistema

**Headers**:

```
Authorization: Bearer <token>
```

**Respuesta exitosa**:

```json
{
  "exito": true,
  "mensaje": "Reportes disponibles obtenidos exitosamente",
  "datos": {
    "reportes": {
      "reportes_inventario": {
        "titulo": "Reportes de Inventario",
        "descripcion": "Reportes relacionados con el stock y ubicación de materiales",
        "endpoints": [
          {
            "nombre": "Inventario por Planta",
            "endpoint": "/api/reportes/inventario/planta",
            "metodo": "GET",
            "parametros": ["planta", "fecha_desde?", "fecha_hasta?"]
          }
        ]
      }
    },
    "total_categorias": 4,
    "usuario_rol": "admin",
    "planta_usuario": "Ambas"
  }
}
```

### 2. Dashboard

- **Método**: `GET`
- **URL**: `/api/reportes/dashboard`
- **Acceso**: Privado
- **Descripción**: Obtiene métricas consolidadas para el dashboard principal

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `planta` (string, opcional): Filtrar métricas por planta

### 3. Reporte de Inventario por Planta

- **Método**: `GET`
- **URL**: `/api/reportes/inventario/planta`
- **Acceso**: Privado
- **Descripción**: Genera reporte detallado de inventario por planta

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `planta` (string, requerido): Planta para el reporte
- `fecha_desde` (string, opcional): Fecha desde (formato: YYYY-MM-DD)
- `fecha_hasta` (string, opcional): Fecha hasta (formato: YYYY-MM-DD)

### 4. Reporte de Movimientos por Período

- **Método**: `GET`
- **URL**: `/api/reportes/movimientos/periodo`
- **Acceso**: Privado
- **Descripción**: Genera reporte de movimientos en un período específico

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `fecha_desde` (string, requerido): Fecha desde (formato: YYYY-MM-DD)
- `fecha_fin` (string, requerido): Fecha hasta (formato: YYYY-MM-DD)
- `planta` (string, opcional): Filtrar por planta
- `material` (string, opcional): Filtrar por material

### 5. Reporte de Stock por Material

- **Método**: `GET`
- **URL**: `/api/reportes/stock/material`
- **Acceso**: Privado
- **Descripción**: Genera reporte detallado de stock de un material específico

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `material` (string, requerido): Material para el reporte
- `planta` (string, opcional): Filtrar por planta

### 6. Reporte de Auditoría

- **Método**: `GET`
- **URL**: `/api/reportes/auditoria`
- **Acceso**: Privado (Requiere rol de administrador o supervisor)
- **Descripción**: Genera reporte de auditoría del sistema

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `fecha_desde` (string, requerido): Fecha desde (formato: YYYY-MM-DD)
- `fecha_hasta` (string, requerido): Fecha hasta (formato: YYYY-MM-DD)
- `usuario` (string, opcional): Filtrar por usuario
- `modulo` (string, opcional): Filtrar por módulo

---

## 🔄 Trazabilidad (`/api/trazabilidad`)

### 1. Obtener Movimientos

- **Método**: `GET`
- **URL**: `/api/trazabilidad`
- **Acceso**: Privado
- **Descripción**: Obtiene movimientos de materiales con filtros y paginación

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta
- `fecha_desde` (string, opcional): Fecha desde (formato: YYYY-MM-DD)
- `fecha_hasta` (string, opcional): Fecha hasta (formato: YYYY-MM-DD)
- `tipo_movimiento` (string, opcional): Filtrar por tipo de movimiento
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

**Respuesta exitosa**:

```json
{
  "exito": true,
  "mensaje": "Movimientos de trazabilidad obtenidos exitosamente",
  "datos": {
    "movimientos": [
      {
        "id": 1,
        "tipo_movimiento": "INGRESO",
        "planta": "Rancagua",
        "fecha": "2025-08-17T00:00:00.000Z",
        "material": "BOGR2062",
        "cantidad": 1000,
        "unidad_medida": "Unidad",
        "proveedor": "Proveedor ABC"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_registros": 0
    }
  }
}
```

### 2. Resumen de Movimientos

- **Método**: `GET`
- **URL**: `/api/trazabilidad/resumen`
- **Acceso**: Privado
- **Descripción**: Obtiene resumen consolidado de movimientos

**Headers**:

```
Authorization: Bearer <token>
```

### 3. Buscar Movimientos

- **Método**: `GET`
- **URL**: `/api/trazabilidad/buscar`
- **Acceso**: Privado
- **Descripción**: Búsqueda avanzada de movimientos

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda

### 4. Movimientos por Material

- **Método**: `GET`
- **URL**: `/api/trazabilidad/material/:material_id`
- **Acceso**: Privado
- **Descripción**: Obtiene movimientos de un material específico

**Headers**:

```
Authorization: Bearer <token>
```

### 5. Movimientos por Planta

- **Método**: `GET`
- **URL**: `/api/trazabilidad/planta/:planta`
- **Acceso**: Privado
- **Descripción**: Obtiene movimientos de una planta específica

**Headers**:

```
Authorization: Bearer <token>
```

### 6. Movimiento por ID

- **Método**: `GET`
- **URL**: `/api/trazabilidad/:id`
- **Acceso**: Privado
- **Descripción**: Obtiene un movimiento específico por ID

**Headers**:

```
Authorization: Bearer <token>
```

---

## 👥 Usuarios (`/api/usuarios`)

### 1. Listar Usuarios

- **Método**: `GET`
- **URL**: `/api/usuarios`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Obtiene la lista de todos los usuarios del sistema

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `activo` (boolean, opcional): Filtrar por estado activo
- `rol` (string, opcional): Filtrar por rol
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

**Respuesta exitosa**:

```json
{
  "exito": true,
  "mensaje": "Usuarios obtenidos exitosamente",
  "datos": {
    "usuarios": [
      {
        "id": 1,
        "nombre_usuario": "admin",
        "nombre_completo": "Administrador Sistema",
        "email": "admin@rancocheries.com",
        "rol": "admin",
        "planta_asignada": "Ambas",
        "activo": true,
        "ultimo_acceso": "2025-08-18T02:02:20.035Z"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_registros": 3
    }
  }
}
```

### 2. Crear Usuario

- **Método**: `POST`
- **URL**: `/api/usuarios`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Crea un nuevo usuario en el sistema

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "nombre_usuario": "nuevo_usuario",
  "nombre_completo": "Nombre Completo",
  "email": "usuario@email.com",
  "password": "password123",
  "rol": "operador",
  "planta_asignada": "Rancagua"
}
```

### 3. Buscar Usuarios

- **Método**: `GET`
- **URL**: `/api/usuarios/buscar`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Búsqueda avanzada de usuarios

**Headers**:

```
Authorization: Bearer <token>
```

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda

### 4. Obtener Usuario por ID

- **Método**: `GET`
- **URL**: `/api/usuarios/:id`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Obtiene información detallada de un usuario específico

**Headers**:

```
Authorization: Bearer <token>
```

### 5. Actualizar Usuario

- **Método**: `PUT`
- **URL**: `/api/usuarios/:id`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Actualiza información completa de un usuario

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "nombre_completo": "Nombre Actualizado",
  "email": "nuevo@email.com",
  "rol": "supervisor",
  "planta_asignada": "Chimbarongo"
}
```

### 6. Cambiar Estado de Usuario

- **Método**: `PATCH`
- **URL**: `/api/usuarios/:id/estado`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Activa o desactiva un usuario

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "activo": false
}
```

### 7. Resetear Contraseña

- **Método**: `POST`
- **URL**: `/api/usuarios/:id/resetear-password`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Resetea la contraseña de un usuario

**Headers**:

```
Authorization: Bearer <token>
```

**Body ejemplo**:

```json
{
  "nueva_password": "nueva_password123"
}
```

### 8. Obtener Sesiones de Usuario

- **Método**: `GET`
- **URL**: `/api/usuarios/:id/sesiones`
- **Acceso**: Privado (Solo administradores)
- **Descripción**: Obtiene las sesiones activas de un usuario

**Headers**:

```
Authorization: Bearer <token>
```

---

## 📝 Notas para Postman

### Configuración de Environment

Crear un environment en Postman con las siguientes variables:

```json
{
  "base_url": "http://localhost:3001/api",
  "jwt_token": ""
}
```

### Workflow sugerido para pruebas:

1. **Primer paso**: Usar el endpoint `/api/utils/health` para verificar que el servidor esté funcionando
2. **Segundo paso**: Usar `/api/auth/login` para obtener el token JWT
3. **Tercer paso**: Configurar la variable `jwt_token` en el environment con el token obtenido
4. **Cuarto paso**: Probar los demás endpoints autenticados

### Headers comunes:

```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

### Códigos de Respuesta Esperados:

- `200`: Éxito
- `201`: Creado
- `400`: Solicitud incorrecta
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error interno del servidor

---

## 🔧 Configuración del Sistema

- **Plantas disponibles**:
  - Rancagua
  - Chimbarongo
- **Usuarios registrados**: 3 usuarios
- **Registros de inventario**: 6 registros activos
- **Materiales**: 8 materiales registrados
- **Ubicaciones**: 14 ubicaciones disponibles
- **Temporada actual por defecto**: R9
- **Rate Limit**: 100 requests por 15 minutos por IP
- **JWT Expiration**: 24 horas por defecto

### 📊 Estado Actual de la Base de Datos

- ✅ **Inventario**: 6 registros (Rancagua: 3, Chimbarongo: 3)
- ✅ **Trazabilidad**: 0 registros (sistema listo para recibir movimientos)
- ✅ **Usuarios**: 3 usuarios (1 admin, 2 operadores)
- ✅ **Materiales**: 8 materiales activos
- ✅ **Ubicaciones**: 14 ubicaciones (8 en Rancagua, 6 en Chimbarongo)

### 🔐 Roles de Usuario Disponibles

- **admin**: Acceso completo al sistema
- **supervisor**: Acceso a reportes y supervisión
- **operador**: Acceso a operaciones básicas

---

## 🛠️ Scripts de Administración

Para facilitar las pruebas y administración del sistema, se incluyen scripts utilitarios:

### Scripts Disponibles

#### 1. Actualizar Contraseñas (NPM Scripts)

```bash
# Actualizar todas las contraseñas a "1234567"
npm run admin:reset-passwords

# Crear usuario administrador
npm run admin:create-user

# Listar todos los usuarios
npm run admin:list-users

# Verificar contraseña de un usuario
npm run admin:verify-password admin
```

#### 2. Scripts Interactivos

```bash
# Windows (Batch)
scripts\ejecutar-scripts.bat

# Windows (PowerShell)
scripts\ejecutar-scripts.ps1
```

#### 3. Scripts Directos

```bash
# Actualizar contraseñas
node scripts/actualizar-passwords.js

# Crear usuario admin
node scripts/crear-usuario-admin.js
```

### Credenciales de Prueba

Después de ejecutar los scripts, puedes usar estas credenciales para testing:

**Usuario Administrador:**

```json
{
  "usuario": "admin",
  "password": "1234567"
}
```

**Todos los usuarios tendrán:**

- Contraseña: `1234567`

### ⚠️ Importante para Testing

- Los scripts solo funcionan en entornos de desarrollo/testing
- Todas las sesiones activas se cierran al actualizar contraseñas
- Se registran logs de auditoría automáticamente
- **NO usar en producción sin cambiar las contraseñas después**

---

## ❄️ Operaciones de Frío y Despacho (`/api/operaciones-frio-despacho`)

### 1. Listar Operaciones

- **Método**: `GET`
- **URL**: `/api/operaciones-frio-despacho`
- **Acceso**: Privado
- **Descripción**: Obtener todas las operaciones de frío y despacho

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta
- `tipo_operacion` (string, opcional): Filtrar por tipo de operación
- `estado` (string, opcional): Filtrar por estado
- `numero_embarque` (string, opcional): Filtrar por número de embarque
- `fecha_desde` (date, opcional): Fecha inicio del rango
- `fecha_hasta` (date, opcional): Fecha fin del rango
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

### 2. Obtener Operación por ID

- **Método**: `GET`
- **URL**: `/api/operaciones-frio-despacho/:id`
- **Acceso**: Privado
- **Descripción**: Obtener operación específica por ID

### 3. Resumen de Operaciones

- **Método**: `GET`
- **URL**: `/api/operaciones-frio-despacho/resumen`
- **Acceso**: Privado
- **Descripción**: Obtener resumen de operaciones agrupado por tipo y estado

### 4. Buscar Operaciones

- **Método**: `GET`
- **URL**: `/api/operaciones-frio-despacho/buscar`
- **Acceso**: Privado
- **Descripción**: Buscar operaciones por múltiples criterios

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda (mínimo 2 caracteres)
- `limite` (number, opcional): Límite de resultados (default: 20)

### 5. Operaciones por Embarque

- **Método**: `GET`
- **URL**: `/api/operaciones-frio-despacho/embarque/:numero_embarque`
- **Acceso**: Privado
- **Descripción**: Obtener todas las operaciones de un embarque específico

---

## 📦 Recepciones de Lotes (`/api/recepciones-lotes`)

### 1. Listar Recepciones

- **Método**: `GET`
- **URL**: `/api/recepciones-lotes`
- **Acceso**: Privado
- **Descripción**: Obtener todas las recepciones de lotes

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta
- `proveedor_id` (number, opcional): Filtrar por ID de proveedor
- `estado` (string, opcional): Filtrar por estado
- `codigo_material` (string, opcional): Filtrar por código de material
- `fecha_desde` (date, opcional): Fecha inicio del rango
- `fecha_hasta` (date, opcional): Fecha fin del rango
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

### 2. Obtener Recepción por ID

- **Método**: `GET`
- **URL**: `/api/recepciones-lotes/:id`
- **Acceso**: Privado
- **Descripción**: Obtener recepción específica por ID

### 3. Recepciones por Proveedor

- **Método**: `GET`
- **URL**: `/api/recepciones-lotes/proveedor/:proveedor_id`
- **Acceso**: Privado
- **Descripción**: Obtener recepciones de un proveedor específico

### 4. Resumen de Recepciones

- **Método**: `GET`
- **URL**: `/api/recepciones-lotes/resumen`
- **Acceso**: Privado
- **Descripción**: Obtener resumen de recepciones agrupado por estado

### 5. Buscar Recepciones

- **Método**: `GET`
- **URL**: `/api/recepciones-lotes/buscar`
- **Acceso**: Privado
- **Descripción**: Buscar recepciones por múltiples criterios

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda (mínimo 2 caracteres)
- `limite` (number, opcional): Límite de resultados (default: 20)

---

## 📍 Stock por Ubicaciones (`/api/stock-ubicaciones`)

### 1. Listar Stock por Ubicaciones

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones`
- **Acceso**: Privado
- **Descripción**: Obtener stock consolidado por ubicaciones

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta
- `bodega` (string, opcional): Filtrar por bodega
- `material_id` (number, opcional): Filtrar por ID de material
- `ubicacion_id` (number, opcional): Filtrar por ID de ubicación
- `con_stock` (boolean, opcional): Mostrar solo ubicaciones con stock (default: true)
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

### 2. Stock por Material

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones/material/:material_id`
- **Acceso**: Privado
- **Descripción**: Obtener stock de un material en todas sus ubicaciones

### 3. Stock por Ubicación

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones/ubicacion/:ubicacion_id`
- **Acceso**: Privado
- **Descripción**: Obtener todos los materiales en una ubicación específica

### 4. Resumen Consolidado

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones/resumen`
- **Acceso**: Privado
- **Descripción**: Obtener resumen consolidado de stock por material y ubicación

### 5. Buscar Stock

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones/buscar`
- **Acceso**: Privado
- **Descripción**: Buscar stock por múltiples criterios

### 6. Obtener Stock por ID

- **Método**: `GET`
- **URL**: `/api/stock-ubicaciones/:id`
- **Acceso**: Privado
- **Descripción**: Obtener registro de stock específico por ID

---

## 🏷️ Tarjas (`/api/tarjas`)

### 1. Listar Tarjas

- **Método**: `GET`
- **URL**: `/api/tarjas`
- **Acceso**: Privado
- **Descripción**: Obtener todas las tarjas del sistema

**Query Parameters**:

- `planta` (string, opcional): Filtrar por planta
- `tipo_tarja` (string, opcional): Filtrar por tipo de tarja
- `estado` (string, opcional): Filtrar por estado
- `material_id` (number, opcional): Filtrar por ID de material
- `proveedor_id` (number, opcional): Filtrar por ID de proveedor
- `fecha_desde` (date, opcional): Fecha inicio del rango
- `fecha_hasta` (date, opcional): Fecha fin del rango
- `pagina` (number, opcional): Número de página (default: 1)
- `limite` (number, opcional): Registros por página (default: 50)

### 2. Obtener Tarja por ID

- **Método**: `GET`
- **URL**: `/api/tarjas/:id`
- **Acceso**: Privado
- **Descripción**: Obtener tarja específica por ID

### 3. Obtener Tarja por Número

- **Método**: `GET`
- **URL**: `/api/tarjas/numero/:numero_tarja`
- **Acceso**: Privado
- **Descripción**: Obtener tarja específica por su número único

### 4. Tarjas por Tipo

- **Método**: `GET`
- **URL**: `/api/tarjas/tipo/:tipo_tarja`
- **Acceso**: Privado
- **Descripción**: Obtener tarjas de un tipo específico

### 5. Tarjas Pendientes

- **Método**: `GET`
- **URL**: `/api/tarjas/pendientes`
- **Acceso**: Privado
- **Descripción**: Obtener tarjas pendientes de impresión

### 6. Resumen de Tarjas

- **Método**: `GET`
- **URL**: `/api/tarjas/resumen`
- **Acceso**: Privado
- **Descripción**: Obtener resumen de tarjas agrupado por estado y tipo

### 7. Buscar Tarjas

- **Método**: `GET`
- **URL**: `/api/tarjas/buscar`
- **Acceso**: Privado
- **Descripción**: Buscar tarjas por múltiples criterios

**Query Parameters**:

- `termino` (string, requerido): Término de búsqueda (mínimo 2 caracteres)
- `limite` (number, opcional): Límite de resultados (default: 20)

---

## 🎉 Estado de Implementación

### ✅ APIs Completamente Implementadas y Funcionales:

- **🔐 Autenticación**: 5 endpoints (Login, Logout, Refresh, Validate, Change Password)
- **🏭 Mantenedores**: 12 endpoints (Plantas, Materiales, Proveedores, Ubicaciones, etc.)
- **🛠️ Utilidades**: 4 endpoints (Health, Version, Generate Code, Validate Barcode)
- **📦 Inventario**: 5 endpoints (List, Summary, Search, By Plant, By ID)
- **📊 Reportes**: 6 endpoints (List, Dashboard, Inventory, Movements, Stock, Audit)
- **🔄 Trazabilidad**: 6 endpoints (List, Summary, Search, By Material, By Plant, By ID)
- **👥 Usuarios**: 8 endpoints (CRUD completo + gestión de sesiones)
- **❄️ Operaciones Frío y Despacho**: 5 endpoints (List, Get by ID, Summary, Search, By Embarque)
- **📦 Recepciones de Lotes**: 5 endpoints (List, Get by ID, By Proveedor, Summary, Search)
- **📍 Stock por Ubicaciones**: 6 endpoints (List, By Material, By Ubicación, Summary, Search, Get by ID)
- **🏷️ Tarjas**: 7 endpoints (List, Get by ID, By Number, By Type, Pendientes, Summary, Search)

### 📈 Métricas del Sistema:

- **Total de Endpoints**: 69 endpoints implementados
- **Cobertura de Funcionalidad**: 100% completa
- **Nuevas Tablas Integradas**: 4 (operaciones_frio_despacho, recepciones_lotes, stock_ubicaciones, tarjas)
- **Estado de Pruebas**: Validado con tokens JWT
- **Documentación**: Actualizada y completa

### 🔒 Seguridad Implementada:

- ✅ Autenticación JWT obligatoria
- ✅ Middleware de autorización por roles
- ✅ Validación de sesiones en base de datos
- ✅ Rate limiting por IP
- ✅ Logs de auditoría automáticos

---

_Documentación actualizada el 17 de Agosto, 2025 - Sistema completo con 69 endpoints y 4 nuevas tablas integradas_
