#!/bin/bash

echo "🔍 =================================================="
echo "🔍 VERIFICACIÓN DE CAMBIO DE TOKEN"
echo "🔍 =================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 PASO 1: Verificando dónde se GUARDA el token (LoginPanel.tsx)${NC}"
echo "---------------------------------------------------"
echo ""

if grep -n "localStorage.setItem('authToken'" /components/LoginPanel.tsx 2>/dev/null; then
  echo -e "${GREEN}✅ Token se GUARDA como 'authToken'${NC}"
else
  echo -e "${RED}❌ No se encontró 'authToken' al guardar${NC}"
fi

echo ""
echo -e "${BLUE}📋 PASO 2: Verificando dónde se LEE el token (AdminLayout.tsx)${NC}"
echo "---------------------------------------------------"
echo ""

# Buscar la línea específica del cambio de contraseña
LINEA_CAMBIO_PASSWORD=$(grep -n "const token = localStorage.getItem" /components/AdminLayout.tsx | grep -A2 -B2 "change-password")

if grep -q "localStorage.getItem('authToken')" /components/AdminLayout.tsx; then
  echo -e "${GREEN}✅ Token se LEE como 'authToken' - CORRECTO${NC}"
  echo ""
  echo "Líneas donde se lee el token:"
  grep -n "localStorage.getItem('authToken')" /components/AdminLayout.tsx
else
  echo -e "${RED}❌ Token NO se lee como 'authToken'${NC}"
  echo ""
  echo "Verificando si aún dice 'token':"
  grep -n "localStorage.getItem('token')" /components/AdminLayout.tsx
fi

echo ""
echo -e "${BLUE}📋 PASO 3: Verificando contexto completo${NC}"
echo "---------------------------------------------------"
echo ""

echo "Mostrando función handleChangePassword completa:"
echo ""
grep -A 30 "const handleChangePassword = async" /components/AdminLayout.tsx | head -35

echo ""
echo "=================================================="
echo -e "${YELLOW}🧪 PASO 4: Prueba funcional${NC}"
echo "=================================================="
echo ""

echo "Para probar que funciona:"
echo "1. Abre: https://app.bigartist.es"
echo "2. Login con: admin@bigartist.es"
echo "3. Click en ⚙️ Configuración"
echo "4. Click en 🔒 Cambiar contraseña"
echo "5. Ingresa: contraseña actual, nueva, confirmar"
echo "6. Debería mostrar: ✅ Contraseña actualizada correctamente"
echo ""

echo "=================================================="
echo -e "${GREEN}✅ VERIFICACIÓN COMPLETA${NC}"
echo "=================================================="
