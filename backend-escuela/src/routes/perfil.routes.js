const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// endpoint para el perfil del usuario
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        let query = `
            SELECT 
                e.nombre,
                e.apellido,
                e.email,
                e.telefono,
                e.direccion,
                to_char(e.fecha_nacimiento, 'DD/MM/YYYY') AS fecha_nacimiento,
                to_char(e.fecha_ingreso, 'DD/MM/YYYY') AS fecha_ingreso,
                e.estado,
                SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales
            FROM estudiantes e 
        `;
        const params = [];
        if (email) {
            query += ` WHERE e.email = $1 `;
            params.push(email);
        }
        query += ` LIMIT 1;`;

        const resultado = await pool.query(query, params);
        if (resultado.rows.length > 0) {
            res.json(resultado.rows[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        res.status(500).json({ error: 'Error al obtener datos del perfil' });
    }
});

router.put('/', upload.single('foto'), async (req, res) => {
    const { email, telefono, direccion, fecha_nacimiento } = req.body;
    let foto = null;
    if (req.file) {
        foto = req.file.buffer;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let updateQuery = `UPDATE estudiantes SET telefono = $1, direccion = $2, fecha_nacimiento = $3`;
        let params = [telefono, direccion, fecha_nacimiento];

        if (foto) {
            updateQuery += `, foto = $4 WHERE email = $5 RETURNING *`;
            params.push(foto, email);
        } else {
            updateQuery += ` WHERE email = $4 RETURNING *`;
            params.push(email);
        }

        let resultado = await client.query(updateQuery, params);

        if (resultado.rowCount === 0) {
            let updateQueryDocentes = `UPDATE docentes SET telefono = $1, direccion = $2, fecha_nacimiento = $3`;
            let paramsDocentes = [telefono, direccion, fecha_nacimiento];

            if (foto) {
                updateQueryDocentes += `, foto = $4 WHERE email = $5 RETURNING *`;
                paramsDocentes.push(foto, email);
            } else {
                updateQueryDocentes += ` WHERE email = $4 RETURNING *`;
                paramsDocentes.push(email);
            }

            try {
                resultado = await client.query(updateQueryDocentes, paramsDocentes);
            } catch (errDocente) {
                console.error("Error actualizando docente:", errDocente);
            }
        }

        await client.query('COMMIT');

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado o correo incorrecto' });
        }

        const usuarioActualizado = { ...resultado.rows[0] };
        delete usuarioActualizado.foto;

        res.json({ success: true, usuario: usuarioActualizado });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    } finally {
        client.release();
    }
});

module.exports = router;
