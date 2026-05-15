import React, { useState } from 'react'
import {
  Plus,
  Link as LinkIcon,
  BookOpen,
  Users,
  Clock3,
  GraduationCap,
  X,
  Search,
  Filter,
  CalendarDays,
  Bell,
  MoreVertical,
  ClipboardCheck,
  BarChart3,
  Settings,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import ModalAgregarClase from '../components/ModalAgregarClase'
import ModalUnirseClase from '../components/ModalUnirseClase'
import ClaseCard from '../components/ClaseCard'

function Clases() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalUnirseAbierto, setModalUnirseAbierto] = useState(false)
  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleUnirse = () => {
    setModalUnirseAbierto(true);
  }

  const clases = [
    {
      nombre: 'Programación Web',
      docente: 'Ing. Carlos Ruiz',
      alumnos: 32,
      horario: '08:00 AM - 10:00 AM',
      tareas: 12,
      promedio: '94%',
      color: 'bg-blue-500',
    },
    {
      nombre: 'Base de Datos',
      docente: 'Mtro. Daniel Gómez',
      alumnos: 28,
      horario: '10:00 AM - 12:00 PM',
      tareas: 8,
      promedio: '89%',
      color: 'bg-violet-500',
    },
    {
      nombre: 'Matemáticas',
      docente: 'Dra. Laura Martínez',
      alumnos: 40,
      horario: '01:00 PM - 03:00 PM',
      tareas: 15,
      promedio: '97%',
      color: 'bg-emerald-500',
    },
    {
      nombre: 'Redes',
      docente: 'Ing. Luis Torres',
      alumnos: 24,
      horario: '03:00 PM - 05:00 PM',
      tareas: 6,
      promedio: '86%',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">

        <div>
          <p className="text-[#5f6f91] text-lg font-medium">
            Gestión académica
          </p>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#08183f] mt-2 tracking-tight">
            Clases
          </h1>

          <p className="text-[#667394] mt-3 text-lg max-w-2xl">
            Organiza tus clases, administra estudiantes y consulta el rendimiento académico.
          </p>
        </div>

        <div className="flex items-center gap-4">

          <button className="relative w-14 h-14 rounded-2xl bg-white border border-[#e4eaf3] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <Bell className="text-[#1d6ff2]" size={24} />

            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"></div>
          </button>

          {usuarioInfo.rol !== 'estudiante' ? (
            <button
              onClick={() => setModalAbierto(true)}
              className="h-14 px-6 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3"
            >
              <Plus size={22} />
              Agregar clase
            </button>
          ) : (
            <button
              onClick={handleUnirse}
              className="h-14 px-6 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3"
            >
              <LinkIcon size={22} />
              Unirse a clase
            </button>
          )}

          <ModalAgregarClase
            modalAbierto={modalAbierto}
            setModalAbierto={setModalAbierto}
          />
          
          <ModalUnirseClase
            modalAbierto={modalUnirseAbierto}
            setModalAbierto={setModalUnirseAbierto}
            onClaseUnida={() => window.location.reload()}
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm">

          {/* Icono  a la izquierda */}
          <div className="flex items-center gap-4">


          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
            <BookOpen className="text-[#1d6ff2]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
            12
          </h2>

          <p className="mt-2 text-[#667394] font-medium">
            Clases activas
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#eefaf4] flex items-center justify-center">
            <Users className="text-[#1eb98f]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
            124
          </h2>

          <p className="mt-2 text-[#667394] font-medium">
            Estudiantes
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#fff4e8] flex items-center justify-center">
            <ClipboardCheck className="text-[#ff922b]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
            41
          </h2>

          <p className="mt-2 text-[#667394] font-medium">
            Tareas asignadas
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#f4eeff] flex items-center justify-center">
            <BarChart3 className="text-[#7c4dff]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
            92%
          </h2>

          <p className="mt-2 text-[#667394] font-medium">
            Rendimiento
          </p>
        </div>

      </div>


      {/* GRID */}
      <div>
        <ClaseCard />
      </div>
    </div>
  )
}
export default Clases