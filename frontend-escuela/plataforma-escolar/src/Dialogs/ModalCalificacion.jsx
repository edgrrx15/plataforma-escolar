import React, { useState, useEffect } from 'react';
import { X, Award } from 'lucide-react';

const ModalCalificacion = ({ modalAbierto, setModalAbierto, calificacionEdicion, idProfesor, onSave }) => {
    const [clases, setClases] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    
    const [idClase, setIdClase] = useState('');
    const [idEstudiante, setIdEstudiante] = useState('');
    const [calificacion, setCalificacion] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (modalAbierto && idProfesor) {
            const fetchClases = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/clases?profesorId=${idProfesor}`);
                    const data = await response.json();
                    setClases(data);
                } catch (e) {
                    console.error("Error al obtener clases:", e);
                }
            };
            fetchClases();
        }
    }, [modalAbierto, idProfesor]);

    useEffect(() => {
        if (calificacionEdicion) {
            setIdClase(calificacionEdicion.id_clase || '');
            setIdEstudiante(calificacionEdicion.id_estudiante || '');
            setCalificacion(calificacionEdicion.calificacion || '');
            setObservaciones(calificacionEdicion.observaciones || '');
        } else {
            setIdClase('');
            setIdEstudiante('');
            setCalificacion('');
            setObservaciones('');
            setEstudiantes([]);
        }
    }, [calificacionEdicion, modalAbierto]);

    useEffect(() => {
        if (idClase && !calificacionEdicion) {
            const fetchEstudiantes = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/clases/${idClase}/estudiantes`);
                    const data = await response.json();
                    setEstudiantes(data);
                } catch (e) {
                    console.error("Error al obtener estudiantes:", e);
                }
            };
            fetchEstudiantes();
        } else {
            setEstudiantes([]);
        }
    }, [idClase, calificacionEdicion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idClase || !idEstudiante || calificacion === '') return;

        setCargando(true);
        try {
            const url = calificacionEdicion 
                ? `http://localhost:3000/api/calificacion/${calificacionEdicion.id_calificacion}`
                : 'http://localhost:3000/api/calificacion';
            
            const method = calificacionEdicion ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_estudiante: Number(idEstudiante),
                    id_clase: Number(idClase),
                    calificacion: Number(calificacion),
                    observaciones
                })
            });

            const data = await response.json();
            if (response.ok) {
                setModalAbierto(false);
                if (onSave) onSave();
            } else {
                alert(data.error || 'Error al guardar la calificación.');
            }
        } catch (error) {
            alert('Error de red.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 ${modalAbierto ? 'block' : 'hidden'}`}>
            <div className="relative w-full max-w-xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh]">
                {/* CLOSE */}
                <button onClick={() => setModalAbierto(false)} className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition">
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2 sm:mt-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Award className="text-indigo-600 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">
                            {calificacionEdicion ? 'Modificar Calificación' : 'Agregar Calificación'}
                        </h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">
                            {calificacionEdicion ? 'Actualiza los datos de la calificación final.' : 'Registra la calificación final de un estudiante.'}
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!calificacionEdicion && (
                        <>
                            <div>
                                <label className="block text-[#14264b] font-semibold mb-2">Clase / Materia</label>
                                <select
                                    value={idClase}
                                    onChange={(e) => setIdClase(e.target.value)}
                                    className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-indigo-600 bg-white text-[#08183f]"
                                    required
                                >
                                    <option value="">Selecciona una clase</option>
                                    {clases.map(c => (
                                        <option key={c.id_clase} value={c.id_clase}>
                                            {c.materia_nombre} ({c.periodo} - {c.anio})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[#14264b] font-semibold mb-2">Estudiante</label>
                                <select
                                    value={idEstudiante}
                                    onChange={(e) => setIdEstudiante(e.target.value)}
                                    disabled={!idClase}
                                    className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-indigo-600 bg-white text-[#08183f] disabled:opacity-50"
                                    required
                                >
                                    <option value="">Selecciona un estudiante</option>
                                    {estudiantes.map(e => (
                                        <option key={e.id_estudiante} value={e.id_estudiante}>
                                            {e.nombre} {e.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {calificacionEdicion && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                            <p className="text-sm font-semibold text-slate-500">Materia</p>
                            <p className="font-bold text-slate-800 text-lg">{calificacionEdicion.materia_nombre}</p>
                            <p className="text-sm font-semibold text-slate-500 mt-2">Estudiante</p>
                            <p className="font-bold text-slate-800">{calificacionEdicion.estudiante_nombre} {calificacionEdicion.estudiante_apellido}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-[#14264b] font-semibold mb-2">Calificación Final</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={calificacion}
                            onChange={(e) => setCalificacion(e.target.value)}
                            placeholder="Ej. 95.5"
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-indigo-600 text-[#08183f]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-semibold mb-2">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Comentarios adicionales sobre el desempeño..."
                            className="w-full h-24 p-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-indigo-600 text-[#08183f] resize-none"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all">Cancelar</button>
                        <button type="submit" disabled={cargando} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center">
                            {cargando ? 'Guardando...' : 'Guardar Calificación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCalificacion;
