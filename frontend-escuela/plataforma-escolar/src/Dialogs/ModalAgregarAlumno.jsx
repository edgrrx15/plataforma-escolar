import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, X, Calendar, Lock } from 'lucide-react';

const ModalAgregarUsuario = ({ modalAgregarAlumno, setModalAgregarAlumno, onAdd }) => {
    const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
    const [rolSeleccionado, setRolSeleccionado] = useState('alumno'); // Valor por defecto
    const [grupos, setGrupos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        email: '',
        telefono: '',
        contrasena: ''
    });

    useEffect(() => {
        if (modalAgregarAlumno) {
            const fetchGrupos = async () => {
                try {
                    const response = await fetch('http://192.168.0.30:3000/api/admin/clases');
                    if (response.ok) {
                        const data = await response.json();
                        setGrupos(data);
                        // Opcional: Ya no preseleccionamos el grupo obligatoriamente
                        // porque un admin o docente podría no necesitar grupo inicial
                    }
                } catch (error) {
                    console.error('Error fetching grupos:', error);
                }
            };
            fetchGrupos();
        }
    }, [modalAgregarAlumno]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.nombre || !form.apellido || !form.email || !form.contrasena || !rolSeleccionado) {
            alert('Por favor llena los campos requeridos (Nombre, Apellido, Email, Contraseña, Rol).');
            return;
        }

        setCargando(true);
        try {
            const payload = {
                ...form,
                id_clase: grupoSeleccionado ? Number(grupoSeleccionado) : null,
                rol: rolSeleccionado // Usamos el estado del select
            };

            const response = await fetch('http://localhost:3000/api/admin/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const nuevoUsuario = await response.json();
                if (onAdd) onAdd(nuevoUsuario);
                setModalAgregarAlumno(false);
                setForm({ nombre: '', apellido: '', fecha_nacimiento: '', email: '', telefono: '', contrasena: '' });
                setRolSeleccionado('alumno');
                setGrupoSeleccionado('');
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al agregar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        } finally {
            setCargando(false);
        }
    };

    if (!modalAgregarAlumno) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-3xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 max-h-[95vh] overflow-y-auto">

                {/* BOTÓN CERRAR */}
                <button
                    onClick={() => setModalAgregarAlumno(false)}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2 sm:mt-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#e7f1ff] flex items-center justify-center shrink-0">
                        <UserPlus className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">Agregar Usuario</h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">Registra un nuevo usuario en la plataforma.</p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Ej. Juan"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Apellido <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="text"
                                name="apellido"
                                placeholder="Ej. Pérez"
                                value={form.apellido}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Fecha de Nacimiento
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={form.fecha_nacimiento}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="correo@ejemplo.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Teléfono
                        </label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="tel"
                                name="telefono"
                                placeholder="+52 123 456 7890"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Contraseña Inicial <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="password"
                                name="contrasena"
                                placeholder="••••••••"
                                value={form.contrasena}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN ROL Y ASIGNACIÓN (AGRUPADOS EN UNA FILA) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mt-6 sm:mt-8">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Rol del Usuario <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={rolSeleccionado}
                            onChange={(e) => setRolSeleccionado(e.target.value)}
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all bg-white"
                        >
                            <option value="alumno">Estudiante</option>
                            <option value="docente">Docente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Asignación de Clase (Opcional)
                        </label>
                        <select
                            value={grupoSeleccionado}
                            onChange={(e) => setGrupoSeleccionado(e.target.value)}
                            disabled={rolSeleccionado === 'admin'} // Deshabilitar si es admin
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">-- Sin clase asignada --</option>
                            {grupos.map(g => (
                                <option key={g.id_clase} value={g.id_clase}>
                                    {g.materia_nombre} - {g.profesor_nombre} {g.profesor_apellido} ({g.codigo_acceso})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* FOOTER & BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={() => setModalAgregarAlumno(false)}
                        disabled={cargando}
                        className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!form.nombre || !form.apellido || !form.email || !form.contrasena || !rolSeleccionado || cargando}
                        className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            'Guardar Usuario'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalAgregarUsuario;