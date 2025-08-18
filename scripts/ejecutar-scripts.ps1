# Script de ejecución para administración de usuarios
# WMS Ranco Cherries

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    WMS Ranco Cherries - Scripts de Admin" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

function Show-Menu {
    Write-Host "Seleccione una opción:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Actualizar todas las contraseñas a '1234567'" -ForegroundColor White
    Write-Host "2. Crear usuario administrador" -ForegroundColor White
    Write-Host "3. Listar todos los usuarios" -ForegroundColor White
    Write-Host "4. Verificar contraseña de usuario" -ForegroundColor White
    Write-Host "5. Ver ayuda" -ForegroundColor White
    Write-Host "6. Salir" -ForegroundColor White
    Write-Host ""
}

function Actualizar-Passwords {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " Actualizando todas las contraseñas..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    node scripts/actualizar-passwords.js
    Write-Host ""
    Read-Host "Presione Enter para continuar"
}

function Crear-Admin {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " Creando usuario administrador..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    node scripts/crear-usuario-admin.js
    Write-Host ""
    Read-Host "Presione Enter para continuar"
}

function Listar-Usuarios {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " Listando usuarios del sistema..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    node scripts/crear-usuario-admin.js --list
    Write-Host ""
    Read-Host "Presione Enter para continuar"
}

function Verificar-Password {
    Write-Host ""
    $usuario = Read-Host "Ingrese nombre de usuario a verificar"
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " Verificando contraseña para $usuario..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    node scripts/actualizar-passwords.js --verify $usuario
    Write-Host ""
    Read-Host "Presione Enter para continuar"
}

function Show-Ayuda {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "              AYUDA" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Este menú ejecuta scripts para administrar usuarios:" -ForegroundColor White
    Write-Host ""
    Write-Host "• Opción 1: Cambia TODAS las contraseñas a '1234567'" -ForegroundColor Yellow
    Write-Host "            y cierra todas las sesiones activas" -ForegroundColor Gray
    Write-Host ""
    Write-Host "• Opción 2: Crea un usuario 'admin' con contraseña '1234567'" -ForegroundColor Yellow
    Write-Host "            o actualiza uno existente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "• Opción 3: Muestra lista completa de usuarios registrados" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "• Opción 4: Verifica si un usuario tiene la contraseña '1234567'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "CREDENCIALES GENERADAS:" -ForegroundColor Green
    Write-Host "  Usuario: admin" -ForegroundColor White
    Write-Host "  Contraseña: 1234567" -ForegroundColor White
    Write-Host "  Email: admin@rancocherries.com" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Red
    Write-Host "• Los scripts NO se ejecutan en producción" -ForegroundColor Gray
    Write-Host "• Se cierran todas las sesiones activas" -ForegroundColor Gray
    Write-Host "• Se registran logs de auditoría" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Presione Enter para continuar"
}

# Bucle principal del menú
do {
    Clear-Host
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "    WMS Ranco Cherries - Scripts de Admin" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    
    Show-Menu
    $choice = Read-Host "Ingrese su opción (1-6)"
    
    switch ($choice) {
        "1" { Actualizar-Passwords }
        "2" { Crear-Admin }
        "3" { Listar-Usuarios }
        "4" { Verificar-Password }
        "5" { Show-Ayuda }
        "6" { 
            Write-Host ""
            Write-Host "Gracias por usar los scripts de administración!" -ForegroundColor Green
            Write-Host ""
            break 
        }
        default { 
            Write-Host ""
            Write-Host "Opción inválida. Intente nuevamente." -ForegroundColor Red
            Write-Host ""
            Start-Sleep -Seconds 2
        }
    }
} while ($choice -ne "6")
