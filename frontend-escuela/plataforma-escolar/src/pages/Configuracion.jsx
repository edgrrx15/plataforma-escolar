import React from 'react';
import { Settings, Save, Shield, Bell } from 'lucide-react';

const Configuracion = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b3d]">Configuración</h1>
          <p className="text-[#667394]">Ajustes generales de la plataforma</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#1d6ff2] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 active:scale-95">
          <Save size={20} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#e4eaf3] shadow-sm p-6 sm:p-8">
        <div className="max-w-2xl space-y-8">
          
          {/* Sección 1 */}
          <section>
            <h2 className="text-lg font-bold text-[#0f1b3d] flex items-center gap-2 mb-4">
              <Settings size={20} className="text-[#1d6ff2]" />
              Información de la Escuela
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0f1b3d] mb-1">Nombre de la Institución</label>
                <input type="text" defaultValue="EduClass" className="w-full px-4 py-2.5 rounded-xl border border-[#e4eaf3] bg-white text-[#0f1b3d] outline-none focus:border-[#1d6ff2] focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f1b3d] mb-1">Ciclo Escolar Actual</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-[#e4eaf3] bg-white text-[#0f1b3d] outline-none focus:border-[#1d6ff2] focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <option>2023 - 2024</option>
                  <option selected>2024 - 2025</option>
                  <option>2025 - 2026</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-[#e4eaf3]" />

          {/* Sección 2 */}
          <section>
            <h2 className="text-lg font-bold text-[#0f1b3d] flex items-center gap-2 mb-4">
              <Shield size={20} className="text-[#1d6ff2]" />
              Privacidad y Seguridad
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#cbd5e1] text-[#1d6ff2] focus:ring-[#1d6ff2]" />
                <div>
                  <p className="font-medium text-[#0f1b3d]">Registro de Alumnos</p>
                  <p className="text-sm text-[#667394]">Permitir que los alumnos se auto-registren en la plataforma</p>
                </div>
              </label>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Configuracion;
