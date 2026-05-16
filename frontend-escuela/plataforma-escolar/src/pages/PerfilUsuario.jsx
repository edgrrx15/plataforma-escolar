import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  ShieldCheck,
  Camera,
  Bell,
  GraduationCap,
  BarChart3,
  ClipboardCheck,
  Clock3,
} from 'lucide-react';
import ModalEditarPerfil from '../Dialogs/ModalEditarPerfil';

const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const usuarioStr = localStorage.getItem('usuario');

        const usuarioObj = usuarioStr
          ? JSON.parse(usuarioStr)
          : null;

        const emailParam =
          usuarioObj && usuarioObj.email
            ? `?email=${encodeURIComponent(usuarioObj.email)}`
            : '';

        const response = await fetch(
          `http://localhost:3000/api/perfil${emailParam}`
        );

        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  //se actualiza cada cambio que haya en la API
  useEffect(() => {
    if (perfil) {
      const handleStorageChange = () => {
        fetchPerfil();
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [perfil]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-b-4 border-blue-200 border-t-[#1d6ff2]"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center px-6">
        <div className="bg-white border border-[#e4eaf3] rounded-[28px] p-10 shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#08183f]">
            Perfil no encontrado
          </h2>

          <p className="text-[#667394] mt-3">
            No se encontró información del usuario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/70 to-transparent -z-10"></div>

      <div className="absolute top-40 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>

      <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">

        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <p className="text-[#5f6f91] text-base sm:text-lg font-medium">
              Perfil académico
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#08183f] tracking-tight mt-2">
              Mi Perfil
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <button className="relative w-14 h-14 rounded-2xl bg-white border border-[#e4eaf3] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <Bell className="text-[#1d6ff2]" size={24} />

              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"></div>
            </button>

            <button
              className="w-full sm:w-auto px-6 py-3 bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              onClick={() => setMostrarModal(true)}
            >
              Editar Perfil
            </button>

          </div>

          <ModalEditarPerfil
            mostrarModal={mostrarModal}
            setMostrarModal={setMostrarModal}
            perfil={perfil}
            setPerfil={setPerfil}
          />

        </div>

        {/* HEADER PERFIL */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

          {/* Cover */}
          <div className="h-44 sm:h-56 lg:h-64 bg-gradient-to-r from-[#1d6ff2] via-[#4b7fff] to-[#7c4dff] relative">

            <div className="absolute inset-0 bg-white/10"></div>

          </div>

          {/* Info */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">

            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-8 -mt-16 sm:-mt-20 lg:-mt-24 mb-6">

              {/* Avatar */}
              <div className="relative group">

                <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full bg-white p-2 shadow-xl">

                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-4xl sm:text-5xl font-black text-[#1d6ff2] overflow-hidden">
                    {perfil.iniciales}
                  </div>

                </div>

                <button className="absolute bottom-2 right-2 p-3 bg-white rounded-full shadow-lg text-[#667394] hover:text-[#1d6ff2] transition-colors border border-[#eef2f8]">
                  <Camera size={18} />
                </button>

              </div>

              {/* Datos */}
              <div className="flex-1 text-center lg:text-left">

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#08183f] tracking-tight break-words">
                  {perfil.nombre} {perfil.apellido}
                </h1>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4">

                  <span className="px-4 py-2 bg-blue-50 border border-blue-100 text-[#1d6ff2] rounded-xl text-xs font-bold uppercase tracking-wider">
                    Estudiante
                  </span>

                  {perfil.estado && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck size={15} />
                      Activo
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-white border border-[#e4eaf3] rounded-[28px] p-6 shadow-sm">

            <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
              <BookOpen className="text-[#1d6ff2]" size={28} />
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
              8
            </h2>

            <p className="mt-2 text-[#667394] font-medium">
              Materias activas
            </p>

          </div>

          <div className="bg-white border border-[#e4eaf3] rounded-[28px] p-6 shadow-sm">

            <div className="w-14 h-14 rounded-2xl bg-[#eefaf4] flex items-center justify-center">
              <ClipboardCheck className="text-[#1eb98f]" size={28} />
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
              24
            </h2>

            <p className="mt-2 text-[#667394] font-medium">
              Tareas entregadas
            </p>

          </div>

          <div className="bg-white border border-[#e4eaf3] rounded-[28px] p-6 shadow-sm">

            <div className="w-14 h-14 rounded-2xl bg-[#fff4e8] flex items-center justify-center">
              <BarChart3 className="text-[#ff922b]" size={28} />
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
              92%
            </h2>

            <p className="mt-2 text-[#667394] font-medium">
              Promedio general
            </p>

          </div>

          <div className="bg-white border border-[#e4eaf3] rounded-[28px] p-6 shadow-sm">

            <div className="w-14 h-14 rounded-2xl bg-[#f4eeff] flex items-center justify-center">
              <GraduationCap className="text-[#7c4dff]" size={28} />
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#08183f]">
              6°
            </h2>

            <p className="mt-2 text-[#667394] font-medium">
              Semestre actual
            </p>

          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

          {/* IZQUIERDA */}
          <div className="space-y-6">

            {/* CONTACTO */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/60 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

              <h2 className="text-lg sm:text-xl font-extrabold text-[#08183f] mb-6 tracking-tight">
                Información de contacto
              </h2>

              <div className="space-y-6">

                <div className="flex items-start gap-4">

                  <div className="p-3.5 bg-blue-50 text-[#1d6ff2] rounded-2xl">
                    <Mail size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">
                      Correo electrónico
                    </p>

                    <p className="text-sm sm:text-[15px] font-bold text-[#08183f] break-all">
                      {perfil.email}
                    </p>
                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl">
                    <Phone size={22} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">
                      Teléfono
                    </p>

                    <p className="text-sm sm:text-[15px] font-bold text-[#08183f]">
                      {perfil.telefono}
                    </p>
                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">
                      Dirección
                    </p>

                    <p className="text-sm sm:text-[15px] font-bold text-[#08183f] leading-relaxed">
                      {perfil.direccion}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* ACTIVIDAD */}
            <div className="bg-gradient-to-br from-[#1d6ff2] to-[#4f8fff] rounded-[28px] p-6 text-white shadow-xl shadow-blue-500/20">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-blue-100 font-medium">
                    Actividad reciente
                  </p>

                  <h2 className="text-4xl font-extrabold mt-3">
                    94%
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xl">
                  <Clock3 size={30} />
                </div>

              </div>

              <div className="mt-8 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Asistencia
                  </span>

                  <span className="font-bold">
                    96%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Participación
                  </span>

                  <span className="font-bold">
                    89%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Actividades
                  </span>

                  <span className="font-bold">
                    93%
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* DERECHA */}
          <div className="xl:col-span-2 space-y-6">

            {/* INFO ACADEMICA */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/60 p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

              <h2 className="text-lg sm:text-xl font-extrabold text-[#08183f] mb-6 tracking-tight">
                Información académica
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                <div className="bg-white border border-[#eef2f8] rounded-[24px] p-6 hover:shadow-md transition-all">

                  <div className="flex items-center gap-4 mb-4">

                    <div className="w-12 h-12 bg-blue-50 text-[#1d6ff2] rounded-2xl flex items-center justify-center">
                      <Calendar size={24} />
                    </div>

                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">
                      Fecha de nacimiento
                    </p>

                  </div>

                  <p className="text-[#08183f] font-extrabold text-xl">
                    {perfil.fecha_nacimiento}
                  </p>

                </div>

                <div className="bg-white border border-[#eef2f8] rounded-[24px] p-6 hover:shadow-md transition-all">

                  <div className="flex items-center gap-4 mb-4">

                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Award size={24} />
                    </div>

                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">
                      Fecha de ingreso
                    </p>

                  </div>

                  <p className="text-[#08183f] font-extrabold text-xl">
                    {perfil.fecha_ingreso}
                  </p>

                </div>

                {/* PROGRAMA */}
                <div className="bg-gradient-to-br from-[#1d6ff2] to-[#7c4dff] rounded-[28px] p-5 sm:p-8 text-white shadow-xl shadow-blue-500/20 md:col-span-2 relative overflow-hidden">

                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    <div className="flex items-center gap-5">

                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <BookOpen size={30} />
                      </div>

                      <div>
                        <p className="text-blue-100 font-bold text-[11px] uppercase tracking-widest mb-1">
                          Programa educativo
                        </p>

                        <h3 className="text-2xl font-black tracking-tight">
                          Ingeniería en Software
                        </h3>
                      </div>

                    </div>

                    <div className="text-left lg:text-right">

                      <p className="text-blue-100 font-bold text-[11px] uppercase tracking-widest mb-1">
                        Ciclo actual
                      </p>

                      <p className="text-2xl font-black tracking-tight">
                        6to Semestre
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PerfilUsuario;