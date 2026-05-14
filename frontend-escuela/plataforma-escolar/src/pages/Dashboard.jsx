import React from 'react';
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
} from 'lucide-react';

const Dashboard = () => {
  const materias = [
    {
      nombre: 'Matemáticas',
      docente: 'Dra. Laura Martínez',
      progreso: '82%',
      color: 'bg-blue-500',
    },
    {
      nombre: 'Programación',
      docente: 'Ing. Carlos Ruiz',
      progreso: '91%',
      color: 'bg-violet-500',
    },
    {
      nombre: 'Base de Datos',
      docente: 'Mtro. Daniel Gómez',
      progreso: '74%',
      color: 'bg-emerald-500',
    },
  ];

  const tareas = [
    {
      titulo: 'Actividad de cálculo',
      materia: 'Matemáticas',
      fecha: '14 Mayo · 11:59 PM',
    },
    {
      titulo: 'Proyecto CRUD',
      materia: 'Programación',
      fecha: '16 Mayo · 10:00 PM',
    },
    {
      titulo: 'Modelo entidad relación',
      materia: 'Base de Datos',
      fecha: '18 Mayo · 09:00 PM',
    },
  ];

  const eventos = [
    {
      titulo: 'Clase de Programación',
      hora: '08:00 AM - 10:00 AM',
    },
    {
      titulo: 'Examen de Matemáticas',
      hora: '12:00 PM - 01:00 PM',
    },
    {
      titulo: 'Entrega de proyecto',
      hora: '05:00 PM',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        
        <div>
          <p className="text-[#5f6f91] text-lg font-medium">
            Plataforma Académica
          </p>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#08183f] mt-2 tracking-tight">
            Bienvenido de nuevo 👋
          </h1>

          <p className="text-[#667394] mt-3 text-lg max-w-2xl leading-relaxed">
            Consulta tus materias, tareas pendientes, eventos y tu progreso académico desde un solo lugar.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative w-14 h-14 rounded-2xl bg-white border border-[#e4eaf3] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <Bell className="text-[#1d6ff2]" size={24} />

            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"></div>
          </button>

          <div className="bg-white border border-[#e4eaf3] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#1d6ff2] flex items-center justify-center text-white font-bold text-lg">
              E
            </div>

            <div>
              <h3 className="font-bold text-[#08183f]">Edgar Gómez</h3>
              <p className="text-sm text-[#667394]">Estudiante</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
            <BookOpen className="text-[#1d6ff2]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">8</h2>

          <p className="mt-2 text-[#667394] font-medium">
            Materias activas
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-[#efe7ff] flex items-center justify-center">
            <ClipboardCheck className="text-[#7c4dff]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">12</h2>

          <p className="mt-2 text-[#667394] font-medium">
            Tareas entregadas
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-[#e8fbf4] flex items-center justify-center">
            <BarChart3 className="text-[#1eb98f]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">92%</h2>

          <p className="mt-2 text-[#667394] font-medium">
            Promedio general
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e4eaf3] p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-[#fff3e7] flex items-center justify-center">
            <CalendarDays className="text-[#ff922b]" size={28} />
          </div>

          <h2 className="mt-5 text-4xl font-bold text-[#08183f]">3</h2>

          <p className="mt-2 text-[#667394] font-medium">
            Eventos hoy
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Materias */}
          <div className="bg-white rounded-[32px] border border-[#e4eaf3] p-7 shadow-sm">
            
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-bold text-[#08183f]">
                  Tus materias
                </h2>

                <p className="text-[#667394] mt-1">
                  Continúa aprendiendo en tus cursos.
                </p>
              </div>

              <button className="h-12 px-5 rounded-2xl bg-[#1d6ff2] text-white font-semibold hover:bg-[#155fd4] transition-all">
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {materias.map((materia, index) => (
                <div
                  key={index}
                  className="border border-[#e4eaf3] rounded-[28px] p-6 hover:shadow-lg transition-all bg-[#fcfdff]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-[#08183f]">
                        {materia.nombre}
                      </h3>

                      <p className="text-[#667394] mt-2">
                        {materia.docente}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-full ${materia.color}`}></div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[#667394]">
                        Progreso
                      </p>

                      <p className="text-sm font-bold text-[#08183f]">
                        {materia.progreso}
                      </p>
                    </div>

                    <div className="w-full h-3 bg-[#edf2fa] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${materia.color}`}
                        style={{ width: materia.progreso }}
                      ></div>
                    </div>
                  </div>

                  <button className="mt-6 w-full h-12 rounded-2xl border border-[#dce3ee] text-[#08183f] font-semibold hover:bg-[#f5f8ff] transition-all">
                    Entrar al curso
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tareas */}
          <div className="bg-white rounded-[32px] border border-[#e4eaf3] p-7 shadow-sm">
            
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-bold text-[#08183f]">
                  Tareas pendientes
                </h2>

                <p className="text-[#667394] mt-1">
                  No olvides completar tus actividades.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {tareas.map((tarea, index) => (
                <div
                  key={index}
                  className="border border-[#e4eaf3] rounded-[24px] p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 hover:bg-[#fafcff] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
                      <ClipboardCheck className="text-[#1d6ff2]" size={28} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#08183f]">
                        {tarea.titulo}
                      </h3>

                      <p className="text-[#667394] mt-1">
                        {tarea.materia}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#667394]">
                      <Clock3 size={18} />
                      <span>{tarea.fecha}</span>
                    </div>

                    <button className="h-11 px-5 rounded-2xl bg-[#1d6ff2] text-white font-semibold hover:bg-[#155fd4] transition-all">
                      Ver tarea
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-6">

          {/* Calendario */}
          <div className="bg-white rounded-[32px] border border-[#e4eaf3] p-7 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
                <CalendarDays className="text-[#1d6ff2]" size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#08183f]">
                  Agenda
                </h2>

                <p className="text-[#667394]">
                  Eventos de hoy
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {eventos.map((evento, index) => (
                <div
                  key={index}
                  className="border border-[#e4eaf3] rounded-[24px] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#eef4ff] flex items-center justify-center">
                      <Clock3 className="text-[#1d6ff2]" size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#08183f] text-lg">
                        {evento.titulo}
                      </h3>

                      <p className="text-[#667394] mt-1">
                        {evento.hora}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rendimiento */}
          <div className="bg-gradient-to-br from-[#1d6ff2] to-[#4f8fff] rounded-[32px] p-7 text-white shadow-xl shadow-blue-500/20">
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium">
                  Rendimiento académico
                </p>

                <h2 className="text-5xl font-extrabold mt-3">
                  A+
                </h2>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl">
                <TrendingUp size={32} />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Asistencia</span>
                <span className="font-bold">96%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-100">Participación</span>
                <span className="font-bold">89%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-100">Tareas completas</span>
                <span className="font-bold">93%</span>
              </div>
            </div>
          </div>

          {/* Logros */}
          <div className="bg-white rounded-[32px] border border-[#e4eaf3] p-7 shadow-sm">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#e8fbf4] flex items-center justify-center">
                <GraduationCap className="text-[#1eb98f]" size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#08183f]">
                  Logros
                </h2>

                <p className="text-[#667394]">
                  Tus últimos avances
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e8fbf4] flex items-center justify-center">
                  <CheckCircle2 className="text-[#1eb98f]" size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-[#08183f]">
                    Proyecto completado
                  </h3>

                  <p className="text-[#667394] text-sm mt-1">
                    Entregaste tu proyecto antes de tiempo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#eef4ff] flex items-center justify-center">
                  <BarChart3 className="text-[#1d6ff2]" size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-[#08183f]">
                    Promedio destacado
                  </h3>

                  <p className="text-[#667394] text-sm mt-1">
                    Mantienes un promedio mayor a 90.
                  </p>
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
