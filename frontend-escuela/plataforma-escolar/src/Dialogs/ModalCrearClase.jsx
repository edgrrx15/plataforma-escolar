import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Type, Clock, MapPin, CalendarDays, Award } from 'lucide-react';

const ModalCrearClase = ({ modalAbierto, setModalAbierto, onClaseCreada }) => {
    const [materias, setMaterias] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        nombre_personalizado: '',
        id_mat: '',
        periodo: '',
        anio: new Date().getFullYear(),
        creditos: '',
        id_aula: '',
        dias_semana: [],   // AHORA ES UN ARREGLO
        hora_inicio: '',
        hora_fin: ''
    });

    // Array estático para generar los botones de los días
    const diasDisponibles = [
        { label: 'L', value: 'Lunes' },
        { label: 'M', value: 'Martes' },
        { label: 'X', value: 'Miércoles' },
        { label: 'J', value: 'Jueves' },
        { label: 'V', value: 'Viernes' },
        { label: 'S', value: 'Sábado' }
    ];

    useEffect(() => {
        if (modalAbierto) {
            const fetchData = async () => {
                try {
                    const [resMaterias, resAulas] = await Promise.all([
                        fetch('http://localhost:3000/api/materias').catch(() => null),
                        fetch('http://localhost:3000/api/aulas').catch(() => null)
                    ]);

                    if (resMaterias && resMaterias.ok) {
                        const dataMat = await resMaterias.json();
                        setMaterias(dataMat);
                        if (dataMat.length > 0) {
                            setFormData(prev => ({ ...prev, id_mat: dataMat[0].id_mat }));
                        }
                    }

                    if (resAulas && resAulas.ok) {
                        const dataAulas = await resAulas.json();
                        setAulas(dataAulas);
                        if (dataAulas.length > 0) {
                            setFormData(prev => ({ ...prev, id_aula: dataAulas[0].id_aula }));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [modalAbierto]);

    // Función para seleccionar/deseleccionar días
    const toggleDia = (diaValor) => {
        setFormData(prev => {
            const diasActuales = prev.dias_semana;
            if (diasActuales.includes(diaValor)) {
                return { ...prev, dias_semana: diasActuales.filter(d => d !== diaValor) };
            } else {
                return { ...prev, dias_semana: [...diasActuales, diaValor] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDACIÓN DE CRÉDITOS VS DÍAS
        const numCreditos = Number(formData.creditos);
        if (formData.dias_semana.length !== numCreditos) {
            alert(`Has indicado que la clase es de ${numCreditos} créditos, por lo que debes seleccionar exactamente ${numCreditos} días de la semana. Actualmente has seleccionado ${formData.dias_semana.length}.`);
            return;
        }

        setCargando(true);

        try {
            const usuarioStr = localStorage.getItem('usuario');
            if (!usuarioStr) return;
            const usuarioObj = JSON.parse(usuarioStr);

            const payload = {
                id_profesor: usuarioObj.id_profesor,
                nombre_personalizado: formData.nombre_personalizado,
                id_mat: formData.id_mat,
                periodo: formData.periodo,
                anio: formData.anio,
                creditos: numCreditos,
                id_aula: formData.id_aula,
                dias_semana: formData.dias_semana, // Enviamos el array completo de días al backend
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin
            };

            const response = await fetch('http://localhost:3000/api/clases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (onClaseCreada) onClaseCreada();
                setModalAbierto(false);
                setFormData({
                    nombre_personalizado: '',
                    id_mat: materias.length > 0 ? materias[0].id_mat : '',
                    periodo: '',
                    anio: new Date().getFullYear(),
                    creditos: '',
                    id_aula: aulas.length > 0 ? aulas[0].id_aula : '',
                    dias_semana: [],
                    hora_inicio: '',
                    hora_fin: ''
                });
            } else {
                console.error("Error al crear la clase");
                alert('Ocurrió un error al intentar crear la clase.');
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            alert('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    if (!modalAbierto) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 py-6">
            <div className="relative w-full max-w-4xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] flex flex-col max-h-full overflow-hidden">

                {/* CLOSE */}
                <button
                    onClick={() => setModalAbierto(false)}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition z-10"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 p-6 sm:p-8 border-b border-[#e4eaf3] bg-[#fcfdff] shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#e7f1ff] flex items-center justify-center shrink-0">
                        <GraduationCap className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">
                            Crear nueva clase
                        </h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1">
                            Configura los detalles, horario y ubicación del curso.
                        </p>
                    </div>
                </div>

                {/* FORM CONTENEDOR */}
                <div className="p-6 sm:p-8 overflow-y-auto">
                    <form id="crear-clase-form" className="space-y-8" onSubmit={handleSubmit}>

                        {/* SECCIÓN 1: DATOS GENERALES */}
                        <div>
                            <h3 className="text-lg font-bold text-[#08183f] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1d6ff2] flex items-center justify-center text-sm">1</span>
                                Información Académica
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Nombre de la Clase (Opcional)
                                    </label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.nombre_personalizado}
                                            onChange={(e) => setFormData({ ...formData, nombre_personalizado: e.target.value })}
                                            placeholder="Ej. Matemáticas Avanzadas Grupo A"
                                            className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Materia Oficial <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.id_mat}
                                        onChange={(e) => setFormData({ ...formData, id_mat: e.target.value })}
                                        required
                                        className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] bg-white transition-all"
                                    >
                                        <option value="">Selecciona una materia</option>
                                        {materias.map(mat => (
                                            <option key={mat.id_mat} value={mat.id_mat}>
                                                {mat.codigo} - {mat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Créditos <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="6"
                                            value={formData.creditos}
                                            onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
                                            placeholder="Ej. 3 (Define los días a la semana)"
                                            className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Periodo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.periodo}
                                        onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                                        placeholder="Ejemplo: Enero - Junio"
                                        className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Año <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.anio}
                                        onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                                        placeholder="2026"
                                        className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-[#e4eaf3]" />

                        {/* SECCIÓN 2: HORARIO Y AULA */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[#08183f] flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1d6ff2] flex items-center justify-center text-sm">2</span>
                                    Horario y Ubicación
                                </h3>
                                {/* Contador visual de días seleccionados vs créditos */}
                                {formData.creditos && (
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${formData.dias_semana.length === Number(formData.creditos) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        Días: {formData.dias_semana.length} / {formData.creditos}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-[#14264b] font-bold mb-3">
                                        Días de la semana <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {diasDisponibles.map((dia) => {
                                            const isSelected = formData.dias_semana.includes(dia.value);
                                            return (
                                                <button
                                                    key={dia.value}
                                                    type="button"
                                                    onClick={() => toggleDia(dia.value)}
                                                    className={`w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-200 ${isSelected
                                                        ? 'bg-[#1d6ff2] text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-[#f8fbff] text-[#667394] border border-[#dce3ee] hover:border-blue-300 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {dia.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-[#94a3b8] mt-2">
                                        Selecciona la misma cantidad de días que de créditos ingresados.
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Aula asignada <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors z-10" size={20} />
                                        <select
                                            required
                                            value={formData.id_aula}
                                            onChange={(e) => setFormData({ ...formData, id_aula: e.target.value })}
                                            className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] bg-white transition-all appearance-none"
                                        >
                                            <option value="">Selecciona un aula</option>
                                            {aulas.map(a => (
                                                <option key={a.id_aula} value={a.id_aula}>
                                                    {a.edificio} - {a.numero} (Capacidad: {a.capacidad})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Hora de Inicio <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                                        <input
                                            type="time"
                                            required
                                            value={formData.hora_inicio}
                                            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                            className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[#14264b] font-bold mb-2">
                                        Hora de Fin <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                                        <input
                                            type="time"
                                            required
                                            value={formData.hora_fin}
                                            onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                                            className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* FOOTER & BUTTONS */}
                <div className="p-6 sm:p-8 border-t border-[#e4eaf3] bg-[#fcfdff] shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => setModalAbierto(false)}
                            disabled={cargando}
                            className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="crear-clase-form"
                            disabled={cargando}
                            className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {cargando ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                'Crear Clase Completa'
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ModalCrearClase;