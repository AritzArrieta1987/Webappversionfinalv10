#!/bin/bash

echo "🔍 ================================================"
echo "🔍 VERIFICACIÓN Y COMPILACIÓN FINAL"
echo "🔍 ================================================"
echo ""

cd /var/www/bigartist

echo "📝 1. VERIFICANDO ARCHIVOS CRÍTICOS"
echo "=========================================="
echo "✓ PhysicalSalesPage.tsx:"
grep -n "Package.*color.*c9a574" pages/PhysicalSalesPage.tsx && echo "  ✅ Icono del paquete presente" || echo "  ❌ Falta icono"

echo ""
echo "✓ FinancesPage.tsx:"
ls -lh pages/FinancesPage.tsx
echo "  → Usa componente: FinancesPanel"

echo ""
echo "✓ FinancesPanel.tsx:"
ls -lh src/components/admin/FinancesPanel.tsx

echo ""
echo "🔨 2. COMPILANDO FRONTEND"
echo "=========================================="
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build exitoso"
  
  echo ""
  echo "🔄 3. RECARGANDO NGINX"
  echo "=========================================="
  sudo systemctl reload nginx
  
  echo ""
  echo "✅ Nginx recargado"
  
  echo ""
  echo "📊 4. VERIFICANDO ARCHIVOS GENERADOS"
  echo "=========================================="
  echo "Build directory:"
  ls -lh build/assets/*.js | tail -3
  
  echo ""
  echo "🎉 ================================================"
  echo "🎉 COMPILACIÓN COMPLETADA"
  echo "🎉 ================================================"
  echo ""
  echo "🌐 Accede a:"
  echo "   - https://app.bigartist.es/physical-sales (Icono del paquete)"
  echo "   - https://app.bigartist.es/finances (Página de finanzas)"
  echo ""
  echo "✅ Ambas páginas deberían mostrarse correctamente"
  echo ""
else
  echo ""
  echo "❌ Error en la compilación"
  exit 1
fi
