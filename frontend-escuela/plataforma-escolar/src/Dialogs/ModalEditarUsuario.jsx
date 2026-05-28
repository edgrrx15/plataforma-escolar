import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, X, Lock, UserCog } from 'lucide-react';

const ModalEditarUsuario = ({ modalEditarAbierto, setModalEditarAbierto, usuario, onUpdate }) => {
    const [cargando, setCargando] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: '',
        nueva_contrasena: '' // Se deja en blanco por defecto
    });

    // Cargar los datos del usuario al abrir el modal
    useEffect(() => {
        if (modalEditarAbierto && usuario) {
            setForm({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                email: usuario.email || '',
                telefono: usuario.telefono || '',
                rol: usuario.rol || 'estudiante',
                nueva_contrasena: ''
            });
        }
    }, [modalEditarAbierto, usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.nombre || !form.apellido || !form.email || !form.rol) {
            alert('Por favor llena los campos requeridos (Nombre, Apellido, Email, Rol).');
            return;
        }

        setCargando(true);
        try {
            // Preparamos el payload. Solo enviamos la contraseña si el usuario escribió una nueva
            const payload = {
                nombre: form.nombre,
                apellido: form.apellido,
                email: form.email,
                telefono: form.telefono,
                rol: form.rol,
                ...(form.nueva_contrasena && { contrasena: form.nueva_contrasena })
            };
            const host = window.location.hostname;
            const response = await fetch(`http://${host}:3000/api/admin/usuarios/${usuario.id_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                if (onUpdate) onUpdate(data.usuario || { ...usuario, ...payload });
                alert('Usuario actualizado con éxito');
                setModalEditarAbierto(false);
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    if (!modalEditarAbierto) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-3xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 max-h-[95vh] overflow-y-auto">

                {/* BOTÓN CERRAR */}
                <button
                    onClick={() => setModalEditarAbierto(false)}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2 sm:mt-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#f8fbff] border border-[#e4eaf3] flex items-center justify-center shrink-0">
                        <UserCog className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">Editar Usuario</h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">Modifica los datos personales o de acceso del usuario.</p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
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
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mt-5 sm:mt-6">
                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Rol del Usuario <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] transition-all bg-white"
                        >
                            <option value="estudiante">Estudiante</option>
                            <option value="docente">Docente</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[#14264b] font-bold mb-2">
                            Nueva Contraseña
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#1d6ff2] transition-colors" size={20} />
                            <input
                                type="password"
                                name="nueva_contrasena"
                                placeholder="Dejar en blanco para mantenerla"
                                value={form.nueva_contrasena}
                                onChange={handleChange}
                                className="w-full h-14 pl-12 pr-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* NOTA */}
                <div className="mt-6 bg-[#f8fbff] rounded-2xl p-4 border border-[#e4eaf3]">
                    <p className="text-sm text-[#667394]">
                        <span className="font-bold text-[#1d6ff2]">Nota:</span> Si cambias el rol de un usuario, ten en cuenta que sus accesos y permisos en el sistema se verán afectados inmediatamente.
                    </p>
                </div>

                {/* FOOTER & BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={() => setModalEditarAbierto(false)}
                        disabled={cargando}
                        className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!form.nombre || !form.apellido || !form.email || !form.rol || cargando}
                        className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalEditarUsuario;