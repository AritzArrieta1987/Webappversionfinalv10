#!/bin/bash

# Script para subir el backend al servidor en un solo comando

echo "📦 DEPLOY BACKEND A SERVIDOR"
echo "=============================="
echo ""

# Variables
SERVER="root@94.143.141.241"
SERVER_DIR="/root/bigartist-backend"
BACKEND_FILES="server.js package.json .env.example routes database"

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

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    print_status "error" "No estás en el directorio backend/"
    echo "   Ejecuta: cd backend && ./deploy-to-server.sh"
    exit 1
fi

print_status "success" "Archivos del backend encontrados"
echo ""

# 2. Crear directorio temporal
print_status "info" "Creando paquete de deployment..."
TEMP_DIR=$(mktemp -d)
mkdir -p $TEMP_DIR/bigartist-backend

# 3. Copiar archivos
cp server.js $TEMP_DIR/bigartist-backend/
cp package.json $TEMP_DIR/bigartist-backend/
cp .env.example $TEMP_DIR/bigartist-backend/

# Copiar routes si existe
if [ -d "routes" ]; then
    cp -r routes $TEMP_DIR/bigartist-backend/
fi

# Copiar database si existe
if [ -d "database" ]; then
    cp -r database $TEMP_DIR/bigartist-backend/
fi

print_status "success" "Archivos copiados al paquete"
echo ""

# 4. Crear tarball
cd $TEMP_DIR
tar -czf bigartist-backend.tar.gz bigartist-backend/
print_status "success" "Paquete creado: bigartist-backend.tar.gz"
echo ""

# 5. Subir al servidor
print_status "info" "Subiendo al servidor..."
scp bigartist-backend.tar.gz $SERVER:/tmp/

if [ $? -eq 0 ]; then
    print_status "success" "Archivos subidos correctamente"
else
    print_status "error" "Error subiendo archivos"
    exit 1
fi
echo ""

# 6. Ejecutar comandos en el servidor
print_status "info" "Instalando en el servidor..."

ssh $SERVER << 'ENDSSH'
cd /tmp

# Extraer archivos
tar -xzf bigartist-backend.tar.gz

# Crear directorio si no existe
mkdir -p /root/bigartist-backend

# Copiar archivos (sin sobrescribir .env si existe)
cp -r bigartist-backend/* /root/bigartist-backend/

# Si no existe .env, crearlo desde .env.example
if [ ! -f "/root/bigartist-backend/.env" ]; then
    cp /root/bigartist-backend/.env.example /root/bigartist-backend/.env
    echo "✅ Archivo .env creado desde .env.example"
fi

cd /root/bigartist-backend

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Detener proceso anterior
echo "🛑 Deteniendo proceso anterior..."
pm2 delete bigartist-backend 2>/dev/null || true

# Iniciar con PM2
echo "🚀 Iniciando backend..."
pm2 start server.js --name bigartist-backend
pm2 save

# Esperar 3 segundos
sleep 3

# Mostrar estado
echo ""
echo "📊 Estado:"
pm2 list

echo ""
echo "🧪 Probando endpoint..."
sleep 2
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bigartist.es","password":"admin123"}' | head -c 200

echo ""
echo ""

# Limpiar
rm -rf /tmp/bigartist-backend /tmp/bigartist-backend.tar.gz

echo "✅ Deployment completado"
ENDSSH

# 7. Limpiar archivos temporales locales
rm -rf $TEMP_DIR

echo ""
print_status "success" "🎉 DEPLOYMENT COMPLETADO"
echo ""
print_status "info" "El backend está corriendo en:"
echo "   https://app.bigartist.es/api/"
echo ""
print_status "info" "Ver logs con:"
echo "   ssh $SERVER 'pm2 logs bigartist-backend'"
echo ""
print_status "info" "Probar endpoint:"
echo "   curl https://app.bigartist.es/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@bigartist.es\",\"password\":\"admin123\"}'"
echo ""
