const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener métricas y reportes según el rol del usuario
router.get('/', async (req, res) => {
    try {
        const { rol, id_profesor, id_estudiante } = req.query;

        // Estructura de respuesta por defecto
        const reportes = {
            promedio_general: null,
            top_estudiantes_global: [],
            top_estudiantes_materia: [],
            top_materias: [],
            peores_materias: []
        };

        // --- 1. PROMEDIO GENERAL ESCOLAR (ADMIN) ---
        if (rol === 'admin' || rol === 'administrador') {
            const promGenRes = await pool.query('SELECT ROUND(AVG(calificacion), 1) AS promedio FROM Calificaciones');
            reportes.promedio_general = promGenRes.rows[0]?.promedio ? parseFloat(promGenRes.rows[0].promedio) : 0;
        }

        // --- 2. TOP 5 DE MEJORES PROMEDIOS DE ALUMNOS (ADMIN/DOCENTE/ESTUDIANTE) ---
        let topGlobalQuery = '';
        let topGlobalParams = [];

        if (rol === 'admin' || rol === 'administrador') {
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id, e.nombre, e.apellido, e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal ON e.id_estudiante = cal.id_estudiante
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;
        } else if (rol === 'docente' && id_profesor) {
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id, e.nombre, e.apellido, e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal ON e.id_estudiante = cal.id_estudiante
                JOIN Clases c ON cal.id_clase = c.id_clase
                WHERE c.id_profesor = $1
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;
            topGlobalParams.push(id_profesor);
        } else if (rol === 'estudiante' && id_estudiante) {
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id, e.nombre, e.apellido, e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal ON e.id_estudiante = cal.id_estudiante
                WHERE cal.id_clase IN (
                    SELECT id_clase FROM Inscripcion WHERE id_estudiante = $1 AND estado = TRUE
                )
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;
            topGlobalParams.push(id_estudiante);
        }

        if (topGlobalQuery) {
            const topGlobalRes = await pool.query(topGlobalQuery, topGlobalParams);
            reportes.top_estudiantes_global = topGlobalRes.rows;
        }

        // --- 3. TOP DE MEJORES ESTUDIANTES POR MATERIA/GRUPO (ADMIN/DOCENTE/ESTUDIANTE) ---
        let topMateriaQuery = '';
        let topMateriaParams = [];

        if (rol === 'admin' || rol === 'administrador') {
            topMateriaQuery = `
                WITH max_cal AS (
                    SELECT id_clase, MAX(calificacion) AS max_nota
                    FROM Calificaciones
                    GROUP BY id_clase
                )
                SELECT DISTINCT ON (c.id_clase)
                    m.nombre AS materia,
                    c.id_clase,
                    e.nombre || ' ' || e.apellido AS estudiante,
                    ROUND(cal.calificacion, 1) AS calificacion
                FROM Calificaciones cal
                JOIN Estudiantes e ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c ON cal.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN max_cal mc ON cal.id_clase = mc.id_clase AND cal.calificacion = mc.max_nota
                ORDER BY c.id_clase, calificacion DESC;
            `;
        } else if (rol === 'docente' && id_profesor) {
            topMateriaQuery = `
                WITH max_cal AS (
                    SELECT id_clase, MAX(calificacion) AS max_nota
                    FROM Calificaciones
                    GROUP BY id_clase
                )
                SELECT DISTINCT ON (c.id_clase)
                    m.nombre AS materia,
                    c.id_clase,
                    e.nombre || ' ' || e.apellido AS estudiante,
                    ROUND(cal.calificacion, 1) AS calificacion
                FROM Calificaciones cal
                JOIN Estudiantes e ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c ON cal.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN max_cal mc ON cal.id_clase = mc.id_clase AND cal.calificacion = mc.max_nota
                WHERE c.id_profesor = $1
                ORDER BY c.id_clase, calificacion DESC;
            `;
            topMateriaParams.push(id_profesor);
        } else if (rol === 'estudiante' && id_estudiante) {
            topMateriaQuery = `
                WITH max_cal AS (
                    SELECT id_clase, MAX(calificacion) AS max_nota
                    FROM Calificaciones
                    GROUP BY id_clase
                )
                SELECT DISTINCT ON (c.id_clase)
                    m.nombre AS materia,
                    c.id_clase,
                    e.nombre || ' ' || e.apellido AS estudiante,
                    ROUND(cal.calificacion, 1) AS calificacion
                FROM Calificaciones cal
                JOIN Estudiantes e ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c ON cal.id_clase = c.id_clase
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN max_cal mc ON cal.id_clase = mc.id_clase AND cal.calificacion = mc.max_nota
                WHERE c.id_clase IN (
                    SELECT id_clase FROM Inscripcion WHERE id_estudiante = $1 AND estado = TRUE
                )
                ORDER BY c.id_clase, calificacion DESC;
            `;
            topMateriaParams.push(id_estudiante);
        }

        if (topMateriaQuery) {
            const topMateriaRes = await pool.query(topMateriaQuery, topMateriaParams);
            reportes.top_estudiantes_materia = topMateriaRes.rows;
        }

        // --- 4. TOP MATERIAS CON MEJOR PROMEDIO Y PEORES PROMEDIOS (ADMIN/DOCENTE) ---
        let materiasQuery = '';
        let materiasParams = [];

        if (rol === 'admin' || rol === 'administrador') {
            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN Calificaciones cal ON c.id_clase = cal.id_clase
                GROUP BY m.nombre, c.id_clase
            `;
        } else if (rol === 'docente' && id_profesor) {
            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN Calificaciones cal ON c.id_clase = cal.id_clase
                WHERE c.id_profesor = $1
                GROUP BY m.nombre, c.id_clase
            `;
            materiasParams.push(id_profesor);
        } else if (rol === 'estudiante' && id_estudiante) {
            // Un estudiante también puede ver el promedio de las materias que cursa
            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m ON c.id_mat = m.id_mat
                JOIN Calificaciones cal ON c.id_clase = cal.id_clase
                WHERE c.id_clase IN (
                    SELECT id_clase FROM Inscripcion WHERE id_estudiante = $1 AND estado = TRUE
                )
                GROUP BY m.nombre, c.id_clase
            `;
            materiasParams.push(id_estudiante);
        }

        if (materiasQuery) {
            // Top materias
            const topMateriasQuery = `${materiasQuery} ORDER BY promedio DESC LIMIT 5;`;
            const topMateriasRes = await pool.query(topMateriasQuery, materiasParams);
            reportes.top_materias = topMateriasRes.rows;

            // Peores materias
            const peoresMateriasQuery = `${materiasQuery} ORDER BY promedio ASC LIMIT 3;`;
            const peoresMateriasRes = await pool.query(peoresMateriasQuery, materiasParams);
            reportes.peores_materias = peoresMateriasRes.rows;
        }

        res.json(reportes);

    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas de la base de datos' });
    }
});

module.exports = router;
