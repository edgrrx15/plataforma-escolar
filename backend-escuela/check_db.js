const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'", (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows);
    pool.end();
});
