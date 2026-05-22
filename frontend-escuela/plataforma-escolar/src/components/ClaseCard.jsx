import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MoreVertical, Users, Clock3, FileText, BarChart3, Trash2 } from 'lucide-react'
import ModalConfirmacionEliminar from '../Dialogs/ModalConfirmacionEliminar'

const ClaseCard = ({ searchQuery = "" }) => {
    const [clases, setClases] = useState([]);
    const [dropdownAbierto, setDropdownAbierto] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [claseSeleccionada, setClaseSeleccionada] = useState(null);
    const navigate = useNavigate();
    
    const usuarioStr = localStorage.getItem('usuario');
    const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
    const esDocente = usuarioObj?.rol === 'docente';

    useEffect(() => {
        const obtenerClases = async () => {
            let queryParams = '';
            if (usuarioObj) {
                const params = new URLSearchParams();
                if (usuarioObj.id_estudiante) params.append('estudianteId', usuarioObj.id_estudiante);
                if (usuarioObj.id_profesor) params.append('profesorId', usuarioObj.id_profesor);
                queryParams = `?${params.toString()}`;
            }

            const response = await fetch(`http://localhost:3000/api/clases${queryParams}`);
            const data = await response.json();

            // Proteger contra errores de la API
            if (Array.isArray(data)) {
                setClases(data);
            } else {
                console.error("La API no devolvió un arreglo de clases:", data);
                setClases([]);
            }
        };
        obtenerClases();
    }, []);

    const abrirModal = (clase) => {
        setClaseSeleccionada(clase);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setClaseSeleccionada(null);
    };

    const abandonarOeliminarClase = async (id_clase) => {
        if (!usuarioObj) return;

        try {
            let url = '';
            
            if (esDocente) {
                // Endpoint para que el docente elimine la clase por completo
                url = `http://localhost:3000/api/clases/${id_clase}`;
            } else {
                // Endpoint para que el estudiante abandone la clase
                if (!usuarioObj.id_estudiante) return;
                url = `http://localhost:3000/api/clases/${id_clase}/estudiantes/${usuarioObj.id_estudiante}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // Filtramos la clase eliminada del estado actual para que desaparezca 
                setClases(clases.filter(c => c.id_clase !== id_clase));
                cerrarModal();
            } else {
                console.error("Error al procesar la solicitud:", data.error);
            }
        } catch (error) {
            console.error("Error de red al procesar la solicitud:", error);
        }
    };

    const clasesFiltradas = clases.filter(clase => {
        const matchMateria = clase.materia_nombre?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchProfesor = `${clase.profesor_nombre || ""} ${clase.profesor_apellido || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
        return matchMateria || matchProfesor;
    });

    return (
        <>
            {clases.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-8 bg-white border border-[#e4eaf3] rounded-[32px] shadow-sm text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <BookOpen size={48} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#08183f] mb-3">No hay clases disponibles</h3>
                    <p className="text-[#667394] max-w-md text-lg">
                        {esDocente 
                            ? "Aún no has creado ninguna clase. ¡Usa el botón de crear clase para empezar!" 
                            : "Actualmente no estás inscrito en ninguna clase. ¡Únete a una clase usando tu código de acceso para empezar!"
                        }
                    </p>
                </div>
            ) : clasesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-8 bg-white border border-[#e4eaf3] rounded-[32px] shadow-sm text-center w-full col-span-full">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                        <BookOpen size={36} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#08183f] mb-2">No se encontraron clases</h3>
                    <p className="text-[#667394] max-w-md text-sm">
                        No hay ninguna clase que coincida con tu búsqueda "{searchQuery}". Intenta con otros términos o códigos.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                    {clasesFiltradas.map((clase, index) => {
                        const gradients = [
                            'bg-gradient-to-br from-indigo-500 to-purple-600',
                            'bg-gradient-to-br from-blue-500 to-cyan-500',
                            'bg-gradient-to-br from-emerald-400 to-teal-500',
                            'bg-gradient-to-br from-orange-400 to-rose-500',
                        ];
                        const bgGradient = gradients[index % gradients.length];
                        const shadowColor = ['shadow-indigo-500/30', 'shadow-blue-500/30', 'shadow-teal-500/30', 'shadow-rose-500/30'][index % gradients.length];

                        return (
                            <div
                                key={index}
                                onClick={() => navigate(`/clases/${clase.id_clase}`)}
                                className="group relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                {/* Decorative background blob */}
                                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${bgGradient} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity duration-500`}></div>

                                <div className="relative z-10 flex items-start justify-between">
                                    <div
                                        className={`w-16 h-16 rounded-2xl ${bgGradient} shadow-lg ${shadowColor} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300`}
                                    >
                                        <BookOpen className="text-white drop-shadow-sm" size={28} />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDropdownAbierto(dropdownAbierto === index ? null : index);
                                            }}
                                            className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-700 relative z-20">
                                            <MoreVertical size={20} />
                                        </button>

                                        {dropdownAbierto === index && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setDropdownAbierto(null)}
                                                ></div>
                                                <div className=" absolute right-0 top-12 mt-1 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 py-1.5 z-50 transform origin-top-right transition-all">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            abrirModal(clase);
                                                            setDropdownAbierto(null);
                                                        }}
                                                        className="cursor-pointer w-full px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50 font-semibold transition-colors flex items-center gap-2.5">
                                                        <Trash2 size={16} />
                                                        {esDocente ? 'Eliminar clase' : 'Abandonar clase'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10 mt-6">
                                    <div className="flex flex-col gap-1.5">
                                        <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-800 tracking-tight leading-snug group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-500 transition-colors">
                                            {clase.materia_nombre}
                                        </h2>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-[17px]">
                                            <Users size={18} className="text-slate-400" />
                                            <span>{clase.profesor_nombre} {clase.profesor_apellido}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-50/80 text-indigo-600 rounded-xl">
                                                <BarChart3 size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Créditos</p>
                                                <p className="text-slate-700 font-semibold text-sm">{clase.creditos || 0} créditos</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 mt-4">
                                            <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-xl mt-0.5">
                                                <Clock3 size={18} />
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Horarios Asignados</p>
                                                <div className="flex flex-col gap-2">
                                                    {clase.horarios && clase.horarios.length > 0 ? (
                                                        clase.horarios.map((h, i) => (
                                                            <div key={i} className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 text-[12px] font-medium text-slate-600 bg-slate-50/80 px-3 py-2.5 rounded-xl border border-slate-100/80">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-800 uppercase tracking-wide">{h.dia.slice(0, 3)}</span>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span className="whitespace-nowrap text-slate-600">{h.hora_inicio?.slice(0, 5)} - {h.hora_fin?.slice(0, 5)}</span>
                                                                </div>
                                                                <span className="text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md font-bold text-[11px] whitespace-nowrap w-fit">
                                                                    Aula {h.aula}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm font-medium text-slate-400 italic bg-slate-50 px-3 py-2 rounded-xl">Sin horario asignado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Periodo Escolar</span>
                                            <span className="text-[14px] font-bold text-slate-700">{clase.periodo} {clase.anio}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Acceso</span>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                                <FileText size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-bold text-slate-600 font-mono tracking-wider">{clase.codigo_acceso}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {modalAbierto && claseSeleccionada && (
                        <ModalConfirmacionEliminar
                            message={esDocente 
                                ? `¿Estás seguro de que deseas eliminar permanentemente la clase "${claseSeleccionada.materia_nombre}"? Esta acción no se puede deshacer.`
                                : `¿Estás seguro de que deseas abandonar la clase "${claseSeleccionada.materia_nombre}"?`
                            }
                            onClose={cerrarModal}
                            onConfirm={() => abandonarOeliminarClase(claseSeleccionada.id_clase)}
                        />
                    )}
                </div>
            )}
        </>
    )
}

export default ClaseCard 