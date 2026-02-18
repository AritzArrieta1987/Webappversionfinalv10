# Backend BigArtist Royalties - Módulo de Finanzas

## 📋 Estructura de Base de Datos

### Tablas Principales

1. **contratos** - Relación BAM-Artista con porcentajes
2. **solicitudes_pago** - Solicitudes de royalties de artistas
3. **gastos** - Registro de gastos operativos
4. **ingresos** - Tracking detallado de ingresos por plataforma
5. **reportes** - Reportes financieros generados

## 🚀 Instalación

### 1. Crear las tablas en MySQL

```bash
mysql -u root -proot2024 bigartist_royalties < backend/database/finances_schema.sql
```

### 2. Actualizar server.js

Agregar la ruta de finanzas al archivo principal:

```javascript
const financesRoutes = require('./routes/finances');
app.use('/api/finances', financesRoutes);
```

## 📡 Endpoints Disponibles

### Solicitudes de Pago

- `GET /api/finances/payment-requests` - Obtener todas las solicitudes
- `POST /api/finances/payment-requests` - Crear nueva solicitud
- `PUT /api/finances/payment-requests/:id/approve` - Aprobar solicitud
- `PUT /api/finances/payment-requests/:id/reject` - Rechazar solicitud

### Gastos

- `GET /api/finances/expenses` - Obtener gastos (filtros: year, month, category)
- `POST /api/finances/expenses` - Registrar gasto
- `DELETE /api/finances/expenses/:id` - Eliminar gasto

### Ingresos

- `GET /api/finances/income` - Obtener ingresos (filtros: year, month, userId)

### Contratos

- `GET /api/finances/contracts` - Obtener contratos activos
- `POST /api/finances/contracts` - Crear/actualizar contrato

### Reportes

- `GET /api/finances/reports` - Obtener reportes generados
- `POST /api/finances/reports/generate` - Generar nuevo reporte

### Estadísticas

- `GET /api/finances/stats` - Obtener estadísticas financieras (filtros: year, month)

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT. El token debe enviarse en el header:

```
Authorization: Bearer <token>
```

## 📊 Ejemplo de Uso

### Crear Solicitud de Pago

```javascript
POST /api/finances/payment-requests
{
  "userId": 2,
  "amount": 1500.00,
  "firstName": "Juan",
  "lastName": "García",
  "accountNumber": "ES7921000813610123456789",
  "bank": "Santander",
  "concept": "Royalties Enero 2026"
}
```

### Aprobar Solicitud

```javascript
PUT /api/finances/payment-requests/5/approve
{
  "adminId": 1,
  "notes": "Pago aprobado y procesado"
}
```

### Registrar Gasto

```javascript
POST /api/finances/expenses
{
  "category": "marketing",
  "concept": "Campaña Instagram",
  "description": "Promoción nuevo lanzamiento",
  "amount": 350.00,
  "date": "2026-02-15",
  "provider": "Meta Ads",
  "invoiceNumber": "INV-2026-0042",
  "paymentMethod": "tarjeta",
  "adminId": 1
}
```

## 🔄 Flujo de Solicitudes de Pago

1. **Artista** crea solicitud desde su portal
2. **Sistema** notifica al admin
3. **Admin** revisa y aprueba/rechaza desde panel de finanzas
4. **Sistema** actualiza estado y notifica al artista
5. **Registro** queda en historial con todos los detalles

## 📈 Estadísticas Calculadas

- Total de ingresos del período
- Total de gastos del período
- Beneficio neto (ingresos - gastos)
- Solicitudes pendientes (count + monto total)
- Pagos completados del mes (count + monto total)

## 🎯 Próximas Funcionalidades

- [ ] Generación de PDFs para reportes
- [ ] Integración con APIs bancarias
- [ ] Notificaciones por email
- [ ] Dashboard de métricas en tiempo real
- [ ] Exportar a Excel
- [ ] Gráficos avanzados
