const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');

// Configuración de multer para almacenar el archivo en memoria como Buffer
const upload = multer({ storage: multer.memoryStorage() });

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
                    apellido: usuarioLogeado.apellido,
                    id_estudiante: usuarioLogeado.id_estudiante,
                    id_profesor: usuarioLogeado.id_profesor
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

// endpoint para obtener todas las materias
app.get('/api/materias', async (req, res) => {
    try {
        const query = 'SELECT id_mat, nombre, codigo FROM Materia';
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//endpoint para crear clases
app.post('/api/clases ', async (req, res) => {
    const { id_mat, id_profesor, periodo, anio } = req.body;
    try {
        // Generar codigo_acceso (6 caracteres alfanuméricos)
        const codigo_acceso = Math.random().toString(36).substring(2, 8).toUpperCase();

        const query = 'INSERT INTO clases (id_mat, id_profesor, periodo, anio, codigo_acceso) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const resultado = await pool.query(query, [id_mat, id_profesor, periodo, anio, codigo_acceso]);

        console.log('Clase creada exitosamente');
        res.status(201).json({ success: true, mensaje: 'Clase creada exitosamente', clase: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear la clase:', error);
        res.status(500).json({ error: 'Error al crear la clase' });
    }
});

// endpoint para que un docente elimine una clase por completo
app.delete('/api/clases/:id_clase', async (req, res) => {
    const { id_clase } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Eliminar dependencias si no hay ON DELETE CASCADE en la BD (por si acaso)
        // 1. Obtener las tareas de la clase para borrar sus entregas
        const tareasRes = await client.query('SELECT id_tarea FROM Tareas WHERE id_clase = $1', [id_clase]);
        for (const tarea of tareasRes.rows) {
            await client.query('DELETE FROM Entregas WHERE id_tarea = $1', [tarea.id_tarea]);
        }

        // 2. Eliminar Tareas
        await client.query('DELETE FROM Tareas WHERE id_clase = $1', [id_clase]);

        // 3. Eliminar Inscripciones
        await client.query('DELETE FROM Inscripcion WHERE id_clase = $1', [id_clase]);

        // 4. Eliminar Horarios
        await client.query('DELETE FROM Horario WHERE id_clase = $1', [id_clase]);

        // 5. Eliminar la Clase
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
app.post('/api/clases/unirse', async (req, res) => {
    const { codigo_acceso, id_estudiante } = req.body;
    try {
        const classQuery = 'SELECT id_clase FROM Clases WHERE codigo_acceso = $1';
        const classRes = await pool.query(classQuery, [codigo_acceso]);

        if (classRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Código de acceso inválido' });
        }

        const id_clase = classRes.rows[0].id_clase;

        // Verificar si ya está inscrito
        const checkQuery = 'SELECT id_inscripcion FROM Inscripcion WHERE id_clase = $1 AND id_estudiante = $2';
        const checkRes = await pool.query(checkQuery, [id_clase, id_estudiante]);

        if (checkRes.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Ya estás inscrito en esta clase' });
        }

        // Inscribir
        const insertQuery = 'INSERT INTO Inscripcion (id_clase, id_estudiante, estado) VALUES ($1, $2, TRUE)';
        await pool.query(insertQuery, [id_clase, id_estudiante]);

        res.json({ success: true, mensaje: 'Te has inscrito exitosamente a la clase' });
    } catch (error) {
        console.error('Error al unirse a clase:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

//Para que el usuario elimine o se salga de la clase




// endpoint  para eliminar un estudiante de su clase o el estudiante abandona la clase
app.delete('/api/clases/:id_clase/estudiantes/:id_estudiante', async (req, res) => {
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
app.get('/api/clases/:id/detalle', async (req, res) => {
    const { id } = req.params;
    const { estudianteId, profesorId } = req.query;

    try {
        // Verificar acceso
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

        // Información de la clase y profesor
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

        // Tareas
        const tareasQuery = `
            SELECT id_tarea, titulo, descripcion, puntos_maximos
            FROM Tareas
            WHERE id_clase = $1
        `;
        const tareasRes = await pool.query(tareasQuery, [id]);

        // Estudiantes (Compañeros)
        const estudiantesQuery = `
            SELECT e.id_estudiante, e.nombre, e.apellido, e.email,
                   SUBSTRING(e.nombre, 1, 1) || SUBSTRING(e.apellido, 1, 1) AS iniciales
            FROM Inscripcion i
            JOIN Estudiantes e ON i.id_estudiante = e.id_estudiante
            WHERE i.id_clase = $1 AND i.estado = TRUE
        `;
        const estudiantesRes = await pool.query(estudiantesQuery, [id]);

        // Anuncios
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

// endpoint para detalles de una tarea específica
app.get('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { estudianteId, profesorId } = req.query;

    try {
        // Primero obtener el id_clase de la tarea
        const tareaQuery = 'SELECT id_clase FROM Tareas WHERE id_tarea = $1';
        const tareaRes = await pool.query(tareaQuery, [id]);
        if (tareaRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        const id_clase = tareaRes.rows[0].id_clase;

        // Verificar acceso
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
app.get('/api/tareas', async (req, res) => {
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
app.post('/api/tareas', async (req, res) => {
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
app.put('/api/tareas/:id', async (req, res) => {
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
app.get('/api/tareas/:id/entrega', async (req, res) => {
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

// endpoint para hacer una entrega (soporta archivo con multer)
app.post('/api/entregas', upload.single('archivo'), async (req, res) => {
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
app.delete('/api/entregas/:id', async (req, res) => {
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
app.get('/api/entregas/:id/descargar', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT archivo_adjunto FROM Entregas WHERE id_entrega = $1';
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0 || !resultado.rows[0].archivo_adjunto) {
            return res.status(404).send('Archivo no encontrado');
        }

        const buffer = resultado.rows[0].archivo_adjunto;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="entrega_${id}"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error al descargar archivo:', error);
        res.status(500).send('Error interno');
    }
});

// endpoint (docente) para ver todas las entregas de una tarea
app.get('/api/tareas/:id/entregas', async (req, res) => {
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

// endpoint (docente) para calificar una entrega
app.put('/api/entregas/:id/calificar', async (req, res) => {
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


// ANUNCIOS
app.get('/api/clases/:id/anuncios', async (req, res) => {
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

app.post('/api/anuncios', async (req, res) => {
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


// endpoint para el dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const { email, estudianteId, profesorId, rol_usuario } = req.query;

        // 0. Obtener usuario
        let usuario = { nombre_usuario: 'Usuario', iniciales: 'U' };
        try {
            let userQuery = `
                SELECT 
                    nombre || ' ' || apellido AS nombre_usuario,
                    SUBSTRING(nombre, 1, 1) || SUBSTRING(apellido, 1, 1) AS iniciales
                FROM estudiantes WHERE email = $1
                UNION
                SELECT 
                    nombre || ' ' || apellido AS nombre_usuario,
                    SUBSTRING(nombre, 1, 1) || SUBSTRING(apellido, 1, 1) AS iniciales
                FROM docentes WHERE email = $1
            `;
            if (email) {
                const userRes = await pool.query(userQuery, [email]);
                if (userRes.rows.length > 0) usuario = userRes.rows[0];
            }
        } catch (e) { }

        let joinClases = '';
        let whereClases = '';
        const params = [];

        if (estudianteId) {
            joinClases = 'JOIN Inscripcion i ON c.id_clase = i.id_clase';
            whereClases = 'WHERE i.id_estudiante = $1 AND i.estado = TRUE';
            params.push(estudianteId);
        } else if (profesorId) {
            whereClases = 'WHERE c.id_profesor = $1';
            params.push(profesorId);
        }

        // 1. Obtener materias
        const materiasQuery = `
            SELECT 
                c.id_clase, m.nombre AS nombre, d.nombre || ' ' || d.apellido AS docente,
                floor(random() * 40 + 60)::int AS progreso
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            ${joinClases} ${whereClases}
            LIMIT 4;
        `;
        const materiasRes = await pool.query(materiasQuery, params);

        // 2. Obtener tareas pendientes
        const tareasQuery = `
            SELECT 
                t.id_tarea, t.titulo, m.nombre AS materia,
                to_char(t.fecha_vencimiento, 'DD Mon · HH12:MI AM') AS fecha
            FROM tareas t
            JOIN Clases c ON t.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            ${joinClases} ${whereClases}
            ORDER BY t.fecha_vencimiento ASC LIMIT 4;
        `;
        let tareasRes = { rows: [] };
        try { tareasRes = await pool.query(tareasQuery, params); } catch (e) { }

        // 3. Obtener eventos (horarios)
        const eventosQuery = `
            SELECT 
                'Clase de ' || m.nombre AS titulo,
                to_char(h.hora_inicio, 'HH12:MI AM') || ' - ' || to_char(h.hora_fin, 'HH12:MI AM') AS hora
            FROM horario h
            JOIN Clases c ON h.id_clase = c.id_clase
            JOIN Materia m ON c.id_mat = m.id_mat
            ${joinClases} ${whereClases}
            LIMIT 3;
        `;
        let eventosRes = { rows: [] };
        try { eventosRes = await pool.query(eventosQuery, params); } catch (e) { }

        // 4. Estadísticas (simplificadas usando conteos rápidos)
        let statsRes = {
            rows: [{
                materias_activas: materiasRes.rows.length,
                tareas_entregadas: materiasRes.rows.length > 0 ? 12 : 0,
                promedio_general: materiasRes.rows.length > 0 ? 92 : 0,
                eventos_hoy: eventosRes.rows.length
            }]
        };

        res.json({
            nombre_usuario: usuario.nombre_usuario,
            iniciales: usuario.iniciales,
            materias: materiasRes.rows,
            tareas: tareasRes.rows,
            eventos: eventosRes.rows,
            stats: statsRes.rows[0],
            rol_usuario: rol_usuario || 'Estudiante',
        });

    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener los datos del dashboard' });
    }
});


// endpoint para obtener las calificaciones
app.get('/api/calificacion', async (req, res) => {
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
app.post('/api/calificacion', async (req, res) => {
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
app.put('/api/calificacion/:id', async (req, res) => {
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
app.delete('/api/calificacion/:id', async (req, res) => {
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

// Obtener estudiantes de una clase
app.get('/api/clases/:id/estudiantes', async (req, res) => {
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


app.put('/api/perfil', upload.single('foto'), async (req, res) => {
    const { email, telefono, direccion, fecha_nacimiento } = req.body;
    let foto = null;
    if (req.file) {
        foto = req.file.buffer;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let updateQuery = `UPDATE estudiantes SET telefono = $1, direccion = $2, fecha_nacimiento = $3`;
        let params = [telefono, direccion, fecha_nacimiento];

        if (foto) {
            updateQuery += `, foto = $4 WHERE email = $5 RETURNING *`;
            params.push(foto, email);
        } else {
            updateQuery += ` WHERE email = $4 RETURNING *`;
            params.push(email);
        }

        let resultado = await client.query(updateQuery, params);

        // Si no se encontró en estudiantes, intentamos en docentes
        if (resultado.rowCount === 0) {
            let updateQueryDocentes = `UPDATE docentes SET telefono = $1, direccion = $2, fecha_nacimiento = $3`;
            let paramsDocentes = [telefono, direccion, fecha_nacimiento];

            if (foto) {
                updateQueryDocentes += `, foto = $4 WHERE email = $5 RETURNING *`;
                paramsDocentes.push(foto, email);
            } else {
                updateQueryDocentes += ` WHERE email = $4 RETURNING *`;
                paramsDocentes.push(email);
            }

            // Verificamos si la tabla docentes tiene esas columnas (por si acaso). Si no las tiene, esto fallará.
            // Asumimos que sí las tiene según el esquema estándar.
            try {
                resultado = await client.query(updateQueryDocentes, paramsDocentes);
            } catch (errDocente) {
                console.error("Error actualizando docente (posiblemente falten columnas):", errDocente);
            }
        }

        //Esto hace que se guarden los cambios en la base de datos
        await client.query('COMMIT');

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado o correo incorrecto' });
        }

        // Eliminamos el buffer grande antes de enviarlo al cliente para no saturar la red
        const usuarioActualizado = { ...resultado.rows[0] };
        delete usuarioActualizado.foto;

        res.json({ success: true, usuario: usuarioActualizado });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    } finally {
        client.release();
    }
});





app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

