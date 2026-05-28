import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Loader2, UploadCloud, Search } from 'lucide-react';

import ModalAgregarAlumno from '../Dialogs/ModalAgregarAlumno';
import ModalSubirUsuarios from '../Dialogs/ModalSubirUsuarios';
import ModalEditarUsuario from '../Dialogs/ModalEditarUsuario';
import ModalEliminarUsuario from '../Dialogs/ModalEliminarUsuario';
import { GooeyInput } from '../components/Buscador';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    // Estados de Modales
    const [modalAgregarAlumno, setModalAgregarAlumno] = useState(false);
    const [modalSubirUsuarios, setModalSubirUsuarios] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

    // Estado para saber a quién estamos editando o eliminando
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                // Ajusta la IP según tu backend
                const response = await fetch('http://localhost:3000/api/admin/usuarios');
                if (response.ok) {
                    const data = await response.json();
                    setUsuarios(data);
                }
            } catch (error) {
                console.error('Error fetching admin usuarios:', error);
            } finally {
                setCargando(false);
            }
        };
        fetchUsuarios();
    }, []);

    // Filtro seguro usando optional chaining (?) por si algún dato viene nulo
    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Funciones auxiliares para colores según el rol
    const getRoleStyles = (rol) => {
        const r = rol?.toLowerCase();
        if (r === 'admin') return 'bg-amber-100 text-amber-800';
        if (r === 'docente') return 'bg-blue-100 text-blue-800';
        return 'bg-purple-100 text-purple-800'; // estudiante
    };

    const getAvatarStyles = (rol) => {
        const r = rol?.toLowerCase();
        if (r === 'admin') return 'bg-amber-100 text-amber-700';
        if (r === 'docente') return 'bg-blue-100 text-[#1d6ff2]';
        return 'bg-purple-100 text-purple-600'; // estudiante
    };

    return (
        <div className="space-y-6 max-w-[2000px] mx-auto sm:px-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                    <h1 className="text-3xl font-bold text-[#08183f]">Gestión de Usuarios</h1>
                    <p className="text-[#667394] mt-1 text-sm sm:text-base">Administra los alumnos, docentes y administradores de la institución.</p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                    <button
                        onClick={() => setModalSubirUsuarios(true)}
                        className="flex items-center justify-center gap-2 bg-white border border-[#dce3ee] text-[#08183f] px-5 py-3 rounded-2xl font-bold hover:bg-[#f1f5fb] transition-all shadow-sm active:scale-95">
                        <UploadCloud size={20} className="text-[#1d6ff2]" />
                        <span>Importar CSV / Excel</span>
                    </button>

                    <button
                        onClick={() => setModalAgregarAlumno(true)}
                        className="flex items-center justify-center gap-2 bg-[#1d6ff2] text-white px-5 py-3 rounded-2xl font-bold hover:bg-[#155fd4] transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                        <UserPlus size={20} />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {/* TABLA CONTENEDOR */}
            <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#e4eaf3] shadow-[0_8px_30px_rgba(15,27,61,0.04)] overflow-hidden">

                {/* BARRA DE BÚSQUEDA (TOOLS) */}
                <div className="p-4 sm:p-6 border-b border-[#e4eaf3] flex justify-between items-center bg-[#fcfdff]">
                    <GooeyInput
                        value={busqueda}
                        collapsedWidth={400}
                        expandedWidth={600}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, correo o rol..."
                    />
                </div>

                {/* TABLA DATA */}
                <div className="overflow-x-auto min-h-[350px]">
                    {cargando ? (
                        <div className="flex flex-col items-center justify-center h-[350px] gap-3">
                            <Loader2 className="animate-spin text-[#1d6ff2]" size={40} />
                            <p className="text-[#667394] font-medium">Cargando usuarios...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-[#e4eaf3] bg-[#f8fbff] text-sm text-[#667394]">
                                    <th className="px-6 py-4 font-bold">Usuario</th>
                                    <th className="px-6 py-4 font-bold">Rol</th>
                                    <th className="px-6 py-4 font-bold">Estado</th>
                                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e4eaf3]">
                                {usuariosFiltrados.map((u) => (
                                    <tr key={`user-${u.id_usuario}`} className="hover:bg-[#f8fbff]/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-lg ${getAvatarStyles(u.rol)}`}>
                                                    {u.nombre?.[0] || ''}{u.apellido?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#08183f]">{u.nombre} {u.apellido}</p>
                                                    <p className="text-sm text-[#667394]">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${getRoleStyles(u.rol)}`}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${u.estado || u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.estado || u.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setUsuarioSeleccionado(u); // Guardar usuario antes de abrir
                                                        setModalEditarAbierto(true);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center text-[#667394] hover:text-[#1d6ff2] hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Editar usuario"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUsuarioSeleccionado(u);
                                                        setModalEliminarAbierto(true);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center text-[#667394] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!cargando && usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-[#667394]">
                                                <Search size={40} className="mb-3 text-[#dce3ee]" />
                                                <p className="font-semibold text-lg text-[#08183f]">No se encontraron usuarios</p>
                                                <p className="text-sm">Intenta ajustar los términos de búsqueda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINACIÓN */}
                <div className="p-4 sm:p-6 border-t border-[#e4eaf3] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-[#667394] bg-[#fcfdff]">
                    <p>Mostrando <span className="text-[#08183f] font-bold">{usuariosFiltrados.length}</span> resultados</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-[#dce3ee] rounded-xl bg-white hover:bg-[#f1f5fb] hover:text-[#08183f] transition-colors disabled:opacity-50 disabled:hover:bg-white" disabled>
                            Anterior
                        </button>
                        <button className="px-4 py-2 border border-[#dce3ee] rounded-xl bg-white hover:bg-[#f1f5fb] hover:text-[#08183f] transition-colors disabled:opacity-50 disabled:hover:bg-white" disabled>
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALES: SIEMPRE VAN FUERA DE LOS BUCLES (MAP) Y LAS TABLAS */}
            <ModalSubirUsuarios
                modalSubirUsuarios={modalSubirUsuarios}
                setModalSubirUsuarios={setModalSubirUsuarios}
            />

            <ModalAgregarAlumno
                modalAgregarAlumno={modalAgregarAlumno}
                setModalAgregarAlumno={setModalAgregarAlumno}
            />

            <ModalEditarUsuario
                modalEditarAbierto={modalEditarAbierto}
                setModalEditarAbierto={setModalEditarAbierto}
                usuario={usuarioSeleccionado} // Pasamos el usuario a editar
            />

            {/* Asumiendo que ya tienes creado este modal */}
            <ModalEliminarUsuario
                modalEliminarAbierto={modalEliminarAbierto}
                setModalEliminarAbierto={setModalEliminarAbierto}
                usuario={usuarioSeleccionado} // Pasamos el usuario a eliminar
            />

        </div>
    );
};

export default Usuarios;