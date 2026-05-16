import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Calificaciones from '../pages/Calificaciones'
import Dashboard from '../pages/Dashboard'
import Horario from '../pages/Horario'
import Tareas from '../pages/Tareas'
import Clases from '../pages/Clases'
import DetalleClase from '../pages/DetalleClase'
import DetallesTarea from '../pages/DetallesTarea'
import PerfilUsuario from '../pages/PerfilUsuario'
import Entregas from '../pages/Entregas'
import Login from '../pages/Login'

function AppNav({ usuario, setUsuario }) {
  return (
    <Routes>


      <Route
        path="/"
        element={!usuario ? <Login setUsuario={setUsuario} /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/dashboard"
        element={usuario ? <Dashboard usuario={usuario} /> : <Navigate to="/" />}
      />

      {/* Rutas a las que el administrador no tience acceso, */}
      <Route path="/calificaciones" element={usuario && usuario.rol !== 'administrador' ? <Calificaciones /> : <Navigate to="/" />} />
      <Route path="/horario" element={usuario && usuario.rol !== 'administrador' ? <Horario /> : <Navigate to="/" />} />
      <Route path="/tareas" element={usuario && usuario.rol !== 'administrador' ? <Tareas /> : <Navigate to="/" />} />
      <Route path="/clases" element={usuario && usuario.rol !== 'administrador' ? <Clases /> : <Navigate to="/" />} />
      <Route path="/clases/:id" element={usuario && usuario.rol !== 'administrador' ? <DetalleClase /> : <Navigate to="/" />} />
      <Route path="/tareas/:id" element={usuario && usuario.rol !== 'administrador' ? <DetallesTarea /> : <Navigate to="/" />} />
      <Route path="/perfil" element={usuario && usuario.rol !== 'administrador' ? <PerfilUsuario /> : <Navigate to="/" />} />

      {/*las entregas solo saldra para los docentes
      */}
      {/* Si el usuario no es docente, redirigimos a dashboard */}

      <Route path="/entregas" element={usuario && usuario.rol === 'docente' ? <Entregas /> : <Navigate to="/" />} />


      {/* Rutas solamente para el administrador */}
      <Route path="/admin" element={usuario && usuario.rol === 'administrador' ? <Admin /> : <Navigate to="/" />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppNav