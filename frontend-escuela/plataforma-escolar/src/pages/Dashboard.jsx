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
import { useNavigate } from 'react-router-dom';
import { GooeyInput } from '../components/Buscador';

const Dashboard = () => {
  const navigate = useNavigate();

  const [textoBusqueda, setTextoBusqueda] = useState('');

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

  // Filtrar materias en tiempo real
  const filteredMaterias = data.materias.filter((m) =>
    m.nombre.toLowerCase().includes(textoBusqueda.toLowerCase())
  );

  const materias = filteredMaterias.map((m, i) => ({
    ...m,
    color: gradientColors[i % gradientColors.length].color,
    shadow: gradientColors[i % gradientColors.length].shadow,
    progreso: `${m.progreso}%`
  }));

  // Filtrar tareas en tiempo real
  const tareas = data.tareas.filter((t) =>
    t.titulo.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
    t.materia.toLowerCase().includes(textoBusqueda.toLowerCase())
  );

  const eventos = data.eventos;
  const stats = data.stats;

  //Continuar con la clase, ira a dicha clase, ira a detalles de la clase
  const handleContinuarConClase = (id_clase) => {
    localStorage.setItem('clase_seleccionada', JSON.stringify(id_clase));
    navigate(`/clases/${id_clase}`);
  }

  const handleContinuarTarea = (id_tarea) => {
    localStorage.setItem('tarea_seleccionada', JSON.stringify(id_tarea));
    navigate(`/tareas/${id_tarea}`);
  }
  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-60 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">
            Bienvenido de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{data.nombre_usuario}</span>
          </h1>

          <p className="text-slate-500 mt-2 sm:mt-3 text-base sm:text-lg max-w-2xl font-medium">
            Consulta tus materias, tareas pendientes, eventos y tu progreso académico desde un solo lugar.
          </p>
        </div>

        {/* Buscador y Perfil de Usuario alineados responsivamente */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 w-full lg:w-auto">
          <div className="w-[320px] lg:w-[360px] flex justify-end shrink-0">
            <GooeyInput
              placeholder="Buscar materias o tareas..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
          </div>

          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-2.5 pr-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer w-full sm:w-auto">
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
      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Col */}
        <div className="xl:col-span-2 flex flex-col gap-8">

          {/* Materias */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[32px] border border-white/60 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Tus materias</h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">Continúa aprendiendo en tus cursos activos.</p>
              </div>
              <button
                onClick={() => navigate('/clases')}
                className=" cursor-pointer px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors">
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
                    <div on className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${materia.color} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity duration-500`}></div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-[22px] font-extrabold text-slate-800 leading-tight group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-500 transition-colors">
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

                      <button className="cursor-pointer mt-6 w-full py-3.5 rounded-xl border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all"
                        onClick={() => handleContinuarConClase(materia.id_clase)}>
                        Continuar curso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tareas */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[32px] border border-white/60 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Tareas pendientes</h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">No olvides completar tus actividades.</p>
              </div>
            </div>

            <div className="space-y-4" >
              {tareas.length === 0 ? (
                <div className="py-8 text-center bg-white/50 border border-slate-100 rounded-[24px]">
                  <p className="text-slate-500 font-medium">No tienes tareas pendientes.</p>
                </div>
              ) : (
                tareas.map((tarea, index) => (
                  <div onClick={() => handleContinuarTarea(tarea.id_tarea)} key={index} className="group bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-indigo-100 hover:shadow-[0_10px_20px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
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
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
