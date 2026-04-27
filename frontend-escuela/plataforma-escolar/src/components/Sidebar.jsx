import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Calendar,
  User,
  LogOut,
  GraduationCap,
  BookOpenCheck,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = ({ usuario, setUsuario }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const manejarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/');
  };

  return (
    <>
      {/* TOPBAR MÓVIL */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-20 bg-[#f8fbff]/90 backdrop-blur-xl border-b border-[#e4eaf3] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1d6ff2] flex items-center justify-center shadow-lg shadow-blue-500/25">
            <GraduationCap className="text-white" size={27} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#1d6ff2] leading-none">
              EduClass
            </h1>
            <p className="text-xs text-[#667394] mt-1">
              Portal académico
            </p>
          </div>
        </div>

        <button
          onClick={() => setMenuAbierto(true)}
          className="w-11 h-11 rounded-2xl bg-white border border-[#e4eaf3] text-[#0f1b3d] flex items-center justify-center shadow-sm active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* FONDO OSCURO MÓVIL */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-72 sm:w-80 lg:w-64
          bg-[#f8fbff] border-r border-[#e4eaf3]
          text-[#0f1b3d] flex flex-col
          transition-transform duration-300 ease-in-out
          ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 py-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1d6ff2] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <GraduationCap className="text-white" size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#1d6ff2] leading-none">
                EduClass
              </h1>
              <p className="text-xs text-[#667394] mt-1">
                Portal académico
              </p>
            </div>
          </div>

          <button
            onClick={() => setMenuAbierto(false)}
            className="lg:hidden w-10 h-10 rounded-2xl bg-white border border-[#e4eaf3] text-[#667394] flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Usuario */}
        <div className="mx-6 mb-6 p-4 rounded-3xl bg-white border border-[#e4eaf3] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#eef5ff] flex items-center justify-center">
              <User className="text-[#1d6ff2]" size={22} />
            </div>

            <div className="overflow-hidden">
              <p className="font-bold truncate">
                {usuario?.nombre || 'Usuario'}
              </p>
              <p className="text-sm text-[#667394] truncate">
                {usuario?.email || 'Cuenta institucional'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <ul className="space-y-2">
            <EnlaceSidebar
              to="/dashboard"
              icon={<LayoutDashboard size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Dashboard
            </EnlaceSidebar>

            <EnlaceSidebar
              to="/clases"
              icon={<BookOpen size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Mis clases
            </EnlaceSidebar>

            <EnlaceSidebar
              to="/tareas"
              icon={<ClipboardList size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Tareas
            </EnlaceSidebar>

            <EnlaceSidebar
              to="/horario"
              icon={<Calendar size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Horario
            </EnlaceSidebar>

            {/* Solo mostramos entegas si el usuario es docente */}
            {usuario?.rol === 'docente' && (
              <EnlaceSidebar
                to="/entregas"
                icon={<BookOpenCheck size={22} />}
                cerrarMenu={() => setMenuAbierto(false)}
              >
                Entregas
              </EnlaceSidebar>
            )}

            <EnlaceSidebar
              to="/calificaciones"
              icon={<BarChart3 size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Calificaciones
            </EnlaceSidebar>

            <EnlaceSidebar
              to="/perfil"
              icon={<User size={22} />}
              cerrarMenu={() => setMenuAbierto(false)}
            >
              Perfil
            </EnlaceSidebar>
          </ul>
        </nav>

        {/* Cerrar sesión */}
        <div className="p-4 border-t border-[#e4eaf3]">
          <button
            onClick={manejarCerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-2xl text-[#ef4444] font-semibold hover:bg-red-100 transition-all active:scale-[0.98]"
          >
            <LogOut size={22} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

export function EnlaceSidebar({ to, icon, children, cerrarMenu }) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={cerrarMenu}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
            isActive
              ? 'bg-[#1d6ff2] text-white shadow-lg shadow-blue-500/25'
              : 'text-[#667394] hover:bg-white hover:text-[#1d6ff2] hover:shadow-sm'
          }`
        }
      >
        {icon}
        <span>{children}</span>
      </NavLink>
    </li>
  );
}