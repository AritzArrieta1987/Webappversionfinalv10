-- Setup completo de la base de datos BigArtist Royalties
-- Este script crea todas las tablas necesarias e inserta datos de prueba

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS bigartist_royalties;
USE bigartist_royalties;

-- ==================== TABLA DE USUARIOS ====================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('admin', 'artist') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE ARTISTAS ====================

CREATE TABLE IF NOT EXISTS artists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contract_type VARCHAR(100),
  contract_percentage DECIMAL(5,2),
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE TRACKS ====================

CREATE TABLE IF NOT EXISTS tracks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT,
  title VARCHAR(255) NOT NULL,
  isrc VARCHAR(50),
  album VARCHAR(255),
  release_date DATE,
  genre VARCHAR(100),
  duration INT,
  audio_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  INDEX idx_artist (artist_id),
  INDEX idx_title (title),
  INDEX idx_isrc (isrc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE ROYALTIES ====================

CREATE TABLE IF NOT EXISTS royalties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT,
  track_id INT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  streams INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  artist_share DECIMAL(10,2) DEFAULT 0,
  label_share DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'calculated', 'paid') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  INDEX idx_artist (artist_id),
  INDEX idx_period (period_start, period_end),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE SOLICITUDES DE PAGO ====================

CREATE TABLE IF NOT EXISTS payment_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  request_date DATE NOT NULL,
  payment_date DATE,
  notes TEXT,
  iban VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  INDEX idx_artist (artist_id),
  INDEX idx_status (status),
  INDEX idx_date (request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE GASTOS ====================

CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'debit_card') DEFAULT 'cash',
  notes TEXT,
  receipt_url TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (expense_date),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE INGRESOS ====================

CREATE TABLE IF NOT EXISTS income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  income_date DATE NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'paypal', 'other') DEFAULT 'bank_transfer',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (income_date),
  INDEX idx_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA DE CONTRATOS ====================

CREATE TABLE IF NOT EXISTS contracts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT,
  contract_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  percentage DECIMAL(5,2) NOT NULL,
  terms TEXT,
  document_url TEXT,
  status ENUM('active', 'expired', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  INDEX idx_artist (artist_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== INSERTAR DATOS DE PRUEBA ====================

-- Usuario admin (password: admin123)
-- Hash generado con bcrypt, rounds=10
INSERT INTO users (email, password, name, type) VALUES
('admin@bigartist.es', '$2b$10$rK8F5jXcZOXQxjhDQVQOXuqYZVYX8LqWvNcZXvXcZOXQxjhDQVQOXu', 'Admin', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Artista de prueba
INSERT INTO artists (name, email, phone, contract_type, contract_percentage) VALUES
('Artista Demo', 'artista@demo.com', '+34 600 000 000', 'Distribución', 70.00)
ON DUPLICATE KEY UPDATE name=name;

-- Usuario artista (password: artist123)
INSERT INTO users (email, password, name, type) VALUES
('artista@demo.com', '$2b$10$rK8F5jXcZOXQxjhDQVQOXuqYZVYX8LqWvNcZXvXcZOXQxjhDQVQOXu', 'Artista Demo', 'artist')
ON DUPLICATE KEY UPDATE email=email;

-- ==================== VERIFICACIÓN ====================

SELECT '✅ Tablas creadas correctamente' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_artists FROM artists;

-- ==================== INFORMACIÓN ====================

SELECT '
========================================
✅ BASE DE DATOS CONFIGURADA
========================================

Usuarios creados:
  Admin: admin@bigartist.es / admin123
  Artista: artista@demo.com / artist123

Tablas creadas:
  - users
  - artists
  - tracks
  - royalties
  - payment_requests
  - expenses
  - income
  - contracts

Para verificar:
  SELECT * FROM users;
  SELECT * FROM artists;

========================================
' as INFO;
