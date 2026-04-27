import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  User,
  CalendarCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';

const Login = ({ setUsuario }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tipoUsuario }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        setUsuario(datos.usuario);
        navigate('/dashboard');
      } else {
        setError(datos.mensaje || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faff] text-[#0f1b3d] flex items-center justify-center overflow-hidden">

      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">

        {/* LADO IZQUIERDO */}
        <section className="relative hidden lg:flex flex-col justify-between px-16 py-12 overflow-hidden border-r border-[#e7edf7] bg-gradient-to-br from-white via-[#f8fbff] to-[#eef5ff]">

          {/* Logo */}
          <div className="flex items-center gap-3 z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <GraduationCap className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-[#1d6ff2] tracking-tight">
              EduClass
            </h1>
          </div>

          {/* Texto principal */}
          <div className="z-10 max-w-lg">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-[#08183f]">
              Tu plataforma <br />
              académica en un <br />
              solo lugar
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-[#667394] max-w-md">
              Organiza tus clases, entrega tareas y consulta tus calificaciones
              de forma ágil y segura.
            </p>

            {/* Beneficios */}
            <div className="mt-9 space-y-6">

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
                  <BookOpen className="text-[#1677ff]" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1b3d]">
                    Gestiona clases
                  </h3>
                  <p className="text-[#667394] mt-1">
                    Accede a tus cursos y materiales siempre que lo necesites.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#efe7ff] flex items-center justify-center">
                  <ClipboardCheck className="text-[#6d4aff]" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1b3d]">
                    Entrega tareas
                  </h3>
                  <p className="text-[#667394] mt-1">
                    Envía tus tareas en línea y recibe retroalimentación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#e6faf5] flex items-center justify-center">
                  <BarChart3 className="text-[#21b69a]" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1b3d]">
                    Consulta calificaciones
                  </h3>
                  <p className="text-[#667394] mt-1">
                    Revisa tu progreso y desempeño en todo momento.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Ilustración decorativa estilo suave */}
          <div className="relative z-10 h-64">
            <div className="absolute left-4 bottom-0 w-48 h-56 rounded-[42px] bg-gradient-to-br from-white to-[#dbeaff] border border-white shadow-2xl shadow-blue-200/70 rotate-[-4deg]">
              <div className="absolute top-[-35px] left-12 w-24 h-20 rounded-t-full border-[12px] border-[#7aa8ff] border-b-0"></div>
              <div className="absolute inset-x-8 top-20 h-20 rounded-3xl bg-white shadow-inner"></div>
              <div className="absolute inset-x-10 bottom-8 h-3 rounded-full bg-[#78a8ff]"></div>
            </div>

            <div className="absolute left-56 bottom-8 w-40 h-20 rounded-2xl bg-gradient-to-br from-[#d8e7ff] to-[#8fb8ff] shadow-xl rotate-[-6deg]"></div>

            <div className="absolute left-[340px] bottom-10 w-28 h-36 rounded-3xl bg-white/80 backdrop-blur-xl border border-[#dce8ff] shadow-xl rotate-[-5deg] flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-[#2cc7a5]">A+</p>
              <div className="w-16 h-2 bg-[#dce8ff] rounded-full mt-5"></div>
              <div className="w-12 h-2 bg-[#dce8ff] rounded-full mt-3"></div>
            </div>

            <div className="absolute left-[-90px] bottom-[-70px] w-80 h-80 rounded-full border border-white bg-white/40"></div>
            <div className="absolute right-[-160px] bottom-[-80px] w-96 h-96 rounded-full border border-white bg-white/30"></div>
          </div>
        </section>

        {/* LADO DERECHO */}
        <section className="flex items-center justify-center px-6 py-10 bg-[#fbfdff]">

          <div className="w-full max-w-xl bg-white border border-[#e4eaf3] rounded-[32px] px-8 sm:px-12 py-10 sm:py-12 shadow-[0_25px_80px_rgba(49,82,130,0.12)]">

            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-[#e5eaf2] mb-10">
              <button
                type="button"
                onClick={() => setTipoUsuario('estudiante')}
                className={`flex items-center justify-center gap-3 pb-5 font-semibold cursor-pointer transition-all ${
                  tipoUsuario === 'estudiante'
                    ? 'text-[#1d6ff2] border-b-2 border-[#1d6ff2]'
                    : 'text-[#667394] border-b-2 border-transparent'
                }`}
              >
                <User size={23} />
                Estudiante
              </button>

              <button
                type="button"
                onClick={() => setTipoUsuario('docente')}
                className={`flex items-center justify-center gap-3 pb-5 font-semibold cursor-pointer transition-all ${
                  tipoUsuario === 'docente'
                    ? 'text-[#1d6ff2] border-b-2 border-[#1d6ff2]'
                    : 'text-[#667394] border-b-2 border-transparent'
                }`}
              >
                <CalendarCheck size={23} />
                Docente
              </button>
            </div>

            <form onSubmit={manejarLogin} className="space-y-7">

              {/* Correo */}
              <div>
                <label className="block text-[#14264b] font-medium mb-3">
                  Correo institucional
                </label>

                <div className="relative">
                  <Mail
                    size={24}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5f6f91]"
                  />

                  <input
                    type="email"
                    placeholder="nombre@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-16 pl-14 pr-5 bg-white text-[#14264b] border border-[#dce3ee] rounded-2xl outline-none transition-all placeholder:text-[#a7b1c4] focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[#14264b] font-medium mb-3">
                  Contraseña
                </label>

                <div className="relative">
                  <Lock
                    size={24}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5f6f91]"
                  />

                  <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-14 bg-white text-[#14264b] border border-[#dce3ee] rounded-2xl outline-none transition-all placeholder:text-[#a7b1c4] focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <Eye
                    size={24}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#5f6f91]"
                    
                  />
                </div>
              </div>

              {/* Opciones */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-[#667394] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md border-[#dce3ee] accent-[#1d6ff2]"
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  className="text-[#1d6ff2] font-medium hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-4 py-3 text-center">
                  {error}
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                className="w-full  cursor-pointer h-16 bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
              >
                Iniciar sesión
              </button>


            </form>

            <p className="text-center text-[#667394] mt-10">
              ¿No tienes cuenta?{' '}
              <span className="text-[#1d6ff2] font-medium cursor-pointer hover:underline">
                Contacta al administrador
              </span>
            </p>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Login;