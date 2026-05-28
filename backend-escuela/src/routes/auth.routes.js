const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Hacemos el JOIN para obtener el nombre real de la persona
        const query = `
            SELECT 
                u.*, 
                COALESCE(e.nombre, d.nombre) AS nombre,
                COALESCE(e.apellido, d.apellido) AS apellido
            FROM Usuarios u
            LEFT JOIN Estudiantes e ON u.id_estudiante = e.id_estudiante
            LEFT JOIN Docentes d ON u.id_profesor = d.id_profesor
            WHERE u.email = $1 AND u.password_hash = $2
        `;

        const resultado = await pool.query(query, [email, password]);

        if (resultado.rows.length > 0) {
            const usuarioLogeado = resultado.rows[0];

            res.json({
                success: true,
                mensaje: 'Bienvenido',
                usuario: {
                    id: usuarioLogeado.id_usuario,
                    email: usuarioLogeado.email,
                    rol: usuarioLogeado.rol,
                    nombre: usuarioLogeado.nombre,
                    apellido: usuarioLogeado.apellido,
                    id_estudiante: usuarioLogeado.id_estudiante,
                    id_profesor: usuarioLogeado.id_profesor
                }
            });
        } else {
            res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, mensaje: 'Ha ocurrido un error durante el inicio de sesión, intente de nuevo.' });
    }
});

module.exports = router;
