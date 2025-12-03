#!/bin/bash

#############################################################################
# Script de Despliegue Automatizado para CRM Merchandising
# 
# Este script automatiza el despliegue del CRM en el servidor de producción
# Uso: ./deploy.sh [usuario@host] [ruta_destino]
# Ejemplo: ./deploy.sh ubuntu@gestionclientes.online /var/www/crm
#############################################################################

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Validar argumentos
if [ $# -lt 2 ]; then
    print_error "Uso: ./deploy.sh [usuario@host] [ruta_destino]"
    echo "Ejemplo: ./deploy.sh ubuntu@gestionclientes.online /var/www/crm"
    exit 1
fi

REMOTE_HOST=$1
DEPLOY_PATH=$2
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_info "=== Iniciando despliegue del CRM Merchandising ==="
print_info "Servidor: $REMOTE_HOST"
print_info "Ruta de despliegue: $DEPLOY_PATH"

# Paso 1: Verificar que el archivo .env existe
print_info "Paso 1: Verificando configuración..."
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    print_error "Archivo .env no encontrado"
    print_warning "Por favor, crea el archivo .env con las credenciales de Supabase"
    print_info "Puedes copiar .env.example: cp .env.example .env"
    exit 1
fi
print_success "Archivo .env encontrado"

# Paso 2: Compilar la aplicación
print_info "Paso 2: Compilando la aplicación..."
cd "$SCRIPT_DIR"
npm run build
print_success "Compilación completada"

# Paso 3: Crear archivo de configuración para el servidor
print_info "Paso 3: Preparando archivos para despliegue..."

# Crear directorio temporal para el despliegue
TEMP_DEPLOY_DIR=$(mktemp -d)
cp -r "$SCRIPT_DIR/dist" "$TEMP_DEPLOY_DIR/"
cp "$SCRIPT_DIR/.env" "$TEMP_DEPLOY_DIR/"
cp "$SCRIPT_DIR/server.js" "$TEMP_DEPLOY_DIR/"
cp "$SCRIPT_DIR/package.json" "$TEMP_DEPLOY_DIR/"
cp "$SCRIPT_DIR/package-lock.json" "$TEMP_DEPLOY_DIR/" 2>/dev/null || true

print_success "Archivos preparados en: $TEMP_DEPLOY_DIR"

# Paso 4: Transferir archivos al servidor
print_info "Paso 4: Transfiriendo archivos al servidor..."
ssh "$REMOTE_HOST" "mkdir -p $DEPLOY_PATH"
scp -r "$TEMP_DEPLOY_DIR/dist" "$REMOTE_HOST:$DEPLOY_PATH/"
scp "$TEMP_DEPLOY_DIR/.env" "$REMOTE_HOST:$DEPLOY_PATH/"
scp "$TEMP_DEPLOY_DIR/server.js" "$REMOTE_HOST:$DEPLOY_PATH/"
scp "$TEMP_DEPLOY_DIR/package.json" "$REMOTE_HOST:$DEPLOY_PATH/"
scp "$TEMP_DEPLOY_DIR/package-lock.json" "$REMOTE_HOST:$DEPLOY_PATH/" 2>/dev/null || true

print_success "Archivos transferidos"

# Paso 5: Instalar dependencias en el servidor
print_info "Paso 5: Instalando dependencias en el servidor..."
ssh "$REMOTE_HOST" "cd $DEPLOY_PATH && npm install --production"
print_success "Dependencias instaladas"

# Paso 6: Reiniciar el servidor (si está usando PM2 o similar)
print_info "Paso 6: Reiniciando la aplicación..."
ssh "$REMOTE_HOST" "cd $DEPLOY_PATH && pm2 restart crm-app || pm2 start server.js --name crm-app"
print_success "Aplicación reiniciada"

# Paso 7: Limpiar archivos temporales
print_info "Paso 7: Limpiando archivos temporales..."
rm -rf "$TEMP_DEPLOY_DIR"
print_success "Limpieza completada"

# Resumen final
print_info "=== Despliegue completado exitosamente ==="
print_success "El CRM está disponible en: http://$REMOTE_HOST"
print_info "Para ver los logs: ssh $REMOTE_HOST 'pm2 logs crm-app'"
print_warning "Asegúrate de que el archivo .env en el servidor tiene las credenciales correctas"
