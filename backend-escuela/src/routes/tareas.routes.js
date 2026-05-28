const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// endpoint para detalles de una tarea específica
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { estudianteId, profesorId } = req.query;

    try {
        const tareaQuery = 'SELECT id_clase FROM Tareas WHERE id_tarea = $1';
        const tareaRes = await pool.query(tareaQuery, [id]);
        if (tareaRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        const id_clase = tareaRes.rows[0].id_clase;

        if (estudianteId) {
            const checkQuery = 'SELECT * FROM Inscripcion WHERE id_clase = $1 AND id_estudiante = $2 AND estado = TRUE';
            const checkRes = await pool.query(checkQuery, [id_clase, estudianteId]);
            if (checkRes.rows.length === 0) {
                return res.status(403).json({ error: 'No tienes acceso a las tareas de esta clase' });
            }
        } else if (profesorId) {
            const checkQuery = 'SELECT * FROM Clases WHERE id_clase = $1 AND id_profesor = $2';
            const checkRes = await pool.query(checkQuery, [id_clase, profesorId]);
            if (checkRes.rows.length === 0) {
                return res.status(403).json({ error: 'No eres el docente de esta clase' });
            }
        } else {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere autenticación.' });
        }

        const query = `
            SELECT t.*, c.codigo_acceso, m.nombre AS materia_nombre, 
                   d.nombre AS profesor_nombre, d.apellido AS profesor_apellido
            FROM Tareas t
            JOIN Clases c ON t.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            WHERE t.id_tarea = $1
        `;
        const resultado = await pool.query(query, [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al obtener detalle de la tarea:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// endpoint para obtener todas las tareas de un usuario
router.get('/', async (req, res) => {
    const { estudianteId, profesorId } = req.query;
    try {
        if (estudianteId) {
            const query = `
                SELECT 
                    t.id_tarea, t.titulo, t.descripcion, t.fecha_vencimiento, t.puntos_maximos,
                    c.id_clase, m.nombre AS materia_nombre, 
                    e.id_entrega, e.calificacion, e.fecha_envio
                FROM Tareas t
                JOIN Clases c ON t.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN Inscripcion i ON c.id_clase = i.id_clase
                LEFT JOIN Entregas e ON t.id_tarea = e.id_tarea AND e.id_estudiante = $1
                WHERE i.id_estudiante = $1 AND i.estado = TRUE
                ORDER BY t.fecha_vencimiento ASC NULLS LAST;
            `;
            const result = await pool.query(query, [estudianteId]);
            res.json(result.rows);
        } else if (profesorId) {
            const query = `
                SELECT 
                    t.id_tarea, t.titulo, t.descripcion, t.fecha_vencimiento, t.puntos_maximos,
                    c.id_clase, m.nombre AS materia_nombre
                FROM Tareas t
                JOIN Clases c ON t.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                WHERE c.id_profesor = $1
                ORDER BY t.fecha_vencimiento ASC NULLS LAST;
            `;
            const result = await pool.query(query, [profesorId]);
            res.json(result.rows);
        } else {
            res.status(400).json({ error: 'Se requiere estudianteId o profesorId' });
        }
    } catch (error) {
        console.error('Error al obtener la lista global de tareas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// endpoint (docente) para crear una tarea
router.post('/', async (req, res) => {
    const { id_clase, titulo, descripcion, puntos_maximos, fecha_vencimiento } = req.body;
    try {
        const query = `
            INSERT INTO Tareas (id_clase, titulo, descripcion, puntos_maximos, fecha_vencimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const result = await pool.query(query, [id_clase, titulo, descripcion, puntos_maximos || 100, fecha_vencimiento || null]);
        res.status(201).json({ success: true, tarea: result.rows[0] });
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

// endpoint (docente) para editar una tarea
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, puntos_maximos, fecha_vencimiento } = req.body;
    try {
        const query = `
            UPDATE Tareas
            SET titulo = COALESCE($1, titulo),
                descripcion = COALESCE($2, descripcion),
                puntos_maximos = COALESCE($3, puntos_maximos),
                fecha_vencimiento = COALESCE($4, fecha_vencimiento)
            WHERE id_tarea = $5 RETURNING *
        `;
        const result = await pool.query(query, [titulo, descripcion, puntos_maximos, fecha_vencimiento, id]);
        res.json({ success: true, tarea: result.rows[0] });
    } catch (error) {
        console.error('Error al editar tarea:', error);
        res.status(500).json({ error: 'Error al editar tarea' });
    }
});

// endpoint para verificar si hay entrega de un estudiante en una tarea
router.get('/:id/entrega', async (req, res) => {
    const { id } = req.params;
    const { estudianteId } = req.query;
    try {
        const query = `
            SELECT id_entrega, fecha_envio, contenido_entrega, calificacion, comentarios_profesor
            FROM Entregas
            WHERE id_tarea = $1 AND id_estudiante = $2
        `;
        const resultado = await pool.query(query, [id, estudianteId]);
        if (resultado.rows.length > 0) {
            res.json({ entregada: true, entrega: resultado.rows[0] });
        } else {
            res.json({ entregada: false });
        }
    } catch (error) {
        console.error('Error al verificar entrega:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// endpoint (docente) para ver todas las entregas de una tarea
router.get('/:id/entregas', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                e.id_estudiante, e.nombre, e.apellido, e.email,
                SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales,
                en.id_entrega, en.fecha_envio, en.contenido_entrega, en.calificacion, en.comentarios_profesor,
                CASE WHEN en.archivo_adjunto IS NOT NULL THEN true ELSE false END AS tiene_archivo
            FROM Inscripcion i
            JOIN Estudiantes e ON i.id_estudiante = e.id_estudiante
            JOIN Tareas t ON i.id_clase = t.id_clase AND t.id_tarea = $1
            LEFT JOIN Entregas en ON e.id_estudiante = en.id_estudiante AND en.id_tarea = $1
            WHERE i.estado = TRUE
        `;
        const resultado = await pool.query(query, [id]);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener lista de alumnos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
