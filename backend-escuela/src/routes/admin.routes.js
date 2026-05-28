const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const xlsx = require('xlsx');

// Configuración de multer en memoria para procesar archivos excel/csv
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Endpoints de Administrador --- //

// 1. Estadísticas para el Dashboard Admin
router.get('/stats', async (req, res) => {
    try {
        const queryAlumnos = 'SELECT COUNT(*) FROM Estudiantes';
        const queryDocentes = 'SELECT COUNT(*) FROM Docentes';
        const queryClases = 'SELECT COUNT(*) FROM Clases';
        // Supongamos que los eventos próximos son las clases de hoy en la tabla Horario
        const queryEventos = "SELECT COUNT(*) FROM Horario WHERE dia_semana = 'Lunes'"; // Simplificado

        const [alumnos, docentes, clases, eventos] = await Promise.all([
            pool.query(queryAlumnos),
            pool.query(queryDocentes),
            pool.query(queryClases),
            pool.query(queryEventos)
        ]);

        res.json({
            total_alumnos: parseInt(alumnos.rows[0].count),
            total_docentes: parseInt(docentes.rows[0].count),
            clases_activas: parseInt(clases.rows[0].count),
            eventos_proximos: parseInt(eventos.rows[0].count)
        });
    } catch (error) {
        console.error('Error al obtener stats admin:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas del administrador' });
    }
});

// 2. Lista unificada de Usuarios (Alumnos + Docentes + Admins)
router.get('/usuarios', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id_usuario,
                e.id_estudiante AS id, 
                e.nombre, 
                e.apellido, 
                e.email, 
                e.estado, 
                CASE COALESCE(u.rol, 'estudiante')
                    WHEN 'admin' THEN 'Administrador'
                    WHEN 'docente' THEN 'Docente'
                    ELSE 'Alumno'
                END AS rol
            FROM Estudiantes e
            LEFT JOIN Usuarios u ON e.id_estudiante = u.id_estudiante
            
            UNION ALL
            
            SELECT 
                u.id_usuario,
                d.id_profesor AS id, 
                d.nombre, 
                d.apellido, 
                d.email, 
                TRUE AS estado, 
                CASE COALESCE(u.rol, 'docente')
                    WHEN 'admin' THEN 'Administrador'
                    WHEN 'docente' THEN 'Docente'
                    ELSE 'Alumno'
                END AS rol
            FROM Docentes d
            LEFT JOIN Usuarios u ON d.id_profesor = u.id_profesor
            
            ORDER BY nombre, apellido;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener usuarios admin:', error);
        res.status(500).json({ error: 'Error al obtener usuarios para el administrador' });
    }
});

// 3. Crear Usuario (Alumno, Docente o Administrador)
router.post('/usuarios', async (req, res) => {
    // Los parametros se reciben desde el frontend.
    const { nombre, apellido, email, telefono, fecha_nacimiento, contrasena, rol, id_clase } = req.body;

    // Crear un cliente para la transacción.
    let client;
    try {
        // se inicia una transacción para garantizar la integridad de los datos.
        client = await pool.connect();
        await client.query('BEGIN');

        // Declaracion de variables para almacenar los IDs.
        let idEstudiante = null;
        let idProfesor = null;

        // Validar si el email ya existe en Usuarios, Estudiantes o Docentes
        const checkEmail = await client.query(`
            SELECT email FROM (
                SELECT email FROM Usuarios WHERE email = $1
                UNION
                SELECT email FROM Estudiantes WHERE email = $1
                UNION
                SELECT email FROM Docentes WHERE email = $1
            ) AS emails
        `, [email]);
        if (checkEmail.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo electrónico ya está registrado o en uso' });
        }

        const normalizedRol = String(rol || 'alumno').toLowerCase().trim();

        if (normalizedRol === 'alumno' || normalizedRol === 'estudiante') {
            const queryEstudiante = `
                INSERT INTO Estudiantes (nombre, apellido, email, telefono, fecha_nacimiento, estado, fecha_ingreso)
                VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_DATE)
                RETURNING id_estudiante
            `;
            const resultEstudiante = await client.query(queryEstudiante, [nombre, apellido, email, telefono || null, fecha_nacimiento || null]);
            idEstudiante = resultEstudiante.rows[0].id_estudiante;

            // Inscribir a la clase si se seleccionó una
            if (id_clase) {
                const queryInscripcion = `INSERT INTO Inscripcion (id_clase, id_estudiante, estado) VALUES ($1, $2, TRUE)`;
                await client.query(queryInscripcion, [id_clase, idEstudiante]);
            }
        } else if (normalizedRol === 'docente' || normalizedRol === 'profesor' || normalizedRol === 'admin' || normalizedRol === 'administrador') {
            // Guardamos a los administradores en Docentes para que tengan un perfil vinculado con Nombre/Apellido
            const queryDocente = `
                INSERT INTO Docentes (nombre, apellido, email, telefono)
                VALUES ($1, $2, $3, $4)
                RETURNING id_profesor
            `;
            const resultDocente = await client.query(queryDocente, [nombre, apellido, email, telefono || null]);
            idProfesor = resultDocente.rows[0].id_profesor;
        }

        // Crear credenciales de inicio de sesión
        const queryUsuario = `
            INSERT INTO Usuarios (email, password_hash, rol, id_estudiante, id_profesor)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_usuario
        `;

        let dbRol = 'estudiante';
        if (normalizedRol === 'admin' || normalizedRol === 'administrador') {
            dbRol = 'admin';
        } else if (normalizedRol === 'docente' || normalizedRol === 'profesor') {
            dbRol = 'docente';
        }

        await client.query(queryUsuario, [email, contrasena, dbRol, idEstudiante, idProfesor]);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                id: idEstudiante || idProfesor,
                nombre,
                apellido,
                email,
                rol: dbRol === 'admin' ? 'Administrador' : (dbRol === 'docente' ? 'Docente' : 'Alumno'),
                estado: true
            }
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al registrar al usuario' });
    } finally {
        if (client) client.release();
    }
});

// 3.1. Editar Usuario (Alumno, Docente o Administrador)
router.put('/usuarios/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    const { nombre, apellido, email, telefono, rol, contrasena } = req.body;

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Obtener usuario actual
        const userRes = await client.query('SELECT * FROM Usuarios WHERE id_usuario = $1', [id_usuario]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const usuario = userRes.rows[0];

        // Validar si el email ya está en uso por OTRO usuario
        const checkEmail = await client.query(`
            SELECT email FROM (
                SELECT email FROM Usuarios WHERE email = $1 AND id_usuario <> $2
                UNION
                SELECT email FROM Estudiantes WHERE email = $1 AND id_estudiante <> $3
                UNION
                SELECT email FROM Docentes WHERE email = $1 AND id_profesor <> $4
            ) AS emails
        `, [email, id_usuario, usuario.id_estudiante || -1, usuario.id_profesor || -1]);

        if (checkEmail.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'El correo electrónico ya está registrado o en uso por otro usuario' });
        }

        // Determinar rol de base de datos
        let dbRol = 'estudiante';
        const normalizedRol = String(rol || '').toLowerCase().trim();
        if (normalizedRol === 'admin' || normalizedRol === 'administrador') {
            dbRol = 'admin';
        } else if (normalizedRol === 'docente' || normalizedRol === 'profesor') {
            dbRol = 'docente';
        }

        // Actualizar tabla Usuarios
        let queryUser = `
            UPDATE Usuarios 
            SET email = $1, rol = $2
        `;
        const paramsUser = [email, dbRol, id_usuario];

        if (contrasena) {
            queryUser += `, password_hash = $4 WHERE id_usuario = $3`;
            paramsUser.push(contrasena);
        } else {
            queryUser += ` WHERE id_usuario = $3`;
        }
        await client.query(queryUser, paramsUser);

        // Actualizar perfiles correspondientes
        if (usuario.id_estudiante) {
            const queryEst = `
                UPDATE Estudiantes
                SET nombre = $1, apellido = $2, email = $3, telefono = $4
                WHERE id_estudiante = $5
            `;
            await client.query(queryEst, [nombre, apellido, email, telefono || null, usuario.id_estudiante]);
        } else if (usuario.id_profesor) {
            const queryDoc = `
                UPDATE Docentes
                SET nombre = $1, apellido = $2, email = $3, telefono = $4
                WHERE id_profesor = $5
            `;
            await client.query(queryDoc, [nombre, apellido, email, telefono || null, usuario.id_profesor]);
        }

        await client.query('COMMIT');
        res.json({ success: true, mensaje: 'Usuario actualizado exitosamente' });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al editar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    } finally {
        if (client) client.release();
    }
});

// 3.2. Eliminar Usuario
router.delete('/usuarios/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Obtener usuario actual
        const userRes = await client.query('SELECT * FROM Usuarios WHERE id_usuario = $1', [id_usuario]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const usuario = userRes.rows[0];

        // 1. Eliminar de la tabla Usuarios
        await client.query('DELETE FROM Usuarios WHERE id_usuario = $1', [id_usuario]);

        // 2. Eliminar del perfil correspondiente
        if (usuario.id_estudiante) {
            // Eliminar inscripciones y calificaciones asociadas
            await client.query('DELETE FROM Inscripcion WHERE id_estudiante = $1', [usuario.id_estudiante]);
            await client.query('DELETE FROM Calificaciones WHERE id_estudiante = $1', [usuario.id_estudiante]);
            await client.query('DELETE FROM Entregas WHERE id_estudiante = $1', [usuario.id_estudiante]);
            await client.query('DELETE FROM Estudiantes WHERE id_estudiante = $1', [usuario.id_estudiante]);
        } else if (usuario.id_profesor) {
            // Eliminar anuncios, tareas, etc.
            await client.query('DELETE FROM Anuncios WHERE id_profesor = $1', [usuario.id_profesor]);
            await client.query('DELETE FROM Docentes WHERE id_profesor = $1', [usuario.id_profesor]);
        }

        await client.query('COMMIT');
        res.json({ success: true, mensaje: 'Usuario eliminado exitosamente' });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    } finally {
        if (client) client.release();
    }
});

// 4. Catálogo completo de Clases para el Admin
router.get('/clases', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                m.nombre AS materia_nombre, m.codigo AS materia_codigo,
                d.nombre AS profesor_nombre, d.apellido AS profesor_apellido,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia_semana, 'hora_inicio', h.hora_inicio, 'hora_fin', h.hora_fin
                        )
                    ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
                ) AS horarios
            FROM Clases c
            JOIN Materia m ON c.id_mat = m.id_mat
            JOIN Docentes d ON c.id_profesor = d.id_profesor
            LEFT JOIN Horario h ON c.id_clase = h.id_clase
            GROUP BY c.id_clase, c.codigo_acceso, c.periodo, c.anio,
                     m.nombre, m.codigo, d.nombre, d.apellido
            ORDER BY m.nombre ASC;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener clases admin:', error);
        res.status(500).json({ error: 'Error al obtener clases para el administrador' });
    }
});

// 5. Importación masiva de usuarios desde Excel/CSV
router.post('/usuarios/importar', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    let client;
    try {
        // Leer el archivo desde el buffer usando xlsx
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const rawRows = xlsx.utils.sheet_to_json(sheet);
        if (rawRows.length === 0) {
            return res.status(400).json({ error: 'El archivo Excel está vacío o no tiene el formato correcto.' });
        }

        client = await pool.connect();
        await client.query('BEGIN');

        let importadosCount = 0;

        for (const row of rawRows) {
            // Mapear campos tolerando mayúsculas, minúsculas y acentos comunes
            const nombre = row.Nombre || row.nombre || row.NOMBRE || '';
            const apellido = row.Apellido || row.apellido || row.APELLIDO || '';
            const email = row.Email || row.email || row.EMAIL || row.Correo || row.correo || '';
            const rol = (row.Rol || row.rol || row.ROL || 'alumno').toLowerCase().trim();
            const contrasena = String(row.Contrasena || row.contrasena || row.CONTRASENA || row.Password || row.password || '123456');
            const telefono = row.Telefono || row.telefono || row.TELEFONO || null;

            let fecha_nacimiento = row.Fecha_Nacimiento || row.fecha_nacimiento || row.FechaNacimiento || null;
            // Manejar formato de fecha de Excel si viene como número
            if (typeof fecha_nacimiento === 'number') {
                const dateObj = xlsx.SSF.parse_date_code(fecha_nacimiento);
                if (dateObj) {
                    fecha_nacimiento = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
                }
            }

            // Validar campos requeridos mínimos
            if (!nombre || !apellido || !email) {
                continue; // Saltamos filas vacías o incompletas
            }

            // Comprobar si el email ya existe en alguna de las 3 tablas de usuarios
            const checkEmail = await client.query(`
                SELECT email FROM (
                    SELECT email FROM Usuarios WHERE email = $1
                    UNION
                    SELECT email FROM Estudiantes WHERE email = $1
                    UNION
                    SELECT email FROM Docentes WHERE email = $1
                ) AS emails
            `, [email]);

            if (checkEmail.rows.length > 0) {
                continue; // Evitar abortar toda la transacción si un correo ya existe, simplemente lo salta
            }

            let idEstudiante = null;
            let idProfesor = null;

            if (rol === 'alumno' || rol === 'estudiante') {
                const queryEstudiante = `
                    INSERT INTO Estudiantes (nombre, apellido, email, telefono, fecha_nacimiento, estado, fecha_ingreso)
                    VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_DATE)
                    RETURNING id_estudiante
                `;
                const resultEstudiante = await client.query(queryEstudiante, [nombre, apellido, email, telefono, fecha_nacimiento]);
                idEstudiante = resultEstudiante.rows[0].id_estudiante;
            } else if (rol === 'docente' || rol === 'profesor' || rol === 'admin' || rol === 'administrador') {
                const queryDocente = `
                    INSERT INTO Docentes (nombre, apellido, email, telefono)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id_profesor
                `;
                const resultDocente = await client.query(queryDocente, [nombre, apellido, email, telefono]);
                idProfesor = resultDocente.rows[0].id_profesor;
            }

            // Crear las credenciales correspondientes en la tabla Usuarios
            const queryUsuario = `
                INSERT INTO Usuarios (email, password_hash, rol, id_estudiante, id_profesor)
                VALUES ($1, $2, $3, $4, $5)
            `;
            let dbRol = 'estudiante';
            if (rol === 'admin' || rol === 'administrador') {
                dbRol = 'admin';
            } else if (rol === 'docente' || rol === 'profesor') {
                dbRol = 'docente';
            }

            await client.query(queryUsuario, [
                email,
                contrasena,
                dbRol,
                idEstudiante,
                idProfesor
            ]);

            importadosCount++;
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, importados: importadosCount });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error al importar usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar el archivo Excel' });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
