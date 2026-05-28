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
      <div>
        <ClaseCard searchQuery={textoBusqueda} />
      </div>
    </div>
  )
}
export default Clases