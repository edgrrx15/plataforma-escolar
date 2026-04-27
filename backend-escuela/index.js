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
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try{

        //se realiza el query a la base de datos para verificar las credenciales del usuario
        const query = 'SELECT * FROM Usuarios WHERE email = $1 AND password_hash = $2';
        const resultado = await pool.query(query, [email, password]);

        //si se encontraron resultados, se verifica si el usuario es administrador o no
        if(resultado.rows.length > 0){
            
            //se crea una constante para almacenar la información del usuario logeado
            const usuarioLogeado = resultado.rows[0];

            //se verifica si el usuario es administrador o no
            res.json({ 
                success: true,
                mensaje: 'Bienvenido',
                usuario: {
                    id: usuarioLogeado.id_usuario,
                    email: usuarioLogeado.email,
                    rol: usuarioLogeado.rol
                }
            });
        }else{
            res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
        }
    }catch(error){
        console.error('Error during login:', error);
        res.status(500).json({ success: false, mensaje: 'An error occurred during login' });
    }

});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

