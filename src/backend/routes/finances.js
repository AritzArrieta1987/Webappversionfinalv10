const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// SOLICITUDES DE PAGO
// ============================================

// Obtener todas las solicitudes de pago
router.get('/payment-requests', async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT 
        sp.*,
        u.nombre as artist_name,
        u.email as artist_email,
        u.foto_perfil as artist_photo
      FROM solicitudes_pago sp
      JOIN usuarios u ON sp.usuario_id = u.id
      ORDER BY sp.fecha_solicitud DESC
    `);

    res.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
        artistId: r.usuario_id,
        artistName: r.artist_name,
        artistEmail: r.artist_email,
        artistPhoto: r.artist_photo,
        amount: parseFloat(r.monto),
        firstName: r.nombre_beneficiario,
        lastName: r.apellido_beneficiario,
        accountNumber: r.numero_cuenta,
        bank: r.banco,
        concept: r.concepto,
        status: r.estado,
        date: r.fecha_solicitud,
        processedDate: r.fecha_procesado,
        processedBy: r.procesado_por,
        adminNotes: r.notas_admin
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de pago'
    });
  }
});

// Crear solicitud de pago (desde portal de artista)
router.post('/payment-requests', async (req, res) => {
  try {
    const {
      userId,
      amount,
      firstName,
      lastName,
      accountNumber,
      bank,
      concept
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO solicitudes_pago 
        (usuario_id, monto, nombre_beneficiario, apellido_beneficiario, numero_cuenta, banco, concepto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, amount, firstName, lastName, accountNumber, bank, concept]);

    res.json({
      success: true,
      message: 'Solicitud de pago creada exitosamente',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de pago'
    });
  }
});

// Aprobar solicitud de pago
router.put('/payment-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, notes } = req.body;

    await db.query(`
      UPDATE solicitudes_pago 
      SET 
        estado = 'completed',
        fecha_procesado = NOW(),
        procesado_por = ?,
        notas_admin = ?
      WHERE id = ?
    `, [adminId, notes, id]);

    res.json({
      success: true,
      message: 'Solicitud aprobada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error aprobando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar solicitud'
    });
  }
});

// Rechazar solicitud de pago
router.put('/payment-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, notes } = req.body;

    await db.query(`
      UPDATE solicitudes_pago 
      SET 
        estado = 'rejected',
        fecha_procesado = NOW(),
        procesado_por = ?,
        notas_admin = ?
      WHERE id = ?
    `, [adminId, notes, id]);

    res.json({
      success: true,
      message: 'Solicitud rechazada'
    });
  } catch (error) {
    console.error('❌ Error rechazando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud'
    });
  }
});

// ============================================
// GASTOS
// ============================================

// Obtener todos los gastos
router.get('/expenses', async (req, res) => {
  try {
    const { year, month, category } = req.query;
    
    let query = `
      SELECT 
        g.*,
        u.nombre as created_by_name
      FROM gastos g
      JOIN usuarios u ON g.creado_por = u.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND YEAR(g.fecha_gasto) = ?';
      params.push(year);
    }
    if (month) {
      query += ' AND MONTH(g.fecha_gasto) = ?';
      params.push(month);
    }
    if (category) {
      query += ' AND g.categoria = ?';
      params.push(category);
    }

    query += ' ORDER BY g.fecha_gasto DESC';

    const [expenses] = await db.query(query, params);

    res.json({
      success: true,
      data: expenses.map(e => ({
        id: e.id,
        category: e.categoria,
        concept: e.concepto,
        description: e.descripcion,
        amount: parseFloat(e.monto),
        date: e.fecha_gasto,
        provider: e.proveedor,
        invoiceNumber: e.numero_factura,
        paymentMethod: e.metodo_pago,
        createdBy: e.creado_por,
        createdByName: e.created_by_name,
        createdAt: e.created_at
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos'
    });
  }
});

// Crear gasto
router.post('/expenses', async (req, res) => {
  try {
    const {
      category,
      concept,
      description,
      amount,
      date,
      provider,
      invoiceNumber,
      paymentMethod,
      adminId
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO gastos 
        (categoria, concepto, descripcion, monto, fecha_gasto, proveedor, numero_factura, metodo_pago, creado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category, concept, description, amount, date, provider, invoiceNumber, paymentMethod, adminId]);

    res.json({
      success: true,
      message: 'Gasto registrado exitosamente',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('❌ Error creando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar gasto'
    });
  }
});

// Eliminar gasto
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM gastos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gasto'
    });
  }
});

// ============================================
// INGRESOS
// ============================================

// Obtener ingresos
router.get('/income', async (req, res) => {
  try {
    const { year, month, userId } = req.query;
    
    let query = `
      SELECT 
        i.*,
        u.nombre as artist_name
      FROM ingresos i
      LEFT JOIN usuarios u ON i.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      query += ' AND i.periodo_anio = ?';
      params.push(year);
    }
    if (month) {
      query += ' AND i.periodo_mes = ?';
      params.push(month);
    }
    if (userId) {
      query += ' AND i.usuario_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY i.periodo_anio DESC, i.periodo_mes DESC';

    const [income] = await db.query(query, params);

    res.json({
      success: true,
      data: income.map(i => ({
        id: i.id,
        userId: i.usuario_id,
        artistName: i.artist_name,
        platform: i.plataforma,
        month: i.periodo_mes,
        year: i.periodo_anio,
        streams: i.streams,
        revenue: parseFloat(i.revenue),
        sourceFile: i.origen_archivo,
        uploadedAt: i.fecha_carga
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos'
    });
  }
});

// ============================================
// CONTRATOS
// ============================================

// Obtener contratos
router.get('/contracts', async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT 
        c.*,
        u.nombre as artist_name,
        u.email as artist_email
      FROM contratos c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.activo = 1
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      data: contracts.map(c => ({
        id: c.id,
        userId: c.usuario_id,
        artistName: c.artist_name,
        artistEmail: c.artist_email,
        artistPercentage: parseFloat(c.porcentaje_artista),
        bamPercentage: parseFloat(c.porcentaje_bam),
        startDate: c.fecha_inicio,
        endDate: c.fecha_fin,
        active: c.activo,
        notes: c.notas,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos'
    });
  }
});

// Crear/Actualizar contrato
router.post('/contracts', async (req, res) => {
  try {
    const {
      userId,
      artistPercentage,
      bamPercentage,
      startDate,
      endDate,
      notes
    } = req.body;

    // Verificar que los porcentajes sumen 100
    if (parseFloat(artistPercentage) + parseFloat(bamPercentage) !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Los porcentajes deben sumar 100%'
      });
    }

    const [result] = await db.query(`
      INSERT INTO contratos 
        (usuario_id, porcentaje_artista, porcentaje_bam, fecha_inicio, fecha_fin, notas)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        porcentaje_artista = VALUES(porcentaje_artista),
        porcentaje_bam = VALUES(porcentaje_bam),
        fecha_fin = VALUES(fecha_fin),
        notas = VALUES(notas)
    `, [userId, artistPercentage, bamPercentage, startDate, endDate, notes]);

    res.json({
      success: true,
      message: 'Contrato guardado exitosamente',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('❌ Error guardando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar contrato'
    });
  }
});

// ============================================
// REPORTES
// ============================================

// Obtener reportes generados
router.get('/reports', async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT 
        r.*,
        u.nombre as generated_by_name
      FROM reportes r
      JOIN usuarios u ON r.generado_por = u.id
      ORDER BY r.fecha_generacion DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: reports.map(r => ({
        id: r.id,
        type: r.tipo,
        period: r.periodo,
        generatedAt: r.fecha_generacion,
        generatedBy: r.generado_por,
        generatedByName: r.generated_by_name,
        filePath: r.ruta_archivo,
        sizeMB: parseFloat(r.tamanio_mb)
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes'
    });
  }
});

// Generar reporte
router.post('/reports/generate', async (req, res) => {
  try {
    const {
      type,
      period,
      adminId
    } = req.body;

    // En producción aquí se generaría el PDF
    const fileName = `reporte_${type}_${period}_${Date.now()}.pdf`;
    const filePath = `/reports/${fileName}`;
    const sizeMB = (Math.random() * 10 + 1).toFixed(2);

    const [result] = await db.query(`
      INSERT INTO reportes 
        (tipo, periodo, generado_por, ruta_archivo, tamanio_mb)
      VALUES (?, ?, ?, ?, ?)
    `, [type, period, adminId, filePath, sizeMB]);

    res.json({
      success: true,
      message: 'Reporte generado exitosamente',
      data: {
        id: result.insertId,
        filePath,
        sizeMB: parseFloat(sizeMB)
      }
    });
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte'
    });
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

// Obtener estadísticas financieras
router.get('/stats', async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Total ingresos
    const [totalIncome] = await db.query(`
      SELECT COALESCE(SUM(revenue), 0) as total
      FROM ingresos
      WHERE periodo_anio = ? AND periodo_mes = ?
    `, [currentYear, currentMonth]);

    // Total gastos
    const [totalExpenses] = await db.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE YEAR(fecha_gasto) = ? AND MONTH(fecha_gasto) = ?
    `, [currentYear, currentMonth]);

    // Solicitudes pendientes
    const [pendingRequests] = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(monto), 0) as total
      FROM solicitudes_pago
      WHERE estado = 'pending'
    `);

    // Pagos completados este mes
    const [completedPayments] = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(monto), 0) as total
      FROM solicitudes_pago
      WHERE estado = 'completed'
        AND YEAR(fecha_procesado) = ?
        AND MONTH(fecha_procesado) = ?
    `, [currentYear, currentMonth]);

    res.json({
      success: true,
      data: {
        totalIncome: parseFloat(totalIncome[0].total),
        totalExpenses: parseFloat(totalExpenses[0].total),
        netProfit: parseFloat(totalIncome[0].total) - parseFloat(totalExpenses[0].total),
        pendingRequests: {
          count: pendingRequests[0].count,
          total: parseFloat(pendingRequests[0].total)
        },
        completedPayments: {
          count: completedPayments[0].count,
          total: parseFloat(completedPayments[0].total)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
