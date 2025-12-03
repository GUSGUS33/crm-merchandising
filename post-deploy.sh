#!/bin/bash

#############################################################################
# Script de Post-Despliegue para Plesk
# 
# Este script se ejecuta automáticamente después de que Plesk descarga
# cambios de GitHub. Instala dependencias y compila la aplicación.
#
# Uso: Plesk ejecuta este script automáticamente
#############################################################################

set -e  # Salir si hay algún error

echo "=========================================="
echo "🚀 Post-Despliegue CRM Merchandising"
echo "=========================================="

# Obtener directorio actual
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Directorio: $SCRIPT_DIR"
echo ""

# Paso 1: Verificar que .env existe
echo "✓ Paso 1: Verificando archivo .env..."
if [ ! -f ".env" ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "Por favor, crear .env con las credenciales de Supabase"
    exit 1
fi
echo "✓ Archivo .env encontrado"
echo ""

# Paso 2: Instalar dependencias
echo "✓ Paso 2: Instalando dependencias..."
npm install --production
echo "✓ Dependencias instaladas"
echo ""

# Paso 3: Compilar la aplicación
echo "✓ Paso 3: Compilando la aplicación..."
npm run build
if [ ! -d "dist" ]; then
    echo "❌ Error: La compilación falló"
    exit 1
fi
echo "✓ Compilación completada"
echo ""

# Paso 4: Verificar que la carpeta dist existe
echo "✓ Paso 4: Verificando build..."
BUILD_SIZE=$(du -sh dist/ | cut -f1)
echo "✓ Tamaño del build: $BUILD_SIZE"
echo ""

# Paso 5: Limpiar caché (opcional)
echo "✓ Paso 5: Limpiando caché..."
rm -rf .cache/ 2>/dev/null || true
echo "✓ Caché limpiado"
echo ""

# Paso 6: Mostrar información de la aplicación
echo "=========================================="
echo "✅ Post-Despliegue Completado"
echo "=========================================="
echo ""
echo "📊 Información:"
echo "  - Directorio: $SCRIPT_DIR"
echo "  - Tamaño del build: $BUILD_SIZE"
echo "  - Fecha: $(date)"
echo ""
echo "🌐 La aplicación está lista en:"
echo "  - http://gestionclientes.online"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Verificar que la aplicación está corriendo"
echo "  2. Probar login con credenciales reales"
echo "  3. Revisar logs si hay problemas"
echo ""
echo "📞 Si hay errores, revisar logs:"
echo "  - Plesk: Hosting & Domains > Logs > Node.js"
echo "  - SSH: tail -f /var/www/vhosts/gestionclientes.online/logs/nodejs.log"
echo ""
