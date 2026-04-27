import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Calificaciones from '../pages/Calificaciones'
import Dashboard from '../pages/Dashboard'
import Horario from '../pages/Horario'
import Tareas from '../pages/Tareas'
import Clases from '../pages/Clases'
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
      
      <Route path="/calificaciones" element={usuario ? <Calificaciones /> : <Navigate to="/" />} />
      <Route path="/horario" element={usuario ? <Horario /> : <Navigate to="/" />} />
      <Route path="/tareas" element={usuario ? <Tareas /> : <Navigate to="/" />} />
      <Route path="/clases" element={usuario ? <Clases /> : <Navigate to="/" />} />
      <Route path="/perfil" element={usuario ? <PerfilUsuario /> : <Navigate to="/" />} />
      <Route path="/entregas" element={usuario ? <Entregas /> : <Navigate to="/" />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppNav