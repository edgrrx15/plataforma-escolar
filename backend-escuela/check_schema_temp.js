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
        const c = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'clases'");
        console.log('Clases columns:', c.rows.map(r => r.column_name));
        const h = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'horario'");
        console.log('Horario columns:', h.rows.map(r => r.column_name));
        const a = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'aula'");
        console.log('Aula columns:', a.rows.map(r => r.column_name));
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
querySchema();
