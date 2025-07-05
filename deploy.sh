#!/bin/bash

# Script de despliegue para CRM Merchandising
# Uso: ./deploy.sh [production|staging]

set -e

echo "🚀 Iniciando proceso de despliegue..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia .env.example a .env y configura tus variables"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar tests (si existen)
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Ejecutando tests..."
    npm test
fi

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist/

# Compilar para producción
echo "🔨 Compilando para producción..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo "❌ Error: El build falló"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Mostrar tamaño del build
echo "📊 Tamaño del build:"
du -sh dist/

# Instrucciones finales
echo ""
echo "🎉 ¡Despliegue preparado!"
echo ""
echo "📁 Los archivos están listos en la carpeta 'dist/'"
echo ""
echo "🌐 Para subir a tu hosting:"
echo "   1. Sube todo el contenido de 'dist/' a tu servidor"
echo "   2. Asegúrate de que index.html esté en la raíz"
echo "   3. Configura las variables de entorno en tu hosting"
echo ""
echo "☁️  Para despliegue automático:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod --dir=dist"
echo ""

# Si se especifica el entorno, mostrar instrucciones específicas
if [ "$1" = "production" ]; then
    echo "🔴 ENTORNO DE PRODUCCIÓN"
    echo "   - Verifica que todas las variables de entorno estén configuradas"
    echo "   - Asegúrate de que Supabase esté configurado correctamente"
    echo "   - Revisa que el dominio personalizado esté funcionando"
elif [ "$1" = "staging" ]; then
    echo "🟡 ENTORNO DE STAGING"
    echo "   - Usa una base de datos de prueba"
    echo "   - Configura variables de entorno de desarrollo"
fi

echo ""
echo "✨ ¡Listo para desplegar!"

