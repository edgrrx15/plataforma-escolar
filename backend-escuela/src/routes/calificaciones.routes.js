const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// endpoint para obtener las calificaciones
router.get('/', async (req, res) => {
    try {
        const { id_estudiante, id_profesor } = req.query;

        if (id_estudiante) {
            const query = `
                SELECT 
                    cal.id_calificacion,
                    cal.id_estudiante,
                    cal.id_clase,
                    m.nombre AS materia_nombre,
                    cal.calificacion,
                    cal.observaciones
                FROM Calificaciones cal
                JOIN Clases c ON cal.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                WHERE cal.id_estudiante = $1
            `;
            const result = await pool.query(query, [id_estudiante]);
            res.json(result.rows);
        } else if (id_profesor) {
            const query = `
                SELECT 
                    cal.id_calificacion,
                    cal.id_estudiante,
                    cal.id_clase,
                    m.nombre AS materia_nombre,
                    cal.calificacion,
                    cal.observaciones,
                    e.nombre AS estudiante_nombre,
                    e.apellido AS estudiante_apellido
                FROM Calificaciones cal
                JOIN Clases c ON cal.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN Estudiantes e ON cal.id_estudiante = e.id_estudiante
                WHERE c.id_profesor = $1
            `;
            const result = await pool.query(query, [id_profesor]);
            res.json(result.rows);
        } else {
            res.status(400).json({ error: 'Se requiere id_estudiante o id_profesor' });
        }
    } catch (error) {
        console.error('Error al obtener las calificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Registrar calificación
router.post('/', async (req, res) => {
    const { id_estudiante, id_clase, calificacion, observaciones } = req.body;
    try {
        const query = `
            INSERT INTO Calificaciones (id_estudiante, id_clase, calificacion, observaciones)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [id_estudiante, id_clase, calificacion, observaciones]);
        res.status(201).json({ success: true, calificacion: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar calificacion:', error);
        res.status(500).json({ error: 'Error al registrar la calificación' });
    }
});

// Modificar calificación
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { calificacion, observaciones } = req.body;
    try {
        const query = `
            UPDATE Calificaciones
            SET calificacion = $1, observaciones = $2
            WHERE id_calificacion = $3
            RETURNING *
        `;
        const result = await pool.query(query, [calificacion, observaciones, id]);
        res.json({ success: true, calificacion: result.rows[0] });
    } catch (error) {
        console.error('Error al modificar calificacion:', error);
        res.status(500).json({ error: 'Error al modificar la calificación' });
    }
});

// Eliminar calificación
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM Calificaciones WHERE id_calificacion = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Calificación no encontrada' });
        }
        res.json({ success: true, mensaje: 'Calificación eliminada' });
    } catch (error) {
        console.error('Error al eliminar calificacion:', error);
        res.status(500).json({ error: 'Error al eliminar la calificación' });
    }
});

module.exports = router;
