import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppNav from './routes/AppNav';
import './index.css'

function App() {
  // 1. Estado inicial: intentamos leer al usuario del localStorage
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-red text-white">
        
        {usuario && <Sidebar usuario={usuario} setUsuario={setUsuario} />}
        
        <main className={`flex-1 ${usuario ? 'p-8' : ''}`}>
          <AppNav usuario={usuario} setUsuario={setUsuario} />
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;