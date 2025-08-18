@echo off
echo ===============================================
echo    WMS Ranco Cherries - Scripts de Admin
echo ===============================================
echo.

:menu
echo Seleccione una opcion:
echo.
echo 1. Actualizar todas las contraseñas a "1234567"
echo 2. Crear usuario administrador
echo 3. Listar todos los usuarios
echo 4. Verificar contraseña de usuario
echo 5. Ver ayuda
echo 6. Salir
echo.
set /p choice="Ingrese su opcion (1-6): "

if "%choice%"=="1" goto actualizar_passwords
if "%choice%"=="2" goto crear_admin
if "%choice%"=="3" goto listar_usuarios
if "%choice%"=="4" goto verificar_password
if "%choice%"=="5" goto ayuda
if "%choice%"=="6" goto salir

echo Opcion invalida. Intente nuevamente.
echo.
goto menu

:actualizar_passwords
echo.
echo ===========================================
echo  Actualizando todas las contraseñas...
echo ===========================================
node scripts/actualizar-passwords.js
echo.
pause
goto menu

:crear_admin
echo.
echo ===========================================
echo  Creando usuario administrador...
echo ===========================================
node scripts/crear-usuario-admin.js
echo.
pause
goto menu

:listar_usuarios
echo.
echo ===========================================
echo  Listando usuarios del sistema...
echo ===========================================
node scripts/crear-usuario-admin.js --list
echo.
pause
goto menu

:verificar_password
echo.
set /p usuario="Ingrese nombre de usuario a verificar: "
echo.
echo ===========================================
echo  Verificando contraseña para %usuario%...
echo ===========================================
node scripts/actualizar-passwords.js --verify %usuario%
echo.
pause
goto menu

:ayuda
echo.
echo ===========================================
echo              AYUDA
echo ===========================================
echo.
echo Este menu ejecuta scripts para administrar usuarios:
echo.
echo • Opcion 1: Cambia TODAS las contraseñas a "1234567"
echo             y cierra todas las sesiones activas
echo.
echo • Opcion 2: Crea un usuario "admin" con contraseña "1234567"
echo             o actualiza uno existente
echo.
echo • Opcion 3: Muestra lista completa de usuarios registrados
echo.
echo • Opcion 4: Verifica si un usuario tiene la contraseña "1234567"
echo.
echo CREDENCIALES GENERADAS:
echo   Usuario: admin
echo   Contraseña: 1234567
echo   Email: admin@rancocherries.com
echo.
echo IMPORTANTE:
echo • Los scripts NO se ejecutan en produccion
echo • Se cierran todas las sesiones activas
echo • Se registran logs de auditoria
echo.
pause
goto menu

:salir
echo.
echo Gracias por usar los scripts de administracion!
echo.
exit /b 0
