# Scripts de Administración - WMS Ranco Cherries

Esta carpeta contiene scripts utilitarios para la administración del sistema WMS.

## 📋 Scripts Disponibles

### 1. 🔐 `actualizar-passwords.js`

Actualiza todas las contraseñas de usuarios activos a "1234567".

**Uso:**

```bash
# Actualizar todas las contraseñas
node scripts/actualizar-passwords.js

# Verificar contraseña de un usuario específico
node scripts/actualizar-passwords.js --verify admin

# Ver ayuda
node scripts/actualizar-passwords.js --help
```

**Características:**

- ✅ Actualiza todas las contraseñas de usuarios activos
- ✅ Cierra todas las sesiones activas
- ✅ Registra logs de auditoría
- ✅ No se ejecuta en producción (protección)
- ✅ Hashea la contraseña usando bcrypt

**Salida esperada:**

```
🔐 Iniciando actualización de contraseñas...
📋 Nueva contraseña: 1234567
📊 Se encontraron 3 usuarios activos
✅ Se actualizaron 3 contraseñas exitosamente
🚪 Se cerraron 5 sesiones activas
📝 Se registraron 3 logs de auditoría
```

### 2. 👤 `crear-usuario-admin.js`

Crea un usuario administrador por defecto o actualiza uno existente.

**Uso:**

```bash
# Crear usuario administrador
node scripts/crear-usuario-admin.js

# Listar todos los usuarios
node scripts/crear-usuario-admin.js --list

# Ver ayuda
node scripts/crear-usuario-admin.js --help
```

**Datos del usuario administrador:**

- **Usuario:** `admin`
- **Contraseña:** `1234567`
- **Email:** `admin@rancocherries.com`
- **Rol:** `administrador`
- **Planta:** `RANCAGUA`

**Características:**

- ✅ Crea usuario administrador con datos predefinidos
- ✅ Detecta si el usuario ya existe
- ✅ Permite actualizar contraseña de usuario existente
- ✅ Registra logs de auditoría
- ✅ Lista todos los usuarios del sistema

## 🚀 Instrucciones de Uso

### Prerrequisitos

1. Tener Node.js instalado
2. Tener las dependencias instaladas (`npm install`)
3. Configurar la variable de entorno `DATABASE_URL`
4. Asegurar que Prisma esté configurado correctamente

### Pasos para ejecutar

#### Opción 1: Actualizar todas las contraseñas

```bash
# Desde la raíz del proyecto
node scripts/actualizar-passwords.js
```

#### Opción 2: Crear usuario administrador

```bash
# Desde la raíz del proyecto
node scripts/crear-usuario-admin.js
```

#### Opción 3: Usar ambos scripts

```bash
# Primero crear usuario admin
node scripts/crear-usuario-admin.js

# Luego actualizar todas las contraseñas (incluido el admin)
node scripts/actualizar-passwords.js
```

## ⚠️ Precauciones

### Seguridad

- **NO ejecutar en producción** sin cambiar las contraseñas después
- Los scripts están protegidos contra ejecución en producción
- Cambiar las contraseñas por defecto después de usar los scripts

### Base de Datos

- Los scripts modifican directamente la base de datos
- Se recomienda hacer backup antes de ejecutar
- Verificar la conexión a la base de datos correcta

### Sesiones

- El script de actualización cierra **todas** las sesiones activas
- Los usuarios deberán hacer login nuevamente
- Se pierden las sesiones temporales no guardadas

## 📊 Logs y Auditoría

Ambos scripts registran automáticamente logs en la tabla `logs_sistema`:

- **Acción:** `password_reset_masivo` o `usuario_admin_creado`
- **Módulo:** `admin_script`
- **IP:** `127.0.0.1`
- **Usuario:** ID del usuario afectado
- **Timestamp:** Fecha y hora de ejecución

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar variable de entorno
echo $DATABASE_URL

# O en Windows
echo %DATABASE_URL%

# Verificar conexión con Prisma
npx prisma db pull
```

### Error: "Script no debe ejecutarse en producción"

```bash
# Cambiar entorno temporalmente
export NODE_ENV=development

# O modificar el archivo .env
NODE_ENV=development
```

### Error: "Usuario ya existe"

- El script `crear-usuario-admin.js` preguntará si desea actualizar
- Responder 's' o 'si' para actualizar la contraseña

## 📈 Casos de Uso

### Desarrollo

```bash
# Setup inicial de desarrollo
node scripts/crear-usuario-admin.js
```

### Testing

```bash
# Resetear todas las contraseñas para testing
node scripts/actualizar-passwords.js
```

### Demostración

```bash
# Preparar sistema para demo
node scripts/crear-usuario-admin.js
node scripts/actualizar-passwords.js
```

### Recovery

```bash
# Recuperar acceso administrativo
node scripts/crear-usuario-admin.js --list  # Ver usuarios
node scripts/crear-usuario-admin.js         # Crear/actualizar admin
```

## 🔍 Verificación

### Verificar contraseña actualizada:

```bash
node scripts/actualizar-passwords.js --verify admin
```

### Verificar usuarios creados:

```bash
node scripts/crear-usuario-admin.js --list
```

### Probar login con Postman:

```json
POST /api/auth/login
{
  "usuario": "admin",
  "password": "1234567"
}
```

## 📝 Notas Adicionales

- Los scripts usan la configuración de `src/configuracion/config.js`
- El salt de bcrypt se toma de `configuracion.bcrypt.saltRounds`
- Los logs se almacenan en `logs_sistema` para auditoría
- Las sesiones se manejan en `sesiones_usuario`

---

**⚠️ IMPORTANTE:** Recuerde cambiar las contraseñas por defecto en entornos de producción.
