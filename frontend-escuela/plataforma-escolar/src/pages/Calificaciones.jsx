import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react';
import ModalCalificacion from '../Dialogs/ModalCalificacion';

function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [calificacionEdicion, setCalificacionEdicion] = useState(null);

  // Obtenemos el usuario del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
  const esDocente = usuarioObj?.rol === 'docente' || usuarioObj?.rol === 'profesor';

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      let queryParam = '';
      if (esDocente) {
        queryParam = `id_profesor=${usuarioObj.id_profesor}`;
      } else {
        queryParam = `id_estudiante=${usuarioObj.id_estudiante}`;
      }
      const response = await fetch(`http://localhost:3000/api/calificacion?${queryParam}`);
      if (!response.ok) throw new Error('Error al obtener calificaciones');
      const data = await response.json();
      setCalificaciones(data);
    } catch (error) {
      console.error('Error al obtener las calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioObj) {
      fetchCalificaciones();
    }
  }, []);

  const handleAgregar = () => {
    setCalificacionEdicion(null);
    setModalAbierto(true);
  };

  const handleModificar = (calif) => {
    setCalificacionEdicion(calif);
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta calificación?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/calificacion/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCalificaciones();
      } else {
        alert('Hubo un error al eliminar.');
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  // Filtrado de búsquedas
  const filteredCalificaciones = calificaciones.filter(c => {
    const matchMateria = c.materia_nombre?.toLowerCase().includes(searchQuery.toLowerCase());
    if (esDocente) {
      const nombreCompleto = `${c.estudiante_nombre} ${c.estudiante_apellido}`.toLowerCase();
      const matchAlumno = nombreCompleto.includes(searchQuery.toLowerCase());
      return matchMateria || matchAlumno;
    }
    return matchMateria;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
            {esDocente ? 'Control de Calificaciones' : 'Mis Calificaciones'}
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            {esDocente
              ? 'Registra, edita y administra el promedio académico final de tus estudiantes.'
              : 'Consulta tus promedios generales y calificaciones finales por materia.'}
          </p>
        </div>

        {esDocente && (
          <button
            onClick={handleAgregar}
            className="cursor-pointer shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={18} />
            Agregar Calificación
          </button>
        )}
      </div>

      {/* Buscador & Contenido */}
      <div className="space-y-6">
        <div className="relative w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm focus-within:border-indigo-500 transition-colors">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={esDocente ? 'Buscar por materia o alumno...' : 'Buscar por materia...'}
            className="w-full h-12 pl-12 pr-4 outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium text-[15px]"
          />
        </div>

        {/* Contenedor de la Tabla */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
          ) : filteredCalificaciones.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron calificaciones</h3>
              <p className="text-slate-500 text-sm font-medium">Intenta cambiar el criterio de búsqueda o agrega una nueva entrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {esDocente && <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estudiante</th>}
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Materia</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Observaciones</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Calificación Final</th>
                    {esDocente && <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredCalificaciones.map((calif) => (
                    <tr key={calif.id_calificacion} className="hover:bg-slate-50/30 transition-colors group">
                      {esDocente && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">
                            {calif.estudiante_nombre} {calif.estudiante_apellido}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <Award size={18} />
                          </div>
                          <span className="font-semibold text-slate-700">{calif.materia_nombre}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-500 text-sm font-medium max-w-xs truncate" title={calif.observaciones}>
                          {calif.observaciones || <span className="text-slate-300 italic">Sin observaciones</span>}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-[14px] ${Number(calif.calificacion) >= 70
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                          }`}>
                          {calif.calificacion}
                        </span>
                      </td>

                      {esDocente && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleModificar(calif)}
                              className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                              title="Modificar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleEliminar(calif.id_calificacion)}
                              className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalCalificacion
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        calificacionEdicion={calificacionEdicion}
        idProfesor={usuarioObj?.id_profesor}
        onSave={fetchCalificaciones}
      />
    </div>
  );
}

export default Calificaciones;