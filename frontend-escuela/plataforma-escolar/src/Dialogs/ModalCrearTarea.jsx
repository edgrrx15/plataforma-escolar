import React, { useState } from 'react'
import { X, ClipboardList } from 'lucide-react'

const ModalCrearTarea = ({ modalAbierto, setModalAbierto, idClase, onTareaCreada }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [puntos, setPuntos] = useState('100');
    const [cargando, setCargando] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!titulo || !idClase) return;
        
        setCargando(true);
        try {
            const response = await fetch('http://localhost:3000/api/tareas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_clase: idClase,
                    titulo,
                    descripcion,
                    puntos_maximos: puntos || 100
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setModalAbierto(false);
                setTitulo('');
                setDescripcion('');
                setPuntos('100');
                if (onTareaCreada) onTareaCreada();
            } else {
                alert(data.error || 'Error al crear la tarea.');
            }
        } catch (error) {
            alert('Error de red.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 ${modalAbierto ? 'block' : 'hidden'}`}>
            <div className="relative w-full max-w-2xl rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-8">
                {/* CLOSE */}
                <button onClick={() => setModalAbierto(false)} className="cursor-pointer absolute right-5 top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition">
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
                        <ClipboardList className="text-[#1d6ff2]" size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-[#08183f]">Nueva tarea</h2>
                        <p className="text-[#667394] mt-2">Crea una asignación para tus alumnos.</p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">Título de la tarea</label>
                        <input
                            type="text"
                            required
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej. Proyecto Final"
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">Descripción (Opcional)</label>
                        <textarea
                            rows="4"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Escribe las instrucciones detalladas..."
                            className="w-full px-5 py-4 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">Puntos Máximos</label>
                        <input
                            type="number"
                            min="1"
                            value={puntos}
                            onChange={(e) => setPuntos(e.target.value)}
                            className="w-full sm:w-1/3 h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] font-bold"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all">Cancelar</button>
                        <button type="submit" disabled={cargando || !titulo} className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center">
                            {cargando ? 'Guardando...' : 'Publicar tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default ModalCrearTarea
