# 🔐 Sistema de Autenticación - BIGARTIST ROYALTIES

## Descripción General

El sistema de autenticación de BIGARTIST ROYALTIES está completamente integrado con la base de datos MySQL y diferencia claramente entre dos tipos de usuarios:

- **Admin**: Acceso total al panel de administración
- **Artist**: Acceso al portal de artistas

---

## 🎯 Reglas de Acceso

### ✅ Panel de Administración (Admin Panel)
- **SOLO** el usuario `admin@bigartist.es` puede acceder
- Requiere credenciales almacenadas en la base de datos `users`
- Tipo de usuario: `admin`
- Acceso completo a todas las funcionalidades administrativas

### 🎨 Portal de Artistas (Artist Portal)
- Cualquier usuario registrado en la base de datos con `type='artist'` puede acceder
- Cada artista ve únicamente su información y finanzas
- Acceso restringido a sus propios datos

---

## 📊 Estructura de la Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Hash bcrypt
  name VARCHAR(255) NOT NULL,
  type ENUM('admin', 'artist') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔑 Credenciales de Acceso

### Usuario Administrador
```
Email: admin@bigartist.es
Password: admin123
Type: admin
```

### Usuario Artista (Demo)
```
Email: artista@demo.com
Password: artist123
Type: artist
```

---

## 🛠️ Instalación y Configuración

### 1. Configurar la Base de Datos

```bash
# Ejecutar el script de setup
mysql -u root -p < backend/database/setup.sql
```

Este script crea:
- ✅ Base de datos `bigartist_royalties`
- ✅ Todas las tablas necesarias
- ✅ Usuarios de prueba con contraseñas hasheadas

### 2. Variables de Entorno

Crear archivo `.env` en la carpeta `/backend`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root2024
DB_NAME=bigartist_royalties

# JWT Secret
JWT_SECRET=bigartist_secret_key_2024

# Server Port
PORT=3001

# Environment
NODE_ENV=production
```

### 3. Iniciar el Backend

```bash
cd backend
npm install
node server.js
```

El servidor estará corriendo en: `http://localhost:3001`

---

## 🔐 Flujo de Autenticación

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@bigartist.es",
  "password": "admin123"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@bigartist.es",
    "name": "Admin BigArtist",
    "type": "admin"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email o contraseña incorrectos"
}
```

### 2. Validación en el Frontend

```typescript
// El frontend guarda el token y datos del usuario
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Redirige según el tipo de usuario
if (user.type === 'admin') {
  // Mostrar AdminLayout
} else if (user.type === 'artist') {
  // Mostrar ArtistPortal
}
```

### 3. Protección de Rutas

Todas las rutas de API requieren autenticación mediante JWT:

```javascript
// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token no proporcionado' 
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};
```

---

## 🔒 Seguridad Implementada

### 1. Contraseñas Hasheadas
- ✅ Todas las contraseñas se almacenan con **bcrypt** (10 rounds)
- ✅ Nunca se almacenan contraseñas en texto plano
- ✅ Verificación segura con `bcrypt.compare()`

### 2. JWT Tokens
- ✅ Tokens con expiración de **7 días**
- ✅ Firmados con clave secreta
- ✅ Incluyen información del usuario (id, email, type)

### 3. Validación Estricta
- ✅ Solo `admin@bigartist.es` puede ser admin
- ✅ Verificación en backend y frontend
- ✅ Protección contra escalada de privilegios

### 4. Protección de Rutas
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Validación de tipo de usuario para operaciones sensibles
- ✅ Manejo de errores y respuestas consistentes

---

## 👤 Crear Nuevos Usuarios

### Método 1: Usando el Script de Generación de Hash

```bash
# Generar hash de contraseña
node backend/scripts/generate-password.js "miContraseña123"
```

Salida:
```
========================================
🔒 Hash de contraseña generado
========================================
Contraseña: miContraseña123
Hash: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
========================================
```

### Método 2: Insertar en la Base de Datos

```sql
-- Insertar nuevo usuario artista
INSERT INTO users (email, password, name, type) VALUES
('nuevoartista@email.com', '$2b$10$HASH_GENERADO_AQUI', 'Nombre del Artista', 'artist');
```

### Método 3: Crear Endpoint de Registro (Futuro)

```javascript
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validaciones...
  
  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Insertar usuario
  await query(
    'INSERT INTO users (email, password, name, type) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, name, 'artist']
  );
  
  res.json({ success: true, message: 'Usuario creado' });
});
```

---

## 🧪 Testing de Autenticación

### Test Manual con cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bigartist.es","password":"admin123"}'

# Usar token en request protegido
curl -X GET http://localhost:3001/api/artists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test con Postman

1. **Login:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@bigartist.es",
       "password": "admin123"
     }
     ```

2. **Request con Token:**
   - Method: GET
   - URL: `http://localhost:3001/api/artists`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`

---

## 📝 Notas Importantes

### ⚠️ Solo Admin
- El email `admin@bigartist.es` está hardcodeado como el único admin permitido
- Cualquier intento de crear otro usuario admin será rechazado en el login

### 🎨 Artistas
- Cualquier correo registrado en `users` con `type='artist'` puede acceder al portal
- Los artistas NO pueden acceder al panel de administración

### 🔄 Cambio de Contraseñas
- Se implementará próximamente en el menú de configuración
- Requerirá contraseña actual para validación
- Nuevas contraseñas se hashearán con bcrypt

---

## 🚀 Próximas Mejoras

- [ ] Sistema de recuperación de contraseña
- [ ] Endpoint de registro de nuevos artistas
- [ ] Autenticación de dos factores (2FA)
- [ ] Logs de actividad de login
- [ ] Refresh tokens para sesiones largas
- [ ] Rate limiting en endpoint de login

---

## 📞 Soporte

Para cualquier problema con la autenticación, verificar:

1. ✅ Backend corriendo en puerto 3001
2. ✅ Base de datos MySQL activa y accesible
3. ✅ Tabla `users` creada con datos de prueba
4. ✅ Variables de entorno configuradas correctamente
5. ✅ Contraseñas hasheadas correctamente con bcrypt

---

**Última actualización:** 19 de Febrero de 2026  
**Desarrollado por:** BIGARTIST ROYALTIES Team
