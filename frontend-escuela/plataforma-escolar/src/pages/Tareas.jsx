import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock3, BookOpen, ArrowRight, CalendarDays, MoreVertical } from 'lucide-react';

const Tareas = () => {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const usuarioStr = localStorage.getItem('usuario');
  const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
  const esDocente = usuarioObj?.rol === 'docente' || usuarioObj?.rol === 'profesor';

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        let queryParams = '';
        if (usuarioObj) {
          const params = new URLSearchParams();
          if (usuarioObj.id_estudiante) params.append('estudianteId', usuarioObj.id_estudiante);
          if (usuarioObj.id_profesor) params.append('profesorId', usuarioObj.id_profesor);
          queryParams = `?${params.toString()}`;
        }

        const response = await fetch(`http://localhost:3000/api/tareas${queryParams}`);
        if (!response.ok) throw new Error('Error al obtener tareas');
        const data = await response.json();
        setTareas(data);
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-b-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const pendientes = esDocente ? tareas : tareas.filter(t => !t.id_entrega);
  const completadas = esDocente ? [] : tareas.filter(t => t.id_entrega);

  const handleVerDetalle = (id) => {
    navigate(`/tareas/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
          Mis Tareas
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl">
          {esDocente
            ? 'Gestiona todas las tareas que has asignado en tus clases.'
            : 'Revisa tus tareas pendientes y el historial de tus entregas.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Columna Principal - Tareas Pendientes */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardList className="text-indigo-600" />
              {esDocente ? 'Tareas Asignadas' : 'Pendientes por entregar'}
            </h2>
            <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
              {pendientes.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendientes.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Todo al día!</h3>
                <p className="text-slate-500 font-medium">No tienes tareas pendientes en este momento.</p>
              </div>
            ) : (
              pendientes.map(tarea => (
                <div
                  key={tarea.id_tarea}
                  onClick={() => handleVerDetalle(tarea.id_tarea)}
                  className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 -z-10"></div>

                  <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                    <div className="flex gap-5 items-start">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ClipboardList className="text-white" size={24} />
                      </div>

                      <div>
                        <h3 className="text-[19px] font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">
                          {tarea.titulo}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-slate-500">
                          <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            <BookOpen size={14} />
                            {tarea.materia_nombre}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Clock3 size={14} className="text-slate-400" />
                            {formatDate(tarea.fecha_vencimiento)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pl-19 sm:pl-0">
                      <div className="text-center sm:text-right">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valor</p>
                        <p className="text-sm font-extrabold text-slate-700">{tarea.puntos_maximos} pts</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Secundaria - Tareas Completadas (solo estudiantes) */}
        {!esDocente && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" />
              Completadas
            </h2>

            <div className="space-y-4">
              {completadas.length === 0 ? (
                <div className="bg-white/50 border border-slate-100 rounded-[24px] p-8 text-center">
                  <p className="text-slate-500 font-medium">Aún no has entregado ninguna tarea.</p>
                </div>
              ) : (
                completadas.map(tarea => (
                  <div
                    key={tarea.id_tarea}
                    onClick={() => handleVerDetalle(tarea.id_tarea)}
                    className="bg-white border border-slate-100 rounded-[24px] p-5 hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-[15px] group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {tarea.titulo}
                        </h4>
                        <p className="text-[12px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                          <BookOpen size={12} /> {tarea.materia_nombre}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Entregada</span>
                          <span className="text-xs font-extrabold text-slate-600">
                            {tarea.calificacion !== null ? `${tarea.calificacion}/${tarea.puntos_maximos}` : 'Sin calificar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tareas;