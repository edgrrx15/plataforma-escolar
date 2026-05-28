const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// endpoint para crear un anuncio
router.post('/', async (req, res) => {
    const { id_clase, titulo, descripcion, id_profesor } = req.body;
    try {
        const query = `
            INSERT INTO Anuncios (id_clase, titulo, descripcion, id_profesor)
            VALUES ($1, $2, $3, $4)
            RETURNING id_anuncio, fecha_publicacion
        `;
        const resultado = await pool.query(query, [id_clase, titulo, descripcion, id_profesor]);
        res.status(201).json({ success: true, anuncio: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear anuncio:', error);
        res.status(500).json({ error: 'Error al crear anuncio' });
    }
});

module.exports = router;
