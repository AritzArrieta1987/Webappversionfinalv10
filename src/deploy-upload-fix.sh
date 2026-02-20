#!/bin/bash

echo "🚀 =================================================="
echo "🚀 DESPLEGANDO CORRECCIÓN DE UPLOAD CSV"
echo "🚀 =================================================="
echo ""

cd /var/www/bigartist || exit 1

echo "📦 Compilando frontend..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ =================================================="
  echo "✅ DESPLIEGUE EXITOSO"
  echo "✅ =================================================="
  echo ""
  echo "🌐 Abre: https://app.bigartist.es"
  echo "🔄 Presiona: Ctrl+Shift+R para recargar sin caché"
  echo "📁 Ve a: Subir CSV"
  echo "✅ Ahora podrás subir archivos CSV correctamente"
  echo ""
  echo "=================================================="
else
  echo ""
  echo "❌ Error al compilar. Revisa los errores arriba."
  exit 1
fi
