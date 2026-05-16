import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  ClipboardList,
  Users,
  FileText,
  Clock,
  MoreVertical,
  User
} from 'lucide-react';
import ModalCrearTarea from '../Dialogs/ModalCrearTarea';
import ModalAgregarAnuncio from '../Dialogs/ModalAgregarAnuncio';

const DetalleClase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tareas');
  const [claseData, setClaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [modalAnuncioAbierto, setModalAnuncioAbierto] = useState(false);

  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');
  const esDocente = usuarioInfo.rol === 'docente' || usuarioInfo.rol === 'profesor';

  const handleCrearTarea = () => {
    setModalTareaAbierto(true);
  };

  const handleEliminarEstudiante = async (idEstudiante) => {
    if (!confirm('¿Seguro que deseas dar de baja a este estudiante?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/clases/${id}/estudiantes/${idEstudiante}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Hubo un error al dar de baja al estudiante.');
      }
    } catch (e) { alert('Error al eliminar'); }
  };

  useEffect(() => {
    const fetchDetalleClase = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (usuarioInfo.id_estudiante) queryParams.append('estudianteId', usuarioInfo.id_estudiante);
        if (usuarioInfo.id_profesor) queryParams.append('profesorId', usuarioInfo.id_profesor);

        const response = await fetch(`http://localhost:3000/api/clases/${id}/detalle?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('No se pudo cargar la información de la clase');
        }
        const data = await response.json();
        setClaseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleClase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-b-4 border-blue-200 border-t-[#1d6ff2]"></div>
      </div>
    );
  }

  if (error || !claseData) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oh no!</h2>
          <p className="text-slate-500 mb-6">{error || 'Clase no encontrada'}</p>
          <button
            onClick={() => navigate('/clases')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Volver a mis clases
          </button>
        </div>
      </div>
    );
  }

  const handleCrearAnuncio = () => {
    setModalAnuncioAbierto(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-4 sm:p-6 lg:p-8">
      {/* Back Button & Header Actions */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/clases')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-indigo-500/20 relative overflow-hidden mb-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold tracking-wider uppercase mb-4">
              <span>{claseData.materia_codigo}</span>
              <span>•</span>
              <span>{claseData.creditos} Créditos</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              {claseData.materia_nombre}
            </h1>
            <p className="text-indigo-100 font-medium text-lg flex items-center gap-2">
              <User size={18} />
              {claseData.profesor_nombre} {claseData.profesor_apellido}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Código de acceso</p>
            <div className="text-2xl font-mono font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 inline-block">
              {claseData.codigo_acceso}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('anuncios')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'anuncios' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <MessageSquare size={18} />
          Anuncios
        </button>
        <button
          onClick={() => setActiveTab('tareas')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'tareas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <ClipboardList size={18} />
          Tareas
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-[15px] border-b-2 transition-colors ${activeTab === 'personas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Users size={18} />
          Personas
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'anuncios' && (
          <div className="space-y-4">
            {esDocente && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCrearAnuncio}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  + Nuevo Anuncio
                </button>
              </div>
            )}

            {claseData.anuncios && claseData.anuncios.length > 0 ? (
              claseData.anuncios.map(anuncio => (
                <div key={anuncio.id_anuncio} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {anuncio.profesor_iniciales || 'P'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{anuncio.profesor_nombre} {anuncio.profesor_apellido}</h4>
                          <p className="text-xs text-slate-400 font-medium">
                            {new Date(anuncio.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h5 className="font-bold text-indigo-600 mb-2 text-lg">{anuncio.titulo}</h5>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{anuncio.descripcion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hay anuncios aún</h3>
                <p className="text-slate-500">Este es el espacio donde el profesor publicará novedades de la clase.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tareas' && (
          <div className="space-y-4">
            {esDocente && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCrearTarea}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  + Nueva Tarea
                </button>
              </div>
            )}
            {claseData.tareas && claseData.tareas.length > 0 ? (
              claseData.tareas.map(tarea => (
                <div
                  key={tarea.id_tarea}
                  onClick={() => navigate(`/tareas/${tarea.id_tarea}`)}
                  className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{tarea.titulo}</h4>
                    <p className="text-slate-500 text-sm mt-1">{tarea.descripcion}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> Sin fecha de entrega</span>
                      <span>•</span>
                      <span>{tarea.puntos_maximos} puntos</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50">
                    <MoreVertical size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hay tareas asignadas</h3>
                <p className="text-slate-500">¡Todo al día! Disfruta tu tiempo libre.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="space-y-8">
            {/* Profesor */}
            <div>
              <h3 className="text-2xl font-extrabold text-indigo-600 border-b-2 border-indigo-100 pb-3 mb-4">Profesor</h3>
              <div className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg">
                  {claseData.profesor_iniciales || 'P'}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-800">{claseData.profesor_nombre} {claseData.profesor_apellido}</p>
                  <p className="text-sm text-slate-500">{claseData.profesor_email}</p>
                </div>
              </div>
            </div>

            {/* Compañeros */}
            <div>
              <h3 className="text-2xl font-extrabold text-indigo-600 border-b-2 border-indigo-100 pb-3 mb-4 flex items-center justify-between">
                Compañeros
                <span className="text-sm font-bold text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">{claseData.estudiantes?.length || 0} alumnos</span>
              </h3>
              <div className="space-y-1">
                {claseData.estudiantes && claseData.estudiantes.map(estudiante => (
                  <div key={estudiante.id_estudiante} className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm">
                      {estudiante.iniciales}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-slate-800">{estudiante.nombre} {estudiante.apellido}</p>
                    </div>
                    {esDocente && (
                      <button
                        onClick={() => handleEliminarEstudiante(estudiante.id_estudiante)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                {(!claseData.estudiantes || claseData.estudiantes.length === 0) && (
                  <p className="text-slate-500 italic p-4">No hay estudiantes inscritos aún.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalCrearTarea
        modalAbierto={modalTareaAbierto}
        setModalAbierto={setModalTareaAbierto}
        idClase={id}
        onTareaCreada={() => window.location.reload()}
      />
      <ModalAgregarAnuncio
        modalAnuncioAbierto={modalAnuncioAbierto}
        setModalAnuncioAbierto={setModalAnuncioAbierto}
        claseId={id}
      />
    </div>
  );
};

export default DetalleClase;
