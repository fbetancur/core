@echo off
echo 🚀 Transformando formulario XForm con Enketo...
echo.

REM Obtener la ruta actual y convertirla a formato WSL
set "CURRENT_DIR=%CD%"
set "WSL_PATH=%CURRENT_DIR:\=/%"
set "WSL_PATH=%WSL_PATH:C:=/mnt/c%"

echo 📍 Directorio actual: %CURRENT_DIR%
echo 📍 Ruta WSL: %WSL_PATH%

REM Verificar que WSL está disponible
wsl --list --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: WSL no está disponible
    pause
    exit /b 1
)

echo 📋 Copiando archivos a WSL...
wsl --distribution Ubuntu-24.04 --user root -- cp "%WSL_PATH%/Transformer/form.xml" "/root/form.xml"
wsl --distribution Ubuntu-24.04 --user root -- cp "%WSL_PATH%/Transformer/transform-template.js" "/root/transform-template.js"

echo ⚙️  Preparando script de transformación...
wsl --distribution Ubuntu-24.04 --user root -- bash -c "cd ~/enketo-transform-project && sed 's|TARGET_PATH|%WSL_PATH%|g' /root/transform-template.js > transform.js"

echo 🔄 Ejecutando transformación...
wsl --distribution Ubuntu-24.04 --user root -- bash -c "cd ~/enketo-transform-project && node transform.js"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Proceso completado!
    echo Los archivos transformados están en la carpeta public/
) else (
    echo.
    echo ❌ Error durante la transformación
)
pause