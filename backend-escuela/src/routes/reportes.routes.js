const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Endpoint para obtener métricas y reportes según el rol del usuario
router.get('/', async (req, res) => {

    try {

        // Obtiene los datos enviados en la query
        const { rol, id_profesor, id_estudiante } = req.query;

        // Estructura inicial de los reportes
        const reportes = {
            promedio_general: null,
            top_estudiantes_global: [],
            top_estudiantes_materia: [],
            top_materias: [],
            peores_materias: []
        };

        // =========================================================
        // 1. PROMEDIO GENERAL ESCOLAR (SOLO ADMINISTRADOR)
        // =========================================================

        if (rol === 'admin' || rol === 'administrador') {

            // Consulta para calcular el promedio general de todas las calificaciones
            const promGenRes = await pool.query(
                'SELECT ROUND(AVG(calificacion), 1) AS promedio FROM Calificaciones'
            );

            // Guarda el promedio general
            reportes.promedio_general = promGenRes.rows[0]?.promedio
                ? parseFloat(promGenRes.rows[0].promedio)
                : 0;
        }

        // =========================================================
        // 2. TOP 5 DE ESTUDIANTES CON MEJOR PROMEDIO
        // =========================================================

        // Variables para construir la consulta dinámicamente
        let topGlobalQuery = '';
        let topGlobalParams = [];

        // Si el usuario es administrador
        if (rol === 'admin' || rol === 'administrador') {

            // Consulta para obtener los 5 mejores estudiantes del sistema
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id,
                    e.nombre,
                    e.apellido,
                    e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal 
                    ON e.id_estudiante = cal.id_estudiante
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;

            // Si el usuario es docente
        } else if (rol === 'docente' && id_profesor) {

            // Consulta para obtener los mejores estudiantes de sus clases
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id,
                    e.nombre,
                    e.apellido,
                    e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal 
                    ON e.id_estudiante = cal.id_estudiante
                JOIN Clases c 
                    ON cal.id_clase = c.id_clase
                WHERE c.id_profesor = $1
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;

            // Agrega el id del profesor a los parámetros
            topGlobalParams.push(id_profesor);

            // Si el usuario es estudiante
        } else if (rol === 'estudiante' && id_estudiante) {

            // Consulta para ver los mejores promedios de las clases donde está inscrito
            topGlobalQuery = `
                SELECT 
                    e.id_estudiante AS id,
                    e.nombre,
                    e.apellido,
                    e.email,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Estudiantes e
                JOIN Calificaciones cal 
                    ON e.id_estudiante = cal.id_estudiante
                WHERE cal.id_clase IN (
                    SELECT id_clase
                    FROM Inscripcion
                    WHERE id_estudiante = $1
                    AND estado = TRUE
                )
                GROUP BY e.id_estudiante, e.nombre, e.apellido, e.email
                ORDER BY promedio DESC
                LIMIT 5;
            `;

            // Agrega el id del estudiante a los parámetros
            topGlobalParams.push(id_estudiante);
        }

        // Ejecuta la consulta si existe
        if (topGlobalQuery) {

            const topGlobalRes = await pool.query(
                topGlobalQuery,
                topGlobalParams
            );

            // Guarda el resultado
            reportes.top_estudiantes_global = topGlobalRes.rows;
        }

        // =========================================================
        // 3. MEJOR ESTUDIANTE POR MATERIA O GRUPO
        // =========================================================

        let topMateriaQuery = '';
        let topMateriaParams = [];

        // Caso administrador
        if (rol === 'admin' || rol === 'administrador') {

            topMateriaQuery = `
                WITH max_cal AS (

                    -- Obtiene la calificación máxima por clase
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
                JOIN Estudiantes e 
                    ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c 
                    ON cal.id_clase = c.id_clase
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN max_cal mc 
                    ON cal.id_clase = mc.id_clase
                    AND cal.calificacion = mc.max_nota

                ORDER BY c.id_clase, calificacion DESC;
            `;

            // Caso docente
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
                JOIN Estudiantes e 
                    ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c 
                    ON cal.id_clase = c.id_clase
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN max_cal mc 
                    ON cal.id_clase = mc.id_clase
                    AND cal.calificacion = mc.max_nota

                WHERE c.id_profesor = $1

                ORDER BY c.id_clase, calificacion DESC;
            `;

            topMateriaParams.push(id_profesor);

            // Caso estudiante
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
                JOIN Estudiantes e 
                    ON cal.id_estudiante = e.id_estudiante
                JOIN Clases c 
                    ON cal.id_clase = c.id_clase
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN max_cal mc 
                    ON cal.id_clase = mc.id_clase
                    AND cal.calificacion = mc.max_nota

                WHERE c.id_clase IN (
                    SELECT id_clase
                    FROM Inscripcion
                    WHERE id_estudiante = $1
                    AND estado = TRUE
                )

                ORDER BY c.id_clase, calificacion DESC;
            `;

            topMateriaParams.push(id_estudiante);
        }

        // Ejecuta la consulta
        if (topMateriaQuery) {

            const topMateriaRes = await pool.query(
                topMateriaQuery,
                topMateriaParams
            );

            // Guarda resultados
            reportes.top_estudiantes_materia = topMateriaRes.rows;
        }

        // =========================================================
        // 4. TOP Y PEORES MATERIAS SEGÚN PROMEDIO
        // =========================================================

        let materiasQuery = '';
        let materiasParams = [];

        // Caso administrador
        if (rol === 'admin' || rol === 'administrador') {

            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN Calificaciones cal 
                    ON c.id_clase = cal.id_clase
                GROUP BY m.nombre, c.id_clase
            `;

            // Caso docente
        } else if (rol === 'docente' && id_profesor) {

            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN Calificaciones cal 
                    ON c.id_clase = cal.id_clase
                WHERE c.id_profesor = $1
                GROUP BY m.nombre, c.id_clase
            `;

            materiasParams.push(id_profesor);

            // Caso estudiante
        } else if (rol === 'estudiante' && id_estudiante) {

            materiasQuery = `
                SELECT 
                    m.nombre AS materia,
                    ROUND(AVG(cal.calificacion), 1) AS promedio
                FROM Clases c
                JOIN Materia m 
                    ON c.id_mat = m.id_mat
                JOIN Calificaciones cal 
                    ON c.id_clase = cal.id_clase
                WHERE c.id_clase IN (
                    SELECT id_clase
                    FROM Inscripcion
                    WHERE id_estudiante = $1
                    AND estado = TRUE
                )
                GROUP BY m.nombre, c.id_clase
            `;

            materiasParams.push(id_estudiante);
        }

        // Ejecuta consultas de materias
        if (materiasQuery) {

            // Consulta para mejores materias
            const topMateriasQuery = `
                ${materiasQuery}
                ORDER BY promedio DESC
                LIMIT 5;
            `;

            const topMateriasRes = await pool.query(
                topMateriasQuery,
                materiasParams
            );

            // Guarda mejores materias
            reportes.top_materias = topMateriasRes.rows;

            // Consulta para peores materias
            const peoresMateriasQuery = `
                ${materiasQuery}
                ORDER BY promedio ASC
                LIMIT 3;
            `;

            const peoresMateriasRes = await pool.query(
                peoresMateriasQuery,
                materiasParams
            );

            // Guarda peores materias
            reportes.peores_materias = peoresMateriasRes.rows;
        }

        // Devuelve todos los reportes en formato JSON
        res.json(reportes);

    } catch (error) {

        // Muestra error en consola
        console.error('Error al obtener reportes:', error);

        // Respuesta de error del servidor
        res.status(500).json({
            error: 'Error al obtener estadísticas de la base de datos'
        });
    }
});

// Exporta el router
module.exports = router;