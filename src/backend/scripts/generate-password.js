// Script para generar hashes de contraseñas bcrypt
// Uso: node backend/scripts/generate-password.js <contraseña>

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';
const rounds = 10;

bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error generando hash:', err);
    process.exit(1);
  }
  
  console.log('\n========================================');
  console.log('🔒 Hash de contraseña generado');
  console.log('========================================');
  console.log('Contraseña:', password);
  console.log('Hash:', hash);
  console.log('========================================\n');
});
