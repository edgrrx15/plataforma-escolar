import { useState } from 'react';
import './App.css'; // Aquí llamamos a nuestros estilos

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // Le mandamos los datos al backend
      const respuesta = await fetch('http://localhost:3000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setMensaje(`✅ ${datos.mensaje} Entraste como: ${datos.usuario.rol}`);
        // Aquí después haremos que te mande a otra pantalla (el Dashboard)
      } else {
        setMensaje(`❌ ${datos.mensaje}`);
      }
    } catch (error) {
      setMensaje('❌ Error al conectar con el servidor: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Plataforma Escolar</h1>
        <p className="subtitle">Ingresa a tu cuenta</p>
        
        <form onSubmit={manejarLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        {mensaje && <div className="mensaje">{mensaje}</div>}
      </div>
    </div>
  );
}

export default App;