import React, { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'

const ModalEditarPerfil = ({ mostrarModal, setMostrarModal, perfil, setPerfil }) => {

    const [modificarPerfil, setModificarPerfil] = useState({
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
    })
    const [archivoFoto, setArchivoFoto] = useState(null);

    // Sincronizar el estado del modal con los datos actuales del perfil cuando se abre
    useEffect(() => {
        if (perfil) {
            // Formatear la fecha a YYYY-MM-DD para el input type="date"
            let fechaFormateada = '';
            if (perfil.fecha_nacimiento) {
                const fechaObj = new Date(perfil.fecha_nacimiento);
                if (!isNaN(fechaObj.getTime())) {
                    fechaFormateada = fechaObj.toISOString().split('T')[0];
                }
            }

            setModificarPerfil({
                telefono: perfil.telefono || '',
                direccion: perfil.direccion || '',
                fecha_nacimiento: fechaFormateada,
            });
            setArchivoFoto(null);
        }
    }, [perfil, mostrarModal]);

    const handleInputChange = (e, field) => {
        setModificarPerfil(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleFotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setArchivoFoto(e.target.files[0]);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setArchivoFoto(null);
    };

    const guardarCambios = async () => {
        try {
            const formData = new FormData();
            formData.append('email', perfil.email); // Solo se envía para que el backend sepa a quién actualizar
            formData.append('telefono', modificarPerfil.telefono);
            formData.append('direccion', modificarPerfil.direccion);
            formData.append('fecha_nacimiento', modificarPerfil.fecha_nacimiento);

            if (archivoFoto) {
                formData.append('foto', archivoFoto);
            }

            const response = await fetch('http://localhost:3000/api/perfil', {
                method: 'PUT',
                body: formData, // fetch automáticamente pondrá el Content-Type: multipart/form-data
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizar el estado del perfil en la pantalla principal
                setPerfil(prev => ({
                    ...prev,
                    telefono: modificarPerfil.telefono,
                    direccion: modificarPerfil.direccion,
                    fecha_nacimiento: modificarPerfil.fecha_nacimiento,
                }));

                cerrarModal();
            } else {
                console.error('Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
        }
    }

    if (!mostrarModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] w-full max-w-3xl max-h-[95vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 sm:mb-8 mt-2 sm:mt-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">Editar Perfil</h2>
                    <button
                        onClick={cerrarModal}
                        className="p-2 text-[#667394] hover:text-[#08183f] hover:bg-[#f5f8ff] rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6 sm:mb-8 flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f5f8ff] flex items-center justify-center border-2 border-dashed border-[#1d6ff2] mb-3 overflow-hidden relative cursor-pointer hover:bg-[#ebf1ff] transition-colors">
                        {archivoFoto ? (
                            <img src={URL.createObjectURL(archivoFoto)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFotoChange}
                        />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#667394]">Subir nueva foto</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#08183f]">Teléfono</label>
                            <input
                                type="tel"
                                value={modificarPerfil.telefono}
                                onChange={(e) => handleInputChange(e, 'telefono')}
                                className="w-full px-4 py-3 rounded-2xl border border-[#e4eaf3] bg-[#f5f8ff] text-[#08183f] focus:ring-2 focus:ring-[#1d6ff2] focus:border-[#1d6ff2] outline-none"
                                placeholder="Tu número de teléfono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#08183f]">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={modificarPerfil.fecha_nacimiento}
                                onChange={(e) => handleInputChange(e, 'fecha_nacimiento')}
                                className="w-full px-4 py-3 rounded-2xl border border-[#e4eaf3] bg-[#f5f8ff] text-[#08183f] focus:ring-2 focus:ring-[#1d6ff2] focus:border-[#1d6ff2] outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#08183f]">Dirección</label>
                            <input
                                type="text"
                                value={modificarPerfil.direccion}
                                onChange={(e) => handleInputChange(e, 'direccion')}
                                className="w-full px-4 py-3 rounded-2xl border border-[#e4eaf3] bg-[#f5f8ff] text-[#08183f] focus:ring-2 focus:ring-[#1d6ff2] focus:border-[#1d6ff2] outline-none"
                                placeholder="Tu dirección actual"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        onClick={cerrarModal}
                        className="flex-1 px-6 py-3 rounded-2xl border border-[#e4eaf3] bg-white text-[#08183f] font-semibold hover:bg-[#f5f8ff] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardarCambios}
                        className="flex-1 px-6 py-3 bg-[#1d6ff2] text-white font-semibold rounded-2xl hover:bg-[#155fd4] transition-colors shadow-lg shadow-blue-500/25"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalEditarPerfil