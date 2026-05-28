import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState({
    total_alumnos: 0,
    total_docentes: 0,
    clases_activas: 0,
    eventos_proximos: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchStats();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-[#1d6ff2]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b3d]">Panel de Control</h1>
        <p className="text-[#667394]">Bienvenido al panel de administración de EduClass</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-white p-6 rounded-3xl border border-[#e4eaf3] shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#667394]">Total de Alumnos</p>
              <h2 className="text-3xl font-bold text-[#0f1b3d] mt-1">{stats.total_alumnos}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#1d6ff2] rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-6 rounded-3xl border border-[#e4eaf3] shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#667394]">Docentes Activos</p>
              <h2 className="text-3xl font-bold text-[#0f1b3d] mt-1">{stats.total_docentes}</h2>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-6 rounded-3xl border border-[#e4eaf3] shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#667394]">Clases Activas</p>
              <h2 className="text-3xl font-bold text-[#0f1b3d] mt-1">{stats.clases_activas}</h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-white p-6 rounded-3xl border border-[#e4eaf3] shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#667394]">Eventos Próximos</p>
              <h2 className="text-3xl font-bold text-[#0f1b3d] mt-1">{stats.eventos_proximos}</h2>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <CalendarIcon size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8fbff] border border-[#e4eaf3] rounded-3xl p-8 text-center mt-6">
        <h3 className="text-lg font-bold text-[#0f1b3d] mb-2">Acceso rápido</h3>
        <p className="text-[#667394] mb-6 max-w-md mx-auto">
          Utiliza la barra lateral para gestionar alumnos, docentes, materias y ajustar la configuración de la plataforma.
        </p>
      </div>
    </div>
  );
};

export default Admin;