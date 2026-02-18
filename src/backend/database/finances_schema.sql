-- ============================================
-- BIGARTIST ROYALTIES - ESQUEMA DE FINANZAS
-- ============================================

USE bigartist_royalties;

-- Tabla de contratos (relación BAM-Artista)
CREATE TABLE IF NOT EXISTS contratos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  porcentaje_artista DECIMAL(5,2) NOT NULL DEFAULT 70.00,
  porcentaje_bam DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo TINYINT(1) DEFAULT 1,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_usuario_activo (usuario_id, activo)
);

-- Tabla de solicitudes de pago
CREATE TABLE IF NOT EXISTS solicitudes_pago (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  nombre_beneficiario VARCHAR(255) NOT NULL,
  apellido_beneficiario VARCHAR(255) NOT NULL,
  numero_cuenta VARCHAR(34) NOT NULL,
  banco VARCHAR(255),
  concepto TEXT,
  estado ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_procesado TIMESTAMP NULL,
  procesado_por INT NULL,
  notas_admin TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (procesado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_fecha_solicitud (fecha_solicitud)
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria ENUM('operativo', 'marketing', 'distribucion', 'legal', 'otros') NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  monto DECIMAL(12,2) NOT NULL,
  fecha_gasto DATE NOT NULL,
  proveedor VARCHAR(255),
  numero_factura VARCHAR(100),
  metodo_pago ENUM('transferencia', 'tarjeta', 'efectivo', 'otro'),
  creado_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_categoria (categoria),
  INDEX idx_fecha_gasto (fecha_gasto)
);

-- Tabla de ingresos (para tracking más detallado que CSV)
CREATE TABLE IF NOT EXISTS ingresos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  plataforma VARCHAR(100) NOT NULL,
  periodo_mes INT NOT NULL,
  periodo_anio INT NOT NULL,
  streams INT DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL,
  origen_archivo VARCHAR(255),
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_periodo (periodo_anio, periodo_mes),
  INDEX idx_usuario_periodo (usuario_id, periodo_anio, periodo_mes)
);

-- Tabla de reportes generados
CREATE TABLE IF NOT EXISTS reportes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('mensual', 'trimestral', 'anual') NOT NULL,
  periodo VARCHAR(50) NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generado_por INT NOT NULL,
  ruta_archivo VARCHAR(500),
  tamanio_mb DECIMAL(6,2),
  FOREIGN KEY (generado_por) REFERENCIAS usuarios(id) ON DELETE CASCADE,
  INDEX idx_tipo (tipo),
  INDEX idx_fecha_generacion (fecha_generacion)
);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Contratos de ejemplo
INSERT INTO contratos (usuario_id, porcentaje_artista, porcentaje_bam, fecha_inicio, activo, notas)
VALUES 
  (1, 70.00, 30.00, '2024-01-01', 1, 'Contrato estándar'),
  (2, 60.00, 40.00, '2024-01-01', 1, 'Contrato premium con BAM')
ON DUPLICATE KEY UPDATE porcentaje_artista = VALUES(porcentaje_artista);

-- Gastos de ejemplo
INSERT INTO gastos (categoria, concepto, descripcion, monto, fecha_gasto, proveedor, metodo_pago, creado_por)
VALUES 
  ('operativo', 'Servidor Cloud', 'Hosting mensual', 150.00, '2026-02-01', 'AWS', 'tarjeta', 1),
  ('marketing', 'Campaña Digital', 'Ads en redes sociales', 500.00, '2026-02-05', 'Meta Ads', 'tarjeta', 1),
  ('distribucion', 'The Orchard', 'Comisión distribución', 300.00, '2026-02-10', 'The Orchard', 'transferencia', 1),
  ('legal', 'Asesoría Legal', 'Revisión de contratos', 800.00, '2026-02-12', 'Bufete García', 'transferencia', 1);

-- Ingresos de ejemplo (complementando CSVs)
INSERT INTO ingresos (usuario_id, plataforma, periodo_mes, periodo_anio, streams, revenue)
VALUES 
  (1, 'Spotify', 1, 2026, 45000, 2500.00),
  (1, 'Apple Music', 1, 2026, 12000, 800.00),
  (2, 'Spotify', 1, 2026, 38000, 2100.00),
  (2, 'Apple Music', 1, 2026, 9500, 650.00);
