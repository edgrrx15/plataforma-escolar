import React, { useState, useEffect } from 'react'
import { X, GraduationCap } from 'lucide-react'

const ModalCrearClase = ({ modalAbierto, setModalAbierto, onClaseCreada }) => {
    const [materias, setMaterias] = useState([]);
    const [formData, setFormData] = useState({
        id_mat: '',
        periodo: '',
        anio: new Date().getFullYear()
    });

    useEffect(() => {
        if (modalAbierto) {
            // Fetch materias when modal opens
            const fetchMaterias = async () => {
                try {
                    const res = await fetch('http://localhost:3000/api/materias');
                    if (res.ok) {
                        const data = await res.json();
                        setMaterias(data);
                        if (data.length > 0) {
                            setFormData(prev => ({ ...prev, id_mat: data[0].id_mat }));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching materias:', error);
                }
            };
            fetchMaterias();
        }
    }, [modalAbierto]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const usuarioStr = localStorage.getItem('usuario');
            if (!usuarioStr) return;
            const usuarioObj = JSON.parse(usuarioStr);
            
            const response = await fetch('http://localhost:3000/api/clases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_mat: formData.id_mat,
                    id_profesor: usuarioObj.id_profesor,
                    periodo: formData.periodo,
                    anio: formData.anio
                })
            });

            if (response.ok) {
                if (onClaseCreada) onClaseCreada();
                setModalAbierto(false);
                setFormData({
                    id_mat: materias.length > 0 ? materias[0].id_mat : '',
                    periodo: '',
                    anio: new Date().getFullYear()
                });
            } else {
                console.error("Error al crear la clase");
            }
        } catch (error) {
            console.error('Error en la petición:', error);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 ${modalAbierto ? 'block' : 'hidden'}`}>

            <div className="relative w-full max-w-3xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 overflow-y-auto max-h-[95vh]">

                {/* CLOSE */}
                <button
                    onClick={() => setModalAbierto(false)}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2 sm:mt-0">

                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#e7f1ff] flex items-center justify-center shrink-0">
                        <GraduationCap
                            className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">
                            Crear nueva clase
                        </h2>

                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">
                            Selecciona la materia e ingresa el periodo escolar.
                        </p>
                    </div>

                </div>

                {/* FORM */}
                <form className="space-y-6" onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-[#14264b] font-medium mb-3">
                                Materia
                            </label>
                            <select
                                value={formData.id_mat}
                                onChange={(e) => setFormData({...formData, id_mat: e.target.value})}
                                required
                                className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] bg-white"
                            >
                                {materias.map(mat => (
                                    <option key={mat.id_mat} value={mat.id_mat}>
                                        {mat.codigo} - {mat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[#14264b] font-medium mb-3">
                                Periodo
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.periodo}
                                onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                                placeholder="Ejemplo: Enero - Junio"
                                className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-[#14264b] font-medium mb-3">
                                Año
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.anio}
                                onChange={(e) => setFormData({...formData, anio: e.target.value})}
                                placeholder="2026"
                                className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400"
                            />
                        </div>
                    </div>


                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">

                        <button
                            type="button"
                            onClick={() => setModalAbierto(false)}
                            className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                        >
                            Crear Clase
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default ModalCrearClase