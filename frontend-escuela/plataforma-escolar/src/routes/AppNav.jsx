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
import Admin from '../pages/Admin'
import Usuarios from '../pages/Usuarios'
import Reportes from '../pages/ReportesAdmin'
import GestionClases from '../pages/GestionClases'

function AppNav({ usuario, setUsuario }) {
  return (
    <Routes>


      <Route
        path="/"
        element={!usuario ? <Login setUsuario={setUsuario} /> : (usuario.rol === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)}
      />

      <Route
        path="/dashboard"
        element={usuario && usuario.rol !== 'admin' ? <Dashboard usuario={usuario} /> : <Navigate to="/" />}
      />

      {/* Rutas a las que el administrador no tience acceso, */}
      <Route path="/calificaciones" element={usuario && usuario.rol !== 'admin' ? <Calificaciones /> : <Navigate to="/" />} />
      <Route path="/horario" element={usuario && usuario.rol !== 'admin' ? <Horario /> : <Navigate to="/" />} />
      <Route path="/tareas" element={usuario && usuario.rol !== 'admin' ? <Tareas /> : <Navigate to="/" />} />
      <Route path="/clases" element={usuario && usuario.rol !== 'admin' ? <Clases /> : <Navigate to="/" />} />
      <Route path="/clases/:id" element={usuario && usuario.rol !== 'admin' ? <DetalleClase /> : <Navigate to="/" />} />
      <Route path="/tareas/:id" element={usuario && usuario.rol !== 'admin' ? <DetallesTarea /> : <Navigate to="/" />} />
      <Route path="/perfil" element={usuario && usuario.rol !== 'admin' ? <PerfilUsuario /> : <Navigate to="/" />} />

      {/*las entregas solo saldra para los docentes
      */}
      {/* Si el usuario no es docente, redirigimos a dashboard */}

      <Route path="/entregas" element={usuario && usuario.rol === 'docente' ? <Entregas /> : <Navigate to="/" />} />


      {/* Rutas solamente para el administrador */}
      <Route path="/admin" element={usuario && usuario.rol === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/usuarios" element={usuario && usuario.rol === 'admin' ? <Usuarios /> : <Navigate to="/" />} />
      <Route path="/gestion-clases" element={usuario && usuario.rol === 'admin' ? <GestionClases /> : <Navigate to="/" />} />
      <Route path="/reportes" element={usuario && usuario.rol === 'admin' ? <Reportes /> : <Navigate to="/" />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppNav