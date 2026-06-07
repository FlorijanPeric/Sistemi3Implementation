require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../config/db');

async function run() {
  const [result] = await pool.query(
    `UPDATE uporabnik SET geslo = 'admin123' WHERE e_posta = 'admin@flowers.local'`
  );
  console.log(result.affectedRows ? 'Admin password reset to admin123' : 'Admin user not found');
  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
