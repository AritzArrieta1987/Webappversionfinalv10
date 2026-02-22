#!/bin/bash

echo "🚀 Desplegando corrección de UploadPage al servidor..."

# Subir archivo corregido
scp /pages/UploadPage.tsx root@94.143.141.241:/var/www/bigartist/src/pages/UploadPage.tsx

# Compilar en el servidor
ssh root@94.143.141.241 << 'ENDSSH'
cd /var/www/bigartist
npm run build
echo "✅ Build completado"
ls -lah /var/www/bigartist/build/assets/index-*.js
ENDSSH

echo "✅ Despliegue completado. Prueba en https://app.bigartist.es"
