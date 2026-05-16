const { Pool } = require('pg'); 
require('dotenv').config(); 
const pool = new Pool({
  user: process.env.DB_USER, 
  host: 'localhost', 
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD, 
  port: 5432
}); 
const query = `CREATE TABLE IF NOT EXISTS Anuncios (
  id_anuncio SERIAL PRIMARY KEY, 
  id_clase INT REFERENCES Clases(id_clase) ON DELETE CASCADE, 
  id_profesor INT REFERENCES Docentes(id_profesor) ON DELETE CASCADE, 
  titulo VARCHAR(255) NOT NULL, 
  descripcion TEXT NOT NULL, 
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`; 
pool.query(query, (err, res) => { 
  if(err) console.error(err); 
  else console.log('Tabla Anuncios creada'); 
  pool.end(); 
});
