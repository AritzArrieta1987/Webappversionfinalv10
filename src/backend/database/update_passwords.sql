-- Script para actualizar las contraseñas de los usuarios
-- Este script debe ejecutarse después de setup.sql

USE bigartist_royalties;

-- Eliminar usuarios existentes para recrearlos con contraseñas correctas
DELETE FROM users WHERE email IN ('admin@bigartist.es', 'artista@demo.com');

-- Usuario admin
-- Email: admin@bigartist.es
-- Password: admin123
-- Hash generado con bcrypt rounds=10
INSERT INTO users (email, password, name, type) VALUES
('admin@bigartist.es', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Admin BigArtist', 'admin');

-- Usuario artista de prueba
-- Email: artista@demo.com
-- Password: artist123
-- Hash generado con bcrypt rounds=10
INSERT INTO users (email, password, name, type) VALUES
('artista@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Artista Demo', 'artist');

SELECT '✅ Contraseñas actualizadas correctamente' as status;
SELECT * FROM users;
