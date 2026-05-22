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
import ModalCrearClase from '../Dialogs/ModalCrearClase'
import ModalUnirseClase from '../Dialogs/ModalUnirseClase'
import ClaseCard from '../components/ClaseCard'
import { GooeyInput } from '../components/Buscador'

function Clases() {
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalUnirseAbierto, setModalUnirseAbierto] = useState(false)
  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleUnirse = () => {
    setModalUnirseAbierto(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">

        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#08183f] mt-2 tracking-tight">
            Clases
          </h1>

          <p className="text-[#667394] mt-3 text-base sm:text-lg max-w-2xl">
            Organiza tus clases, administra estudiantes y consulta el rendimiento académico.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
          <GooeyInput
            placeholder="Buscar clases..."
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto shrink-0 justify-end sm:justify-start">


            {usuarioInfo.rol !== 'estudiante' ? (
              <button
                onClick={() => setModalAbierto(true)}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 shrink-0"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                Crear clase
              </button>
            ) : (
              <button
                onClick={handleUnirse}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 shrink-0"
              >
                <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Unirse a clase
              </button>
            )}
          </div>

          <ModalCrearClase
            modalAbierto={modalAbierto}
            setModalAbierto={setModalAbierto}
            onClaseCreada={() => window.location.reload()}
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
        <ClaseCard searchQuery={textoBusqueda} />
      </div>
    </div>
  )
}
export default Clases