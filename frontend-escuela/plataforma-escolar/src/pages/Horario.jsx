import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  BookOpen,
  CalendarDays,
  List,
  Table,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { GooeyInput } from '../components/Buscador';

function Horario() {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState('agenda'); // 'agenda' o 'tabla'
  const [textoBusqueda, setTextoBusqueda] = useState('');
  
  // Mapeo de días para obtener el día por defecto según la fecha actual
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const indexHoy = new Date().getDay();
  // Por defecto inicializamos con el día de la semana actual, si es domingo elegimos Lunes
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    diasSemana[indexHoy] === 'Domingo' ? 'Lunes' : diasSemana[indexHoy]
  );

  const navigate = useNavigate();
  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setCargando(true);
        setError(null);
        
        let url = 'http://localhost:3000/api/clases';
        if (usuarioInfo.rol === 'docente' || usuarioInfo.id_profesor) {
          url += `?profesorId=${usuarioInfo.id_profesor}`;
        } else if (usuarioInfo.rol === 'estudiante' || usuarioInfo.id_estudiante) {
          url += `?estudianteId=${usuarioInfo.id_estudiante}`;
        } else {
          throw new Error('No se detectó un usuario autenticado válido.');
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Error al consultar las clases.');
        }
        
        const data = await res.json();
        setClases(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Ha ocurrido un error al cargar el horario.');
      } finally {
        setCargando(false);
      }
    };

    fetchHorarios();
  }, []);

  // Normalizador de nombres de días
  const normalizarDia = (dia) => {
    if (!dia) return '';
    return dia.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Mapeo ordenado de días de la semana
  const diasDeLaSemanaValidos = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  // Aplanar todas las clases en bloques individuales de horario
  const bloquesSchedules = [];
  clases.forEach((clase) => {
    const horarios = clase.horarios || [];
    horarios.forEach((h) => {
      bloquesSchedules.push({
        id_clase: clase.id_clase,
        materia_nombre: clase.materia_nombre,
        materia_codigo: clase.materia_codigo,
        profesor: `${clase.profesor_nombre || ''} ${clase.profesor_apellido || ''}`.trim() || 'Docente asignado',
        dia: h.dia || 'Lunes',
        hora_inicio: h.hora_inicio ? h.hora_inicio.slice(0, 5) : '00:00',
        hora_fin: h.hora_fin ? h.hora_fin.slice(0, 5) : '00:00',
        aula: h.aula || 'S/N',
        edificio: h.edificio || 'S/N',
      });
    });
  });

  // Ordenar días numéricamente para listado cronológico
  const ordenDias = {
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6,
    'domingo': 7
  };

  // Filtrar por texto de búsqueda
  const bloquesFiltradosBusqueda = bloquesSchedules.filter((b) => {
    if (!textoBusqueda.trim()) return true;
    const query = textoBusqueda.toLowerCase();
    return (
      b.materia_nombre.toLowerCase().includes(query) ||
      b.materia_codigo.toLowerCase().includes(query) ||
      b.profesor.toLowerCase().includes(query) ||
      b.aula.toLowerCase().includes(query) ||
      b.edificio.toLowerCase().includes(query)
    );
  });

  // Bloques de horario ordenados por día y hora de inicio
  const bloquesOrdenados = [...bloquesFiltradosBusqueda].sort((a, b) => {
    const diaA = ordenDias[normalizarDia(a.dia)] || 99;
    const diaB = ordenDias[normalizarDia(b.dia)] || 99;
    if (diaA !== diaB) return diaA - diaB;
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  // Filtrar bloques según el día seleccionado en la Agenda
  const bloquesFiltradosDia = bloquesOrdenados.filter(
    (b) => normalizarDia(b.dia) === normalizarDia(diaSeleccionado)
  );

  // Paleta de colores armónicos premium asignables dinámicamente
  const colorPalette = [
    { bg: 'bg-indigo-50/80', text: 'text-indigo-600', border: 'border-indigo-100', accent: 'bg-indigo-500' },
    { bg: 'bg-purple-50/80', text: 'text-purple-600', border: 'border-purple-100', accent: 'bg-purple-500' },
    { bg: 'bg-emerald-50/80', text: 'text-emerald-600', border: 'border-emerald-100', accent: 'bg-emerald-500' },
    { bg: 'bg-amber-50/80', text: 'text-amber-600', border: 'border-amber-100', accent: 'bg-amber-500' },
    { bg: 'bg-rose-50/80', text: 'text-rose-600', border: 'border-rose-100', accent: 'bg-rose-500' },
    { bg: 'bg-sky-50/80', text: 'text-sky-600', border: 'border-sky-100', accent: 'bg-sky-500' },
  ];

  const getColorBlock = (id) => {
    return colorPalette[id % colorPalette.length];
  };

  return (
    <div className='min-h-screen bg-slate-50 p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 relative overflow-hidden'>
      {/* Elementos Estéticos de Fondo */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
      <div className="absolute top-40 -right-10 w-64 h-64 md:top-60 md:right-20 md:w-96 md:h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
            Horario escolar
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl">
            {usuarioInfo.rol === 'docente' 
              ? 'Consulta tus asignaciones de clase, aulas y horarios asignados para este periodo.' 
              : 'Organiza tu semana y consulta tus asignaturas inscritas con sus respectivos horarios.'}
          </p>
        </div>

        {/* Acciones del Header */}
        {!cargando && !error && clases.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-start md:self-auto w-full sm:w-auto">
            <GooeyInput
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder="Buscar clase, docente, aula..."
            />
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner shrink-0">
              <button
                onClick={() => setVista('agenda')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  vista === 'agenda'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <List size={16} />
                Agenda
              </button>
              <button
                onClick={() => setVista('tabla')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  vista === 'tabla'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Table size={16} />
                Semanal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Cargando tu horario semanal...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/80 backdrop-blur-md border border-red-100 rounded-3xl p-6 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-red-800 text-lg mb-1">Error</h3>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : clases.length === 0 ? (
        // Estado Vacío Premium
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 md:p-16 max-w-2xl mx-auto text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
            <CalendarDays size={40} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
            Sin materias inscritas
          </h2>
          <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed max-w-md mx-auto">
            {usuarioInfo.rol === 'docente'
              ? 'Actualmente no tienes clases asignadas a tu cargo. Por favor contacta con el administrador del sistema.'
              : 'Aún no te has inscrito a ninguna clase este ciclo escolar. Explora las clases disponibles e inscríbete para armar tu horario.'}
          </p>
          {usuarioInfo.rol !== 'docente' && (
            <button
              onClick={() => navigate('/clases')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-14 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
            >
              Inscribirme a materias
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. VISTA DE AGENDA (Ideal para Móvil, organizada por pestañas de día) */}
          {vista === 'agenda' && (
            <div className="space-y-6">
              {/* Selector de días en Scroll Horizontal */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {diasDeLaSemanaValidos.map((dia) => {
                  const estaActivo = normalizarDia(dia) === normalizarDia(diaSeleccionado);
                  // Contar clases para este día concreto
                  const conteoClases = bloquesOrdenados.filter(
                    (b) => normalizarDia(b.dia) === normalizarDia(dia)
                  ).length;

                  return (
                    <button
                      key={dia}
                      onClick={() => setDiaSeleccionado(dia)}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 cursor-pointer ${
                        estaActivo
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
                          : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span>{dia}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          estaActivo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {conteoClases}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Lista de Clases del día seleccionado */}
              {bloquesFiltradosDia.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-[32px] p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Clock size={28} />
                  </div>
                  {textoBusqueda.trim() ? (
                    <>
                      <p className="text-slate-500 font-semibold text-lg">No se encontraron clases para "{textoBusqueda}" el {diaSeleccionado}</p>
                      <p className="text-slate-400 text-sm mt-1">Prueba con otra materia, código, docente o aula.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-500 font-semibold text-lg">No tienes clases asignadas los {diaSeleccionado}s</p>
                      <p className="text-slate-400 text-sm mt-1">Disfruta de tu tiempo libre o adelanta tus pendientes.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                  {bloquesFiltradosDia.map((bloque, idx) => {
                    const styling = getColorBlock(bloque.id_clase);
                    return (
                      <div
                        key={idx}
                        className={`bg-white border border-slate-200/60 rounded-3xl sm:rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between`}
                      >
                        <div>
                          {/* Encabezado del bloque de clase */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl ${styling.bg} flex items-center justify-center ${styling.text} shadow-sm shrink-0`}>
                                <BookOpen size={20} />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1">
                                  {bloque.materia_nombre}
                                </h3>
                                <p className="text-xs font-mono font-bold text-slate-400 mt-0.5 uppercase">
                                  {bloque.materia_codigo}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styling.bg} ${styling.text}`}>
                              Clase #{bloque.id_clase}
                            </span>
                          </div>

                          {/* Detalles del horario */}
                          <div className="space-y-3.5 pt-2">
                            <div className="flex items-center gap-3 text-slate-600">
                              <Clock size={18} className="text-slate-400 shrink-0" />
                              <span className="font-semibold text-sm">
                                {bloque.hora_inicio} - {bloque.hora_fin}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-slate-600">
                              <User size={18} className="text-slate-400 shrink-0" />
                              <span className="font-medium text-sm text-slate-700 truncate">
                                {bloque.profesor}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                              <MapPin size={18} className="text-slate-400 shrink-0" />
                              <span className="font-medium text-sm text-slate-600">
                                Edificio {bloque.edificio} • Aula {bloque.aula}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Barra decorativa de color en la base */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Semestre Regular</span>
                          <span className={`w-3 h-3 rounded-full ${styling.accent}`}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. VISTA DE TABLA COMPLETA (Ideal para computadoras) */}
          {vista === 'tabla' && (
            <div className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-3xl sm:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Materia
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Día
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Horario
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Docente
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Lugar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloquesOrdenados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-16 h-16 bg-slate-100/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Clock size={28} />
                          </div>
                          <p className="text-slate-500 font-semibold text-lg">No se encontraron clases coincidentes</p>
                          <p className="text-slate-400 text-sm mt-1">Intenta ajustar tu término de búsqueda.</p>
                        </td>
                      </tr>
                    ) : (
                      bloquesOrdenados.map((bloque, idx) => {
                        const styling = getColorBlock(bloque.id_clase);
                        return (
                          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${styling.bg} flex items-center justify-center ${styling.text} shrink-0`}>
                                  <BookOpen size={18} />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 block">{bloque.materia_nombre}</span>
                                  <span className="text-xs font-mono font-medium text-slate-400 uppercase">{bloque.materia_codigo}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="font-bold text-slate-700">{bloque.dia}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Clock size={16} className="text-slate-400" />
                                <span className="font-semibold text-slate-800">{bloque.hora_inicio} - {bloque.hora_fin}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-slate-700">
                                <User size={16} className="text-slate-400" />
                                <span className="font-medium">{bloque.profesor}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="font-medium text-slate-600">Edif. {bloque.edificio} • Aula {bloque.aula}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Horario;