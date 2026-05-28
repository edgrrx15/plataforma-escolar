const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function querySchema() {
    try {
        const est = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'estudiantes'");
        console.log('Estudiantes columns:', est.rows.map(r => r.column_name));
        const doc = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'docentes'");
        console.log('Docentes columns:', doc.rows.map(r => r.column_name));
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
querySchema();
