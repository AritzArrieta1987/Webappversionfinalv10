require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://app.bigartist.es', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Configuración de MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root2024',
  database: process.env.DB_NAME || 'bigartist_royalties',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected successfully');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
}

// Helper para ejecutar queries
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query Error:', error);
    throw error;
  }
};

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bigartist_secret_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Validación adicional: Solo admin@bigartist.es puede ser admin
    if (user.type === 'admin' && email !== 'admin@bigartist.es') {
      console.log('⚠️ Intento de acceso admin desde email no autorizado:', email);
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: user.type
      },
      process.env.JWT_SECRET || 'bigartist_secret_key_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ Login exitoso para:', email, '- Tipo:', user.type);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logout exitoso' });
});

// ==================== RUTAS DE FINANZAS ====================

// GET /api/finances/stats
app.get('/api/finances/stats', authenticateToken, async (req, res) => {
  try {
    // Total de solicitudes de pago
    const [paymentRequestsTotal] = await query(
      'SELECT COUNT(*) as count FROM payment_requests WHERE status = ?',
      ['pending']
    );

    // Total de gastos del mes actual
    const [expensesTotal] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE MONTH(expense_date) = MONTH(CURRENT_DATE()) 
       AND YEAR(expense_date) = YEAR(CURRENT_DATE())`,
      []
    );

    // Total de ingresos del mes actual
    const [incomeTotal] = await query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM income 
       WHERE MONTH(income_date) = MONTH(CURRENT_DATE()) 
       AND YEAR(income_date) = YEAR(CURRENT_DATE())`,
      []
    );

    // Balance
    const balance = parseFloat(incomeTotal[0]?.total || 0) - parseFloat(expensesTotal[0]?.total || 0);

    res.json({
      success: true,
      stats: {
        pendingPayments: paymentRequestsTotal[0]?.count || 0,
        monthlyExpenses: parseFloat(expensesTotal[0]?.total || 0),
        monthlyIncome: parseFloat(incomeTotal[0]?.total || 0),
        balance: balance
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

// GET /api/finances/payment-requests
app.get('/api/finances/payment-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await query(
      `SELECT pr.*, a.name as artist_name 
       FROM payment_requests pr
       LEFT JOIN artists a ON pr.artist_id = a.id
       ORDER BY pr.created_at DESC`,
      []
    );

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Error obteniendo payment requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes de pago'
    });
  }
});

// POST /api/finances/expenses
app.post('/api/finances/expenses', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, expense_date, payment_method, notes } = req.body;

    if (!description || !amount || !category || !expense_date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const result = await query(
      `INSERT INTO expenses (description, amount, category, expense_date, payment_method, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [description, amount, category, expense_date, payment_method || 'cash', notes || '', req.user.id]
    );

    res.json({
      success: true,
      message: 'Gasto registrado correctamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Error registrando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrando el gasto'
    });
  }
});

// GET /api/finances/expenses
app.get('/api/finances/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await query(
      `SELECT e.*, u.name as created_by_name 
       FROM expenses e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.expense_date DESC
       LIMIT 100`,
      []
    );

    res.json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error('❌ Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo gastos'
    });
  }
});

// POST /api/finances/income
app.post('/api/finances/income', authenticateToken, async (req, res) => {
  try {
    const { source, amount, description, income_date, payment_method, notes } = req.body;

    if (!source || !amount || !income_date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const result = await query(
      `INSERT INTO income (source, amount, description, income_date, payment_method, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [source, amount, description || '', income_date, payment_method || 'bank_transfer', notes || '', req.user.id]
    );

    res.json({
      success: true,
      message: 'Ingreso registrado correctamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Error registrando ingreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrando el ingreso'
    });
  }
});

// GET /api/finances/income
app.get('/api/finances/income', authenticateToken, async (req, res) => {
  try {
    const income = await query(
      `SELECT i.*, u.name as created_by_name 
       FROM income i
       LEFT JOIN users u ON i.created_by = u.id
       ORDER BY i.income_date DESC
       LIMIT 100`,
      []
    );

    res.json({
      success: true,
      data: income
    });

  } catch (error) {
    console.error('❌ Error obteniendo ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ingresos'
    });
  }
});

// ==================== RUTAS DE ARTISTAS ====================

// GET /api/artists
app.get('/api/artists', authenticateToken, async (req, res) => {
  try {
    const artists = await query(
      'SELECT * FROM artists ORDER BY name ASC',
      []
    );

    res.json({
      success: true,
      data: artists
    });

  } catch (error) {
    console.error('❌ Error obteniendo artistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo artistas'
    });
  }
});

// ==================== RUTAS DE TRACKS ====================

// GET /api/tracks
app.get('/api/tracks', authenticateToken, async (req, res) => {
  try {
    const tracks = await query(
      `SELECT t.*, a.name as artist_name 
       FROM tracks t
       LEFT JOIN artists a ON t.artist_id = a.id
       ORDER BY t.release_date DESC
       LIMIT 100`,
      []
    );

    res.json({
      success: true,
      data: tracks
    });

  } catch (error) {
    console.error('❌ Error obteniendo tracks:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tracks'
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BigArtist Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Inicializar base de datos
    await initDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ======================================');
      console.log(`🚀 BigArtist Backend Server`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Database: ${dbConfig.database}`);
      console.log('🚀 ======================================');
      console.log('');
      console.log('📡 Endpoints disponibles:');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/auth/logout');
      console.log('   GET  /api/finances/stats');
      console.log('   GET  /api/finances/payment-requests');
      console.log('   POST /api/finances/expenses');
      console.log('   GET  /api/finances/expenses');
      console.log('   POST /api/finances/income');
      console.log('   GET  /api/finances/income');
      console.log('   GET  /api/artists');
      console.log('   GET  /api/tracks');
      console.log('   GET  /health');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Iniciar
startServer();

module.exports = app;