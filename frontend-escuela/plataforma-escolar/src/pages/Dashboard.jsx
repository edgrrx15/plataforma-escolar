import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  Bell,
  BarChart3,
  GraduationCap,
  Clock3,
  CheckCircle2,
  TrendingUp,
  MoreVertical
} from 'lucide-react';

const Dashboard = () => {

  const [data, setData] = useState({
    nombre_usuario: '',
    iniciales: '',
    rol_usuario: '',
    materias: [],
    tareas: [],
    eventos: [],
    stats: {
      materias_activas: 0,
      tareas_entregadas: 0,
      promedio_general: 0,
      eventos_hoy: 0
    }
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const usuarioStr = localStorage.getItem('usuario');
        const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;

        let queryParams = '';
        if (usuarioObj) {
          const params = new URLSearchParams();
          if (usuarioObj.email) params.append('email', usuarioObj.email);
          if (usuarioObj.id_estudiante) params.append('estudianteId', usuarioObj.id_estudiante);
          if (usuarioObj.id_profesor) params.append('profesorId', usuarioObj.id_profesor);
          if (usuarioObj.rol) params.append('rol_usuario', usuarioObj.rol);

          queryParams = `?${params.toString()}`;
        }

        const response = await fetch(`http://localhost:3000/api/dashboard${queryParams}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      }
    };
    fetchDashboard();
  }, []);

  const gradientColors = [
    { color: 'bg-gradient-to-br from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/30' },
    { color: 'bg-gradient-to-br from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30' },
    { color: 'bg-gradient-to-br from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/30' },
    { color: 'bg-gradient-to-br from-rose-400 to-orange-500', shadow: 'shadow-rose-500/30' },
  ];

  const materias = data.materias.map((m, i) => ({
    ...m,
    color: gradientColors[i % gradientColors.length].color,
    shadow: gradientColors[i % gradientColors.length].shadow,
    progreso: `${m.progreso}%`
  }));

  const tareas = data.tareas;
  const eventos = data.eventos;
  const stats = data.stats;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-60 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">
            Bienvenido de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{data.nombre_usuario}</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl font-medium">
            Consulta tus materias, tareas pendientes, eventos y tu progreso académico desde un solo lugar.
          </p>
        </div>

        <div className="flex items-center gap-4">

          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-2.5 pr-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {data.iniciales}
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-800 text-[15px] leading-tight">{data.nombre_usuario}</h3>
              <p className="text-xs font-bold text-indigo-500 mt-0.5 first-letter:uppercase ">{data.rol_usuario}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {[
          { title: 'Materias activas', value: stats.materias_activas, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { title: 'Tareas entregadas', value: stats.tareas_entregadas, icon: ClipboardCheck, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { title: 'Promedio general', value: `${stats.promedio_general}%`, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { title: 'Eventos hoy', value: stats.eventos_hoy, icon: CalendarDays, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' }
        ].map((stat, i) => (
          <div key={i} className="group bg-white/70 backdrop-blur-xl rounded-[28px] border border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${stat.bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative z-10 flex flex-col">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={stat.color} size={26} />
              </div>
              <h2 className="text-[40px] leading-none font-black text-slate-800 tracking-tight">{stat.value}</h2>
              <p className="mt-2 text-slate-500 font-bold text-xs tracking-wider uppercase">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Col */}
        <div className="xl:col-span-2 flex flex-col gap-8">

          {/* Materias */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/60 p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tus materias</h2>
                <p className="text-slate-500 mt-1 font-medium">Continúa aprendiendo en tus cursos activos.</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors">
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {materias.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white/50 border border-slate-100 rounded-[24px]">
                  <p className="text-slate-500 font-medium">Aún no tienes materias activas.</p>
                </div>
              ) : (
                materias.map((materia, index) => (
                  <div key={index} className="group relative bg-white/90 border border-slate-100 rounded-[28px] p-6 hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${materia.color} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity duration-500`}></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-[22px] font-extrabold text-slate-800 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-500 transition-colors">
                            {materia.nombre}
                          </h3>
                          <p className="text-slate-500 text-[14px] font-medium">{materia.docente}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl ${materia.color} ${materia.shadow} shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                          <BookOpen className="text-white drop-shadow-sm" size={20} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progreso</span>
                          <span className="text-sm font-extrabold text-slate-700">{materia.progreso}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${materia.color} shadow-sm`} style={{ width: materia.progreso }}></div>
                        </div>
                      </div>

                      <button className="mt-6 w-full py-3.5 rounded-xl border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all">
                        Continuar curso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tareas */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/60 p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tareas pendientes</h2>
                <p className="text-slate-500 mt-1 font-medium">No olvides completar tus actividades.</p>
              </div>
            </div>

            <div className="space-y-4" >
              {tareas.length === 0 ? (
                <div className="py-8 text-center bg-white/50 border border-slate-100 rounded-[24px]">
                  <p className="text-slate-500 font-medium">No tienes tareas pendientes.</p>
                </div>
              ) : (
                tareas.map((tarea, index) => (
                  <div key={index} className="group bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-indigo-100 hover:shadow-[0_10px_20px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-105 transition-all duration-300 shrink-0">
                        <ClipboardCheck className="text-indigo-600 group-hover:text-white transition-colors" size={26} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{tarea.titulo}</h3>
                        <p className="text-slate-500 text-[14px] font-medium mt-0.5">{tarea.materia}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-18 sm:pl-0">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <Clock3 size={16} className="text-slate-400" />
                        <span className="text-[13px] font-bold text-slate-600">{tarea.fecha}</span>
                      </div>
                      <button className="hidden sm:flex w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="flex flex-col gap-8">

          {/* Rendimiento */}
          {/*Si es docente no saldra el cuadro de rendimiendo, solo saldran  a los estudiantes */}
          {data?.rol_usuario?.toLowerCase().trim() !== 'docente' && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] relative overflow-hidden">

              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-indigo-200 font-bold tracking-widest uppercase text-xs mb-1">
                    Tu Rendimiento
                  </p>

                  <h2 className="text-[64px] leading-none font-black tracking-tight drop-shadow-md">
                    {materias.length === 0 ? 'N/A' : 'A+'}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                  <TrendingUp size={32} className="text-white drop-shadow-sm" />
                </div>
              </div>

              <div className="relative z-10 mt-10 space-y-6">
                {[
                  {
                    label: 'Participación',
                    val: materias.length === 0 ? '0%' : '89%',
                    color: 'bg-blue-400'
                  },
                  {
                    label: 'Tareas',
                    val: materias.length === 0 ? '0%' : '93%',
                    color: 'bg-purple-400'
                  }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-indigo-100 font-medium text-[15px]">
                        {item.label}
                      </span>

                      <span className="font-bold text-white text-[15px]">
                        {item.val}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                        style={{ width: item.val }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
          {/* Agenda */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100/50 flex items-center justify-center">
                <CalendarDays className="text-orange-500" size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Agenda</h2>
                <p className="text-slate-500 font-medium text-sm mt-0.5">Eventos de hoy</p>
              </div>
            </div>

            <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent space-y-6">
              {eventos.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-slate-500 font-medium">No hay eventos para hoy.</p>
                </div>
              ) : (
                eventos.map((evento, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm transition-all z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                    </div>
                    <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <h3 className="font-bold text-slate-800 text-[15px]">{evento.titulo}</h3>
                      <p className="text-indigo-600 font-bold text-xs mt-2 bg-indigo-50 border border-indigo-100/50 w-fit px-2.5 py-1 rounded-md">{evento.hora}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logros */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center">
                <GraduationCap className="text-emerald-500" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Logros</h2>
                <p className="text-slate-500 font-medium text-sm mt-0.5">Tus últimos avances</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex items-center gap-4 hover:shadow-md hover:border-emerald-100 transition-all cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Proyecto completado</h3>
                  <p className="text-slate-500 text-[13px] font-medium mt-0.5">Entregaste antes de tiempo.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Promedio destacado</h3>
                  <p className="text-slate-500 text-[13px] font-medium mt-0.5">Mantienes un promedio mayor a 90.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
