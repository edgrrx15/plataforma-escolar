const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function run() {
    try {
        // Clear existing Horario table
        await pool.query('DELETE FROM Horario');

        // Fetch all classes with their materia credits
        const clases = await pool.query(`
            SELECT c.id_clase, m.creditos 
            FROM Clases c 
            JOIN Materia m ON c.id_mat = m.id_mat
        `);

        // Obtener un aula por defecto
        const aulaRes = await pool.query('SELECT id_aula FROM Aula LIMIT 1');
        const id_aula = aulaRes.rows[0]?.id_aula || 1;
        const horaInicio = '07:00:00'; // According to the screenshot it shows 07:00
        const horaFin = '09:00:00';

        let count = 0;
        for (const clase of clases.rows) {
            const creditos = clase.creditos;
            let dias = [];
            if (creditos === 4) {
                dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves'];
            } else if (creditos === 5) {
                dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
            } else if (creditos > 0) {
                const todosLosDias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
                dias = todosLosDias.slice(0, creditos);
            }

            for (const dia of dias) {
                await pool.query(
                    'INSERT INTO Horario (id_clase, id_aula, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4, $5)',
                    [clase.id_clase, id_aula, dia, horaInicio, horaFin]
                );
                count++;
            }
        }
        console.log(`Horarios fixed for all existing classes! Inserted ${count} records.`);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
