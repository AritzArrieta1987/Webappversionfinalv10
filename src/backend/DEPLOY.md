# 🚀 Deploy del Backend de Finanzas

## Paso 1: Subir archivos a GitHub

Desde tu máquina local:

```bash
cd /ruta/de/tu/proyecto
git add backend/
git commit -m "feat: Backend completo de finanzas con solicitudes de pago, gastos e ingresos"
git push origin main
```

## Paso 2: Conectar al servidor y actualizar

```bash
ssh root@94.143.141.241
```

## Paso 3: Actualizar código del backend

```bash
cd /root/bigartist-backend

# Si es la primera vez, clonar
git clone https://github.com/TU_USUARIO/TU_REPO.git backend-update
cp -r backend-update/backend/* .
rm -rf backend-update

# O si ya existe, hacer pull
git pull origin main
```

## Paso 4: Crear las tablas en MySQL

```bash
mysql -u root -proot2024 bigartist_royalties < /root/bigartist-backend/database/finances_schema.sql
```

## Paso 5: Actualizar server.js

Editar `/root/bigartist-backend/server.js` y agregar:

```javascript
const financesRoutes = require('./routes/finances');
app.use('/api/finances', financesRoutes);
```

## Paso 6: Reiniciar el backend

```bash
pm2 restart bigartist-backend
pm2 logs bigartist-backend --lines 20
```

## Paso 7: Verificar

Probar endpoint de salud:

```bash
curl https://app.bigartist.es/api/finances/stats
```

## 🎯 Comando Todo-en-Uno

```bash
ssh root@94.143.141.241 << 'EOF'
cd /root/bigartist-backend

echo "📥 Descargando código..."
# Aquí irías tu git pull

echo "🗄️  Creando tablas..."
mysql -u root -proot2024 bigartist_royalties << 'SQL'
-- Copiar contenido de finances_schema.sql aquí
SQL

echo "📝 Actualizando server.js..."
# Verificar si ya está agregado
if ! grep -q "financesRoutes" server.js; then
  sed -i "/const authRoutes/a const financesRoutes = require('./routes/finances');" server.js
  sed -i "/app.use('\/api\/auth'/a app.use('/api/finances', financesRoutes);" server.js
fi

echo "🔄 Reiniciando..."
pm2 restart bigartist-backend

echo "✅ Deploy completado!"
pm2 logs bigartist-backend --lines 10 --nostream
EOF
```

## ✅ Verificación Post-Deploy

1. Verificar que PM2 está corriendo:
   ```bash
   pm2 list
   ```

2. Ver logs en tiempo real:
   ```bash
   pm2 logs bigartist-backend
   ```

3. Probar endpoints:
   ```bash
   curl -X GET https://app.bigartist.es/api/finances/stats
   curl -X GET https://app.bigartist.es/api/finances/contracts
   ```

## 🔧 Troubleshooting

### Error: "Cannot find module './routes/finances'"

```bash
# Verificar que el archivo existe
ls -la /root/bigartist-backend/routes/finances.js

# Si no existe, copiar desde el repositorio
```

### Error: "Table doesn't exist"

```bash
# Verificar tablas creadas
mysql -u root -proot2024 bigartist_royalties -e "SHOW TABLES;"

# Recrear tablas
mysql -u root -proot2024 bigartist_royalties < /root/bigartist-backend/database/finances_schema.sql
```

### Error: "Cannot connect to database"

```bash
# Verificar configuración de database.js
cat /root/bigartist-backend/config/database.js

# Verificar conexión MySQL
mysql -u root -proot2024 -e "SELECT 1;"
```

## 📊 Estado del Sistema

Después del deploy, verifica:

- ✅ Tablas creadas en MySQL
- ✅ Backend reiniciado sin errores
- ✅ Endpoints respondiendo correctamente
- ✅ Logs sin errores

```bash
# Ver estado completo
echo "=== PM2 Status ==="
pm2 list

echo "=== Tablas MySQL ==="
mysql -u root -proot2024 bigartist_royalties -e "SHOW TABLES;"

echo "=== Últimos Logs ==="
pm2 logs bigartist-backend --lines 20 --nostream
```
