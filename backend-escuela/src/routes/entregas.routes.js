const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// endpoint para hacer una entrega (soporta archivo con multer)
router.post('/', upload.single('archivo'), async (req, res) => {
    const { id_tarea, id_estudiante, mensaje } = req.body;
    const archivo = req.file ? req.file.buffer : null;

    try {
        const query = `
            INSERT INTO Entregas (id_tarea, id_estudiante, contenido_entrega, archivo_adjunto)
            VALUES ($1, $2, $3, $4)
            RETURNING id_entrega, fecha_envio
        `;
        const resultado = await pool.query(query, [id_tarea, id_estudiante, mensaje || null, archivo]);

        res.status(201).json({
            success: true,
            mensaje: 'Tarea entregada exitosamente',
            entrega: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al subir la entrega:', error);
        res.status(500).json({ error: 'Error al subir la entrega' });
    }
});

// endpoint para eliminar una entrega (desenviar tarea)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM Entregas WHERE id_entrega = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Entrega no encontrada' });
        }

        res.json({ success: true, mensaje: 'Entrega eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar entrega:', error);
        res.status(500).json({ error: 'Error al eliminar entrega' });
    }
});

// endpoint para descargar el archivo de una entrega
router.get('/:id/descargar', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT archivo_adjunto FROM Entregas WHERE id_entrega = $1';
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0 || !resultado.rows[0].archivo_adjunto) {
            return res.status(404).send('Archivo no encontrado');
        }

        const buffer = resultado.rows[0].archivo_adjunto;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="entrega_\${id}"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error al descargar archivo:', error);
        res.status(500).send('Error interno');
    }
});

// endpoint (docente) para calificar una entrega
router.put('/:id/calificar', async (req, res) => {
    const { id } = req.params;
    const { calificacion, comentarios_profesor } = req.body;
    try {
        const query = `
            UPDATE Entregas
            SET calificacion = $1, comentarios_profesor = $2
            WHERE id_entrega = $3
            RETURNING *
        `;
        const resultado = await pool.query(query, [calificacion, comentarios_profesor, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Entrega no encontrada' });
        }
        res.json({ success: true, entrega: resultado.rows[0] });
    } catch (error) {
        console.error('Error al calificar entrega:', error);
        res.status(500).json({ error: 'Error al calificar' });
    }
});

module.exports = router;
