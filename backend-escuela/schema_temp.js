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
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clases'");
        console.log('Clases columns:', res.rows);
        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'materia'");
        console.log('Materia columns:', res2.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

querySchema();
