#!/bin/bash

echo "🔧 Corrigiendo error de CSV Upload en servidor..."

# Copiar los archivos corregidos al servidor
scp -i ~/.ssh/id_rsa /components/admin/IncomeSection.tsx root@94.143.141.241:/var/www/bigartist/src/components/admin/IncomeSection.tsx
scp -i ~/.ssh/id_rsa /pages/UploadPage.tsx root@94.143.141.241:/var/www/bigartist/src/pages/UploadPage.tsx

echo "✅ Archivos copiados al servidor"

# Conectar al servidor y compilar
ssh root@94.143.141.241 << 'ENDSSH'
cd /var/www/bigartist

echo "📦 Compilando frontend..."
npm run build

echo "✅ Frontend compilado correctamente"
ENDSSH

echo "🎉 Corrección completada. Intenta subir el CSV nuevamente."
