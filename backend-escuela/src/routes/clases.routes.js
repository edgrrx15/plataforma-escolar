const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// obtener las clases de la tabla y juntarlas con la tabla de docentes para que me traiga el nombre del docente
router.get('/', async (req, res) => {
    const { estudianteId, profesorId } = req.query;
    try {
        let query = `
            SELECT 
                c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                m.nombre AS materia_nombre, m.codigo AS materia_codigo, m.creditos,
                d.nombre AS profesor_nombre, d.apellido AS profesor_apellido,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia_semana, 'hora_inicio', h.hora_inicio,
                            'hora_fin', h.hora_fin, 'edificio', a.edificio, 'aula', a.numero
                        )
                    ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
                ) AS horarios
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            LEFT JOIN Horario h ON c.id_clase = h.id_clase
            LEFT JOIN Aula a ON h.id_aula = a.id_aula
        `;

        const params = [];

        if (estudianteId) {
            query += ` JOIN Inscripcion i ON c.id_clase = i.id_clase WHERE i.id_estudiante = $1 AND i.estado = TRUE `;
            params.push(estudianteId);
        } else if (profesorId) {
            query += ` WHERE c.id_profesor = $1 `;
            params.push(profesorId);
        }

        query += `
            GROUP BY c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                     m.nombre, m.codigo, m.creditos, d.nombre, d.apellido;
        `;

        const resultado = await pool.query(query, params);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener las clases:', error);
        res.status(500).json({ error: 'Error al obtener las clases' });
    }
});

// endpoint para crear clases
router.post('/', async (req, res) => {
    const { id_mat, id_profesor, periodo, anio } = req.body;
    try {
        // Generar codigo_acceso (6 caracteres alfanuméricos)
        const codigo_acceso = Math.random().toString(36).substring(2, 8).toUpperCase();

        const query = 'INSERT INTO clases (id_mat, id_profesor, periodo, anio, codigo_acceso) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const resultado = await pool.query(query, [id_mat, id_profesor, periodo, anio, codigo_acceso]);
        const nuevaClase = resultado.rows[0];

        // Obtener creditos de la materia
        const materiaRes = await pool.query('SELECT creditos FROM Materia WHERE id_mat = $1', [id_mat]);
        const creditos = materiaRes.rows[0]?.creditos || 0;

        let dias = [];
        if (creditos === 4) {
            dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves'];
        } else if (creditos === 5) {
            dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
        } else if (creditos > 0) {
            const todosLosDias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
            dias = todosLosDias.slice(0, creditos);
        }

        if (dias.length > 0) {
            const aulaRes = await pool.query('SELECT id_aula FROM Aula LIMIT 1');
            const id_aula = aulaRes.rows[0]?.id_aula || 1;

            const horaInicio = '08:00:00';
            const horaFin = '09:00:00';

            for (const dia of dias) {
                await pool.query(
                    'INSERT INTO Horario (id_clase, id_aula, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4, $5)',
                    [nuevaClase.id_clase, id_aula, dia, horaInicio, horaFin]
                );
            }
        }

        res.status(201).json({ success: true, mensaje: 'Clase creada exitosamente', clase: nuevaClase });
    } catch (error) {
        console.error('Error al crear la clase:', error);
        res.status(500).json({ error: 'Error al crear la clase' });
    }
});

// endpoint para que un docente elimine una clase por completo
router.delete('/:id_clase', async (req, res) => {
    const { id_clase } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tareasRes = await client.query('SELECT id_tarea FROM Tareas WHERE id_clase = $1', [id_clase]);
        for (const tarea of tareasRes.rows) {
            await client.query('DELETE FROM Entregas WHERE id_tarea = $1', [tarea.id_tarea]);
        }

        await client.query('DELETE FROM Tareas WHERE id_clase = $1', [id_clase]);
        await client.query('DELETE FROM Inscripcion WHERE id_clase = $1', [id_clase]);
        await client.query('DELETE FROM Horario WHERE id_clase = $1', [id_clase]);
        await client.query('DELETE FROM Clases WHERE id_clase = $1', [id_clase]);

        await client.query('COMMIT');
        res.json({ success: true, mensaje: 'Clase eliminada permanentemente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar la clase:', error);
        res.status(500).json({ error: 'Error interno al eliminar la clase' });
    } finally {
        client.release();
    }
});

// endpoint para unirse a una clase por código
router.post('/unirse', async (req, res) => {
    const { codigo_acceso, id_estudiante } = req.body;
    try {
        const classQuery = 'SELECT id_clase FROM Clases WHERE codigo_acceso = $1';
        const classRes = await pool.query(classQuery, [codigo_acceso]);

        if (classRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Código de acceso inválido' });
        }

        const id_clase = classRes.rows[0].id_clase;

        const checkQuery = 'SELECT id_inscripcion FROM Inscripcion WHERE id_clase = $1 AND id_estudiante = $2';
        const checkRes = await pool.query(checkQuery, [id_clase, id_estudiante]);

        if (checkRes.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Ya estás inscrito en esta clase' });
        }

        const targetSchedulesQuery = `
            SELECT h.dia_semana, h.hora_inicio, h.hora_fin, m.nombre AS materia_nombre
            FROM Horario h
            JOIN Clases c ON h.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            WHERE h.id_clase = $1
        `;
        const targetSchedulesRes = await pool.query(targetSchedulesQuery, [id_clase]);
        const targetSchedules = targetSchedulesRes.rows;

        const studentSchedulesQuery = `
            SELECT h.dia_semana, h.hora_inicio, h.hora_fin, m.nombre AS materia_nombre
            FROM Inscripcion i
            JOIN Clases c ON i.id_clase = c.id_clase
            JOIN Horario h ON c.id_clase = h.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            WHERE i.id_estudiante = $1 AND i.estado = TRUE
        `;
        const studentSchedulesRes = await pool.query(studentSchedulesQuery, [id_estudiante]);
        const studentSchedules = studentSchedulesRes.rows;

        const normalizeDay = (day) => {
            if (!day) return '';
            return day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const timeToMinutes = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.split(':');
            return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
        };

        for (const targetSlot of targetSchedules) {
            const dayA = normalizeDay(targetSlot.dia_semana);
            const startA = timeToMinutes(targetSlot.hora_inicio);
            const endA = timeToMinutes(targetSlot.hora_fin);

            for (const existingSlot of studentSchedules) {
                const dayB = normalizeDay(existingSlot.dia_semana);
                if (dayA === dayB) {
                    const startB = timeToMinutes(existingSlot.hora_inicio);
                    const endB = timeToMinutes(existingSlot.hora_fin);

                    if (startA < endB && startB < endA) {
                        return res.status(400).json({
                            success: false,
                            error: `Su horario choca con otra materia: ya estás inscrito en "${existingSlot.materia_nombre}" el día ${targetSlot.dia_semana} de ${existingSlot.hora_inicio.slice(0, 5)} a ${existingSlot.hora_fin.slice(0, 5)}.`
                        });
                    }
                }
            }
        }

        const insertQuery = 'INSERT INTO Inscripcion (id_clase, id_estudiante, estado) VALUES ($1, $2, TRUE)';
        await pool.query(insertQuery, [id_clase, id_estudiante]);

        res.json({ success: true, mensaje: 'Te has inscrito exitosamente a la clase' });
    } catch (error) {
        console.error('Error al unirse a clase:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// endpoint para eliminar un estudiante de su clase
router.delete('/:id_clase/estudiantes/:id_estudiante', async (req, res) => {
    const { id_clase, id_estudiante } = req.params;
    try {
        const query = 'DELETE FROM Inscripcion WHERE id_clase = $1 AND id_estudiante = $2 RETURNING *';
        const result = await pool.query(query, [id_clase, id_estudiante]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado en la clase' });
        }
        res.json({ success: true, mensaje: 'Estudiante dado de baja' });
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// endpoint para el detalle de la clase
router.get('/:id/detalle', async (req, res) => {
    const { id } = req.params;
    const { estudianteId, profesorId } = req.query;

    try {
        if (estudianteId) {
            const checkQuery = 'SELECT * FROM Inscripcion WHERE id_clase = $1 AND id_estudiante = $2 AND estado = TRUE';
            const checkRes = await pool.query(checkQuery, [id, estudianteId]);
            if (checkRes.rows.length === 0) {
                return res.status(403).json({ error: 'No estás inscrito en esta clase' });
            }
        } else if (profesorId) {
            const checkQuery = 'SELECT * FROM Clases WHERE id_clase = $1 AND id_profesor = $2';
            const checkRes = await pool.query(checkQuery, [id, profesorId]);
            if (checkRes.rows.length === 0) {
                return res.status(403).json({ error: 'No eres el docente de esta clase' });
            }
        } else {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere autenticación.' });
        }

        const claseQuery = `
            SELECT 
                c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                m.nombre AS materia_nombre, m.codigo AS materia_codigo, m.creditos,
                d.nombre AS profesor_nombre, d.apellido AS profesor_apellido, d.email AS profesor_email,
                SUBSTRING(d.nombre, 1, 1) || SUBSTRING(d.apellido, 1, 1) AS profesor_iniciales
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            WHERE c.id_clase = $1
        `;
        const claseRes = await pool.query(claseQuery, [id]);

        if (claseRes.rows.length === 0) {
            return res.status(404).json({ error: 'Clase no encontrada' });
        }

        const claseInfo = claseRes.rows[0];

        const tareasQuery = `SELECT id_tarea, titulo, descripcion, puntos_maximos FROM Tareas WHERE id_clase = $1`;
        const tareasRes = await pool.query(tareasQuery, [id]);

        const estudiantesQuery = `
            SELECT e.id_estudiante, e.nombre, e.apellido, e.email,
                   SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales
            FROM Inscripcion i
            JOIN Estudiantes e ON i.id_estudiante = e.id_estudiante
            WHERE i.id_clase = $1 AND i.estado = TRUE
        `;
        const estudiantesRes = await pool.query(estudiantesQuery, [id]);

        const anunciosQuery = `
            SELECT a.id_anuncio, a.titulo, a.descripcion, a.fecha_publicacion,
                   d.nombre AS profesor_nombre, d.apellido AS profesor_apellido,
                   SUBSTRING(d.nombre, 1, 1) || SUBSTRING(d.apellido, 1, 1) AS profesor_iniciales
            FROM Anuncios a
            LEFT JOIN Docentes d ON a.id_profesor = d.id_profesor
            WHERE a.id_clase = $1
            ORDER BY a.fecha_publicacion DESC
        `;
        const anunciosRes = await pool.query(anunciosQuery, [id]);

        res.json({
            ...claseInfo,
            tareas: tareasRes.rows,
            estudiantes: estudiantesRes.rows,
            anuncios: anunciosRes.rows
        });
    } catch (error) {
        console.error('Error al obtener el detalle de la clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estudiantes de una clase
router.get('/:id/estudiantes', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT e.id_estudiante, e.nombre, e.apellido
            FROM Inscripcion i
            JOIN Estudiantes e ON i.id_estudiante = e.id_estudiante
            WHERE i.id_clase = $1 AND i.estado = TRUE
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener estudiantes de la clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener anuncios de una clase
router.get('/:id/anuncios', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT a.id_anuncio, a.titulo, a.descripcion, a.fecha_publicacion,
                   d.nombre AS profesor_nombre, d.apellido AS profesor_apellido,
                   SUBSTRING(d.nombre, 1, 1) || SUBSTRING(d.apellido, 1, 1) AS profesor_iniciales
            FROM Anuncios a
            LEFT JOIN Docentes d ON a.id_profesor = d.id_profesor
            WHERE a.id_clase = $1
            ORDER BY a.fecha_publicacion DESC
        `;
        const resultado = await pool.query(query, [id]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener anuncios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
