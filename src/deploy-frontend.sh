#!/bin/bash

# Script para compilar y desplegar el frontend al servidor

echo "🚀 DEPLOY FRONTEND A SERVIDOR"
echo "==============================="
echo ""

# Variables
SERVER="root@94.143.141.241"
FRONTEND_DIR="/var/www/bigartist-frontend/dist"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    if [ "$1" == "success" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" == "error" ]; then
        echo -e "${RED}❌ $2${NC}"
    elif [ "$1" == "warning" ]; then
        echo -e "${YELLOW}⚠️  $2${NC}"
    else
        echo -e "${BLUE}ℹ️  $2${NC}"
    fi
}

# 1. Verificar que package.json existe
if [ ! -f "package.json" ]; then
    print_status "error" "No estás en el directorio del frontend"
    exit 1
fi

print_status "success" "Directorio del frontend encontrado"
echo ""

# 2. Compilar el frontend
print_status "info" "Compilando frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_status "error" "Error al compilar el frontend"
    exit 1
fi

print_status "success" "Frontend compilado correctamente"
echo ""

# 3. Crear tarball del directorio dist
print_status "info" "Creando paquete de deployment..."
cd dist
tar -czf ../frontend-dist.tar.gz .
cd ..

print_status "success" "Paquete creado: frontend-dist.tar.gz"
echo ""

# 4. Subir al servidor
print_status "info" "Subiendo al servidor..."
scp frontend-dist.tar.gz $SERVER:/tmp/

if [ $? -eq 0 ]; then
    print_status "success" "Archivos subidos correctamente"
else
    print_status "error" "Error subiendo archivos"
    exit 1
fi
echo ""

# 5. Desplegar en el servidor
print_status "info" "Desplegando en el servidor..."

ssh $SERVER << 'ENDSSH'
cd /tmp

# Crear backup del frontend actual
if [ -d "/var/www/bigartist-frontend/dist" ]; then
    echo "📦 Creando backup..."
    cp -r /var/www/bigartist-frontend/dist /var/www/bigartist-frontend/dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# Limpiar directorio actual
rm -rf /var/www/bigartist-frontend/dist
mkdir -p /var/www/bigartist-frontend/dist

# Extraer nuevos archivos
echo "📂 Extrayendo archivos..."
tar -xzf /tmp/frontend-dist.tar.gz -C /var/www/bigartist-frontend/dist

# Establecer permisos correctos
chown -R www-data:www-data /var/www/bigartist-frontend/dist
chmod -R 755 /var/www/bigartist-frontend/dist

# Limpiar
rm -f /tmp/frontend-dist.tar.gz

echo "✅ Frontend desplegado correctamente"
ENDSSH

# 6. Limpiar archivos temporales locales
rm -f frontend-dist.tar.gz

echo ""
print_status "success" "🎉 DEPLOYMENT COMPLETADO"
echo ""
print_status "info" "El frontend está disponible en:"
echo "   https://app.bigartist.es"
echo ""
print_status "info" "Prueba el cambio de contraseña:"
echo "   1. Login con admin@bigartist.es / admin123"
echo "   2. Click en el botón de Configuración (engranaje)"
echo "   3. Selecciona 'Cambiar contraseña'"
echo "   4. Ingresa contraseña actual, nueva y confirma"
echo ""
