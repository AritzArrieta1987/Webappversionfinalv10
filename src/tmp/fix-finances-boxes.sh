#!/bin/bash

echo "🔧 ================================================"
echo "🔧 ARREGLANDO CAJAS DE FINANZAS"
echo "🔧 ================================================"
echo ""

cd /var/www/bigartist

echo "📝 1. VERIFICANDO ESTILOS ACTUALES"
echo "=========================================="
echo "Cajas principales en FinancesPanel:"
grep -n "rgba(42, 63, 63" components/admin/FinancesPanel.tsx | head -5

echo ""
echo "📊 2. LIMPIANDO CACHE Y BUILD ANTERIOR"
echo "=========================================="
rm -rf build/
rm -rf node_modules/.vite/
echo "✅ Cache limpiado"

echo ""
echo "🔨 3. COMPILANDO DESDE CERO"
echo "=========================================="
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build exitoso"
  
  echo ""
  echo "📦 4. VERIFICANDO ARCHIVOS GENERADOS"
  echo "=========================================="
  ls -lh build/assets/*.js | tail -2
  
  echo ""
  echo "🔄 5. RECARGANDO NGINX Y LIMPIANDO CACHE DEL NAVEGADOR"
  echo "=========================================="
  sudo systemctl reload nginx
  
  echo ""
  echo "🎉 ================================================"
  echo "🎉 CORRECCIÓN APLICADA"
  echo "🎉 ================================================"
  echo ""
  echo "🌐 IMPORTANTE: Abre https://app.bigartist.es/finances"
  echo ""
  echo "⚠️  DEBES LIMPIAR LA CACHE DEL NAVEGADOR:"
  echo "   - Chrome/Edge: Ctrl + Shift + R (o Cmd + Shift + R en Mac)"
  echo "   - Firefox: Ctrl + F5 (o Cmd + Shift + R en Mac)"
  echo "   - Safari: Cmd + Option + R"
  echo ""
  echo "O también puedes:"
  echo "   1. Abrir en modo incógnito/privado"
  echo "   2. Ir a DevTools (F12) → Network → Marcar 'Disable cache'"
  echo ""
  echo "✨ Las cajas deberían verse correctamente ahora"
  echo ""
else
  echo ""
  echo "❌ Error en la compilación"
  exit 1
fi
