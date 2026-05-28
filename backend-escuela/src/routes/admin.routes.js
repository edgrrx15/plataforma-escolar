const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- Endpoints de Administrador --- //

// 1. Estadísticas para el Dashboard Admin
router.get('/stats', async (req, res) => {
    try {
        const queryAlumnos = 'SELECT COUNT(*) FROM Estudiantes';
        const queryDocentes = 'SELECT COUNT(*) FROM Docentes';
        const queryClases = 'SELECT COUNT(*) FROM Clases';
        // Supongamos que los eventos próximos son las clases de hoy en la tabla Horario
        const queryEventos = "SELECT COUNT(*) FROM Horario WHERE dia_semana = 'Lunes'"; // Simplificado

        const [alumnos, docentes, clases, eventos] = await Promise.all([
            pool.query(queryAlumnos),
            pool.query(queryDocentes),
            pool.query(queryClases),
            pool.query(queryEventos)
        ]);

        res.json({
            total_alumnos: parseInt(alumnos.rows[0].count),
            total_docentes: parseInt(docentes.rows[0].count),
            clases_activas: parseInt(clases.rows[0].count),
            eventos_proximos: parseInt(eventos.rows[0].count)
        });
    } catch (error) {
        console.error('Error al obtener stats admin:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas del administrador' });
    }
});

// 2. Lista unificada de Usuarios (Alumnos + Docentes)
router.get('/usuarios', async (req, res) => {
    try {
        const query = `
            SELECT id_estudiante AS id, nombre, apellido, email, estado, 'Alumno' AS rol
            FROM Estudiantes
            UNION ALL
            SELECT id_profesor AS id, nombre, apellido, email, TRUE AS estado, 'Docente' AS rol
            FROM Docentes
            ORDER BY nombre, apellido;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener usuarios admin:', error);
        res.status(500).json({ error: 'Error al obtener usuarios para el administrador' });
    }
});

// 3. Crear Usuario (Alumno o Docente)
router.post('/usuarios', async (req, res) => {
    const { nombre, apellido, email, telefono, fecha_nacimiento, contrasena, rol, id_clase } = req.body;
    
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        let idEstudiante = null;
        let idProfesor = null;

        // Validar si el email ya existe en Usuarios, Estudiantes o Docentes
        const checkEmail = await client.query(`
            SELECT email FROM (
                SELECT email FROM Usuarios WHERE email = $1
                UNION
                SELECT email FROM Estudiantes WHERE email = $1
                UNION
                SELECT email FROM Docentes WHERE email = $1
            ) AS emails
        `, [email]);
        if (checkEmail.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo electrónico ya está registrado o en uso' });
        }

        if (rol === 'alumno' || rol === 'estudiante') {
            const queryEstudiante = `
                INSERT INTO Estudiantes (nombre, apellido, email, telefono, fecha_nacimiento, estado, fecha_ingreso)
                VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_DATE)
                RETURNING id_estudiante
            `;
            const resultEstudiante = await client.query(queryEstudiante, [nombre, apellido, email, telefono || null, fecha_nacimiento || null]);
            idEstudiante = resultEstudiante.rows[0].id_estudiante;

            // Inscribir a la clase si se seleccionó una
            if (id_clase) {
                const queryInscripcion = `INSERT INTO Inscripcion (id_clase, id_estudiante, estado) VALUES ($1, $2, TRUE)`;
                await client.query(queryInscripcion, [id_clase, idEstudiante]);
            }
        } else if (rol === 'docente' || rol === 'profesor') {
            const queryDocente = `
                INSERT INTO Docentes (nombre, apellido, email, telefono)
                VALUES ($1, $2, $3, $4)
                RETURNING id_profesor
            `;
            const resultDocente = await client.query(queryDocente, [nombre, apellido, email, telefono || null]);
            idProfesor = resultDocente.rows[0].id_profesor;
        }

        // Crear credenciales de inicio de sesión
        const queryUsuario = `
            INSERT INTO Usuarios (email, password_hash, rol, id_estudiante, id_profesor)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_usuario
        `;
        // Nota: En un sistema real se debe hacer hash a la contraseña (ej. bcrypt), 
        // aquí usamos texto plano según la arquitectura actual (password_hash).
        await client.query(queryUsuario, [email, contrasena, rol === 'docente' ? 'docente' : 'estudiante', idEstudiante, idProfesor]);

        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                id: idEstudiante || idProfesor,
                nombre,
                apellido,
                email,
                rol: rol === 'docente' ? 'Docente' : 'Alumno',
                estado: true
            }
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al registrar al usuario' });
    } finally {
        if (client) client.release();
    }
});

// 4. Catálogo completo de Clases para el Admin
router.get('/clases', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                m.nombre AS materia_nombre, m.codigo AS materia_codigo,
                d.nombre AS profesor_nombre, d.apellido AS profesor_apellido,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia_semana, 'hora_inicio', h.hora_inicio, 'hora_fin', h.hora_fin
                        )
                    ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
                ) AS horarios
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            LEFT JOIN Horario h ON c.id_clase = h.id_clase
            GROUP BY c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                     m.nombre, m.codigo, d.nombre, d.apellido
            ORDER BY m.nombre ASC;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener clases admin:', error);
        res.status(500).json({ error: 'Error al obtener clases para el administrador' });
    }
});

module.exports = router;
