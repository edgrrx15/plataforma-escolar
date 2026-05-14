const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//se carga la configuración de las variables de entorno desde el archivo .env
require('dotenv').config();

// se obtienen las crendenciales de la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
})

app.get('/', (req, res) => {
    res.send('hola si sirvo');
});



//se agrega la ruta para el inicio de sesión
// Ruta corregida para el inicio de sesión
app.post('/api/login', async (req, res) => {
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
                    apellido: usuarioLogeado.apellido
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

//obtener las clases de la tabla y juntarlas con la tabla de docentes para que me traiga el nombre del docente

app.get('/api/clases', async (req, res) => {
    try {
        const query = `
              SELECT 
        c.id_clase,
        c.codigo_acceso,
        c.periodo,
        c.anio,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        m.creditos,
        d.nombre AS profesor_nombre,
        d.apellido AS profesor_apellido,
        -- Agrupamos los horarios y aulas en un arreglo JSON
        COALESCE(
            json_agg(
                json_build_object(
                    'dia', h.dia_semana,
                    'hora_inicio', h.hora_inicio,
                    'hora_fin', h.hora_fin,
                    'edificio', a.edificio,
                    'aula', a.numero
                )
            ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
        ) AS horarios
    FROM Clases c
    JOIN Materia m ON c.id_mat = m.id_mat
    JOIN Docentes d ON c.id_profesor = d.id_profesor
    LEFT JOIN Horario h ON c.id_clase = h.id_clase
    LEFT JOIN Aula a ON h.id_aula = a.id_aula
    GROUP BY 
    c.id_clase, 
    c.codigo_acceso, 
    c.periodo, 
    c.anio, 
    m.nombre, 
    m.codigo, 
    m.creditos, 
    d.nombre, 
    d.apellido;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener las clases:', error);
        res.status(500).json({ error: 'Error al obtener las clases' });
    }
});

//endpoint para crear clases
app.post('/api/clases', async (req, res) => {
    const { nombre, id_profesor, horario, alumnos, tareas, promedio } = req.body;
    try {
        const query = 'INSERT INTO clases (nombre, id_profesor, horario, alumnos, tareas, promedio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const resultado = await pool.query(query, [nombre, id_profesor, horario, alumnos, tareas, promedio]);

        //para verificar que se guardó la clase
        console.log('Clase creada exitosamente');
        res.status(201).json({ success: true, mensaje: 'Clase creada exitosamente', clase: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear la clase:', error);
        res.status(500).json({ error: 'Error al crear la clase' });
    }
});


// endpoint para el dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const { email } = req.query;

        // 0. Obtener usuario
        let usuario = { nombre_usuario: 'Usuario Desconocido', iniciales: 'U' };
        try {
            let userQuery = `
                SELECT 
                    e.nombre || ' ' || e.apellido AS nombre_usuario,
                    SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales
                FROM estudiantes e 
            `;
            const params = [];
            if (email) {
                userQuery += ` WHERE e.email = $1 `;
                params.push(email);
            }
            userQuery += ` LIMIT 1;`;

            const userRes = await pool.query(userQuery, params);
            if(userRes.rows.length > 0) {
                usuario = userRes.rows[0];
            }
        } catch(e) {}

        // 1. Obtener materias
        const materiasQuery = `
            SELECT 
                c.id_clase,
                m.nombre AS nombre,
                d.nombre || ' ' || d.apellido AS docente,
                -- Simular un progreso aleatorio o fijo para la UI
                floor(random() * 40 + 60)::int AS progreso
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            LIMIT 4;
        `;
        const materiasRes = await pool.query(materiasQuery);

        // 2. Obtener tareas pendientes
        const tareasQuery = `
            SELECT 
                t.id_tarea,
                t.titulo,
                m.nombre AS materia,
                to_char(t.fecha_vencimiento, 'DD Mon · HH12:MI AM') AS fecha
            FROM tareas t
            JOIN Clases c ON t.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            ORDER BY t.fecha_vencimiento ASC
            LIMIT 4;
        `;
        let tareasRes;
        try {
            tareasRes = await pool.query(tareasQuery);
        } catch (e) {
            // Si no hay tabla tareas u ocurre un error, enviar vacío
            tareasRes = { rows: [] };
        }

        // 3. Obtener eventos (horarios)
        const eventosQuery = `
            SELECT 
                'Clase de ' || m.nombre AS titulo,
                to_char(h.hora_inicio, 'HH12:MI AM') || ' - ' || to_char(h.hora_fin, 'HH12:MI AM') AS hora
            FROM horario h
            JOIN Clases c ON h.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            LIMIT 3;
        `;
        let eventosRes;
        try {
             eventosRes = await pool.query(eventosQuery);
        } catch (e) {
             eventosRes = { rows: [] };
        }

        // 4. Estadísticas
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM Clases) AS materias_activas,
                (SELECT COUNT(*) FROM entregas) AS tareas_entregadas,
                92 AS promedio_general,
                (SELECT COUNT(*) FROM horario) AS eventos_hoy
        `;
        let statsRes;
        try {
            statsRes = await pool.query(statsQuery);
        } catch (e) {
            statsRes = { rows: [{ materias_activas: 8, tareas_entregadas: 12, promedio_general: 92, eventos_hoy: 3 }] };
        }

        res.json({
            nombre_usuario: usuario.nombre_usuario,
            iniciales: usuario.iniciales,
            materias: materiasRes.rows,
            tareas: tareasRes.rows,
            eventos: eventosRes.rows,
            stats: statsRes.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener los datos del dashboard' });
    }
});

// endpoint para el perfil del usuario
app.get('/api/perfil', async (req, res) => {
    try {
        const { email } = req.query;

        let query = `
            SELECT 
                e.nombre,
                e.apellido,
                e.email,
                e.telefono,
                e.direccion,
                to_char(e.fecha_nacimiento, 'DD/MM/YYYY') AS fecha_nacimiento,
                to_char(e.fecha_ingreso, 'DD/MM/YYYY') AS fecha_ingreso,
                e.estado,
                SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales
            FROM estudiantes e 
        `;
        const params = [];
        if (email) {
            query += ` WHERE e.email = $1 `;
            params.push(email);
        }
        query += ` LIMIT 1;`;

        const resultado = await pool.query(query, params);
        if (resultado.rows.length > 0) {
            res.json(resultado.rows[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        res.status(500).json({ error: 'Error al obtener datos del perfil' });
    }
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

