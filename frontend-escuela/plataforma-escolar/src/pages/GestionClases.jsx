import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Loader2 } from 'lucide-react';
import ModalCrearClase from '../Dialogs/ModalCrearClase';
import { GooeyInput } from '../components/Buscador';

const GestionClases = () => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const fetchClases = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/clases');
        if (response.ok) {
          const data = await response.json();
          setClases(data);
        }
      } catch (error) {
        console.error('Error fetching admin clases:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchClases();
  }, []);

  const clasesFiltradas = clases.filter(c =>
    c.materia_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.profesor_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.profesor_apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo_acceso.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[2000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b3d]">Gestión de Clases</h1>
          <p className="text-[#667394]">Crea materias y asigna docentes a los grupos</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="cursor-pointer flex items-center justify-center gap-2 bg-[#1d6ff2] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 active:scale-95">
          <Plus size={20} />
          <span>Nueva Clase</span>
        </button>
      </div>

      <ModalCrearClase
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        onClaseCreada={() => window.location.reload()}
      />

      <div className="bg-white rounded-3xl border border-[#e4eaf3] p-6 shadow-sm min-h-[400px]">

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <GooeyInput
              value={busqueda}
              collapsedWidth={400}
              expandedWidth={600}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar clase por materia, docente o código..."
            />


          </div>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="animate-spin text-[#1d6ff2]" size={40} />
          </div>
        ) : clasesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clasesFiltradas.map((clase) => (
              <div key={clase.id_clase} className="border border-[#e4eaf3] rounded-2xl p-5 hover:border-[#1d6ff2] transition-colors bg-[#f8fbff]/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-[#1d6ff2]">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-[#e4eaf3] text-[#667394]">
                    {clase.codigo_acceso}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0f1b3d] mb-1">{clase.materia_nombre}</h3>
                <p className="text-sm text-[#667394] mb-4">Prof. {clase.profesor_nombre} {clase.profesor_apellido}</p>
                <div className="text-xs font-medium text-[#94a3b8] flex justify-between items-center">
                  <span>{clase.horarios.length > 0 ? `${clase.horarios.length} día(s) por semana` : 'Sin horario'}</span>
                  <span>{clase.anio} - {clase.periodo}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-64">
            <div className="w-16 h-16 bg-blue-50 text-[#1d6ff2] rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#0f1b3d] mb-2">No se encontraron clases</h3>
            <p className="text-[#667394] max-w-sm">
              Puedes intentar con otra búsqueda o crear una nueva clase usando el botón superior.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionClases;
