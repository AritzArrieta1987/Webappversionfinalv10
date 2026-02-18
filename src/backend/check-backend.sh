#!/bin/bash

echo "🔍 Verificando Backend BigArtist..."
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar conectividad al servidor
echo "1. Probando conectividad al servidor..."
if ping -c 1 94.143.141.241 &> /dev/null; then
    echo -e "${GREEN}✅ Servidor alcanzable${NC}"
else
    echo -e "${RED}❌ No se puede alcanzar el servidor${NC}"
    exit 1
fi
echo ""

# 2. Verificar endpoint de stats (sin autenticación)
echo "2. Probando endpoint /api/finances/stats..."
STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://app.bigartist.es/api/finances/stats)
if [ "$STATS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✅ Endpoint stats responde (200)${NC}"
    curl -s https://app.bigartist.es/api/finances/stats | jq '.' || curl -s https://app.bigartist.es/api/finances/stats
else
    echo -e "${RED}❌ Endpoint stats no responde correctamente (HTTP $STATS_RESPONSE)${NC}"
fi
echo ""

# 3. Probar endpoint de login
echo "3. Probando endpoint /api/auth/login..."
LOGIN_RESPONSE=$(curl -s -X POST https://app.bigartist.es/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bigartist.es","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Login funciona correctamente${NC}"
    echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"
else
    echo -e "${RED}❌ Login no funciona${NC}"
    echo "$LOGIN_RESPONSE"
fi
echo ""

# 4. Verificar CORS
echo "4. Verificando configuración CORS..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS https://app.bigartist.es/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control")

if [ -n "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✅ CORS configurado${NC}"
    echo "$CORS_RESPONSE"
else
    echo -e "${YELLOW}⚠️  No se detectaron headers CORS (podría causar problemas desde localhost)${NC}"
fi
echo ""

# 5. Verificar SSL
echo "5. Verificando certificado SSL..."
SSL_CHECK=$(curl -s -I https://app.bigartist.es | head -n 1)
if echo "$SSL_CHECK" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ HTTPS funcionando${NC}"
else
    echo -e "${RED}❌ Problema con HTTPS${NC}"
fi
echo ""

# Resumen
echo "=================================="
echo "📊 Resumen:"
echo ""
echo "Servidor: https://app.bigartist.es"
echo "IP: 94.143.141.241"
echo ""
echo "Endpoints disponibles:"
echo "  - GET  /api/finances/stats"
echo "  - POST /api/auth/login"
echo "  - POST /api/auth/logout"
echo "  - GET  /api/finances/payment-requests"
echo "  - POST /api/finances/expenses"
echo ""
echo "Para ver el estado del backend en el servidor:"
echo "  ssh root@94.143.141.241"
echo "  pm2 list"
echo "  pm2 logs bigartist-backend --lines 50"
