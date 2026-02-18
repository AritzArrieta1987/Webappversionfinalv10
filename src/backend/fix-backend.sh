#!/bin/bash

# Script de auto-reparación del backend BigArtist
# Este script diagnostica y repara el backend automáticamente

echo "🔧 REPARACIÓN AUTOMÁTICA DEL BACKEND BIGARTIST"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_DIR="/root/bigartist-backend"
BACKEND_NAME="bigartist-backend"
PORT=3001

# Función para imprimir con color
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

# 1. Verificar si estamos en el servidor correcto
print_status "info" "Paso 1: Verificando servidor..."
if [ ! -d "$BACKEND_DIR" ]; then
    print_status "error" "No se encuentra el directorio $BACKEND_DIR"
    print_status "info" "Creando estructura de directorios..."
    mkdir -p $BACKEND_DIR
fi

cd $BACKEND_DIR || exit 1
print_status "success" "En directorio: $(pwd)"
echo ""

# 2. Verificar MySQL
print_status "info" "Paso 2: Verificando MySQL..."
if systemctl is-active --quiet mysql; then
    print_status "success" "MySQL está corriendo"
else
    print_status "error" "MySQL no está corriendo. Iniciándolo..."
    systemctl start mysql
    sleep 2
    if systemctl is-active --quiet mysql; then
        print_status "success" "MySQL iniciado correctamente"
    else
        print_status "error" "No se pudo iniciar MySQL"
        exit 1
    fi
fi
echo ""

# 3. Verificar archivos del backend
print_status "info" "Paso 3: Verificando archivos del backend..."

if [ ! -f "server.js" ]; then
    print_status "error" "No existe server.js"
    print_status "warning" "Necesitas subir los archivos del backend al servidor"
    exit 1
fi

if [ ! -f "package.json" ]; then
    print_status "error" "No existe package.json"
    exit 1
fi

print_status "success" "Archivos del backend encontrados"
echo ""

# 4. Verificar/Crear archivo .env
print_status "info" "Paso 4: Verificando configuración (.env)..."

if [ ! -f ".env" ]; then
    print_status "warning" "Archivo .env no existe. Creándolo..."
    cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root2024
DB_NAME=bigartist_royalties
JWT_SECRET=bigartist_secret_key_2024
PORT=3001
NODE_ENV=production
EOF
    print_status "success" "Archivo .env creado"
else
    print_status "success" "Archivo .env existe"
fi

# Mostrar configuración (sin mostrar contraseñas completas)
print_status "info" "Configuración actual:"
cat .env | sed 's/PASSWORD=.*/PASSWORD=***/' | sed 's/SECRET=.*/SECRET=***/'
echo ""

# 5. Instalar/Actualizar dependencias
print_status "info" "Paso 5: Verificando dependencias de Node.js..."

if [ ! -d "node_modules" ]; then
    print_status "warning" "node_modules no existe. Instalando dependencias..."
    npm install
else
    print_status "success" "node_modules existe"
    print_status "info" "Actualizando dependencias por seguridad..."
    npm install
fi
echo ""

# 6. Detener proceso anterior (si existe)
print_status "info" "Paso 6: Deteniendo proceso anterior (si existe)..."
pm2 delete $BACKEND_NAME 2>/dev/null || print_status "info" "No había proceso anterior"
echo ""

# 7. Verificar que el puerto está libre
print_status "info" "Paso 7: Verificando que el puerto $PORT está libre..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "warning" "Puerto $PORT está en uso. Liberándolo..."
    kill -9 $(lsof -t -i:$PORT) 2>/dev/null || true
    sleep 2
fi
print_status "success" "Puerto $PORT disponible"
echo ""

# 8. Iniciar el backend
print_status "info" "Paso 8: Iniciando backend con PM2..."
pm2 start server.js --name $BACKEND_NAME --env production

# Esperar un momento para que inicie
sleep 3

# Verificar que está corriendo
if pm2 list | grep -q "online.*$BACKEND_NAME"; then
    print_status "success" "Backend iniciado correctamente"
else
    print_status "error" "El backend no pudo iniciar. Ver logs:"
    pm2 logs $BACKEND_NAME --lines 30 --nostream
    exit 1
fi
echo ""

# 9. Guardar configuración de PM2
print_status "info" "Paso 9: Guardando configuración de PM2..."
pm2 save
print_status "success" "Configuración guardada"
echo ""

# 10. Verificar Nginx
print_status "info" "Paso 10: Verificando Nginx..."

if systemctl is-active --quiet nginx; then
    print_status "success" "Nginx está corriendo"
    
    # Verificar configuración
    if nginx -t 2>&1 | grep -q "successful"; then
        print_status "success" "Configuración de Nginx correcta"
    else
        print_status "error" "Configuración de Nginx tiene errores:"
        nginx -t
    fi
else
    print_status "error" "Nginx no está corriendo. Iniciándolo..."
    systemctl start nginx
    if systemctl is-active --quiet nginx; then
        print_status "success" "Nginx iniciado"
    else
        print_status "error" "No se pudo iniciar Nginx"
    fi
fi
echo ""

# 11. Probar endpoint localmente
print_status "info" "Paso 11: Probando endpoint localmente..."
sleep 2

RESPONSE=$(curl -s -X POST http://localhost:$PORT/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bigartist.es","password":"admin123"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_status "success" "Endpoint funciona correctamente en localhost"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    print_status "error" "Endpoint no responde correctamente:"
    echo "$RESPONSE"
    print_status "info" "Ver logs del backend:"
    pm2 logs $BACKEND_NAME --lines 30 --nostream
fi
echo ""

# 12. Probar endpoint públicamente
print_status "info" "Paso 12: Probando endpoint público (https://app.bigartist.es)..."
sleep 1

PUBLIC_RESPONSE=$(curl -s -X POST https://app.bigartist.es/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bigartist.es","password":"admin123"}')

if echo "$PUBLIC_RESPONSE" | grep -q '"success":true'; then
    print_status "success" "Endpoint público funciona correctamente"
    echo "$PUBLIC_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PUBLIC_RESPONSE"
else
    print_status "error" "Endpoint público no responde:"
    echo "$PUBLIC_RESPONSE"
    print_status "warning" "Esto indica un problema con Nginx o el firewall"
fi
echo ""

# 13. Verificar firewall
print_status "info" "Paso 13: Verificando firewall..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "80.*ALLOW"; then
        print_status "success" "Puerto 80 (HTTP) abierto"
    else
        print_status "warning" "Puerto 80 podría estar bloqueado"
    fi
    
    if ufw status | grep -q "443.*ALLOW"; then
        print_status "success" "Puerto 443 (HTTPS) abierto"
    else
        print_status "warning" "Puerto 443 podría estar bloqueado"
    fi
else
    print_status "info" "UFW no está instalado (firewall)"
fi
echo ""

# Resumen final
echo "=============================================="
echo -e "${BLUE}📊 RESUMEN FINAL${NC}"
echo "=============================================="
echo ""

pm2 list

echo ""
print_status "info" "Comandos útiles:"
echo "  pm2 logs $BACKEND_NAME          # Ver logs en tiempo real"
echo "  pm2 restart $BACKEND_NAME       # Reiniciar el backend"
echo "  pm2 stop $BACKEND_NAME          # Detener el backend"
echo "  pm2 delete $BACKEND_NAME        # Eliminar el backend de PM2"
echo ""
print_status "info" "Probar endpoint manualmente:"
echo "  curl http://localhost:$PORT/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@bigartist.es\",\"password\":\"admin123\"}'"
echo ""
print_status "info" "Ver logs del backend:"
echo "  pm2 logs $BACKEND_NAME --lines 50"
echo ""

# Estado final
if echo "$PUBLIC_RESPONSE" | grep -q '"success":true'; then
    echo ""
    print_status "success" "🎉 BACKEND FUNCIONANDO CORRECTAMENTE"
    print_status "success" "Puedes hacer login desde: https://app.bigartist.es"
    echo ""
    exit 0
else
    echo ""
    print_status "warning" "⚠️  Backend iniciado pero con problemas de conectividad externa"
    print_status "info" "Revisa la configuración de Nginx y el firewall"
    echo ""
    exit 1
fi
