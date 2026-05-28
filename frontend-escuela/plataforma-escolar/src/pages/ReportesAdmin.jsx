import React from 'react';
import { FileText, TrendingUp, Download, PieChart } from 'lucide-react';

const ReportesAdmin = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b3d]">Reportes</h1>
          <p className="text-[#667394]">Monitorea el rendimiento de la escuela</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white text-[#0f1b3d] border border-[#e4eaf3] px-4 py-2.5 rounded-xl font-medium hover:bg-[#f8fbff] transition-colors shadow-sm active:scale-95">
          <Download size={20} />
          <span>Exportar PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1 */}
        <div className="bg-white rounded-3xl border border-[#e4eaf3] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-[#1d6ff2] rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#0f1b3d]">Promedio General</h3>
              <p className="text-sm text-[#667394]">Rendimiento por grado</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center bg-[#f8fbff] rounded-2xl border border-dashed border-[#cbd5e1] text-[#94a3b8]">
            [Gráfico de barras aquí]
          </div>
        </div>

        {/* Gráfico 2 */}
        <div className="bg-white rounded-3xl border border-[#e4eaf3] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <PieChart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#0f1b3d]">Asistencia</h3>
              <p className="text-sm text-[#667394]">Porcentaje global</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center bg-[#f8fbff] rounded-2xl border border-dashed border-[#cbd5e1] text-[#94a3b8]">
            [Gráfico circular aquí]
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesAdmin;
