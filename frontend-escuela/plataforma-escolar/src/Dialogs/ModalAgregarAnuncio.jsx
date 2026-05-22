import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

const ModalAgregarAnuncio = ({ modalAnuncioAbierto, setModalAnuncioAbierto, claseId }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleCrearAnuncio = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/anuncios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_clase: claseId,
                    titulo,
                    descripcion,
                    id_profesor: JSON.parse(localStorage.getItem('usuario') || '{}').id_profesor
                }),
            });

            if (response.ok) {
                setModalAnuncioAbierto(false);
                window.location.reload();
            } else {
                const data = await response.json();
                alert('Error al crear el anuncio: ' + (data.mensaje || data.error));
            }
        } catch (error) {
            console.error('Error al crear el anuncio:', error);
            alert('Error de conexión');
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 ${modalAnuncioAbierto ? 'block' : 'hidden'}`}>
            <div className="relative w-full max-w-2xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
                {/* CLOSE */}
                <button
                    onClick={() => setModalAnuncioAbierto(false)}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2 sm:mt-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#e7f1ff] flex items-center justify-center shrink-0">
                        <MessageSquare className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">Nuevo anuncio</h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">Publica un mensaje para toda la clase.</p>
                    </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400"
                            placeholder="Ej: Examen de Matemáticas"
                        />
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full px-5 py-4 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 resize-none h-32"
                            placeholder="Detalles del anuncio..."
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setModalAnuncioAbierto(false)}
                            className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrearAnuncio}
                            disabled={!titulo || !descripcion}
                            className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center"
                        >
                            Publicar anuncio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalAgregarAnuncio;