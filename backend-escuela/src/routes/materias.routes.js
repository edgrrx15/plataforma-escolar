const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// endpoint para obtener todas las materias
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT id_mat, nombre, codigo FROM Materia';
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
