import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Filter, Loader2 } from 'lucide-react';
import ModalAgregarAlumno from '../Dialogs/ModalAgregarAlumno';
import { GooeyInput } from '../components/Buscador';
const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [modalAgregarAlumno, setModalAgregarAlumno] = useState(false);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch('http://192.168.0.30:3000/api/admin/usuarios');
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

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6 mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f1b3d]">Gestión de Usuarios</h1>
                    <p className="text-[#667394]">Administra los alumnos y docentes de la institución</p>
                </div>
                <button
                    onClick={() => setModalAgregarAlumno(true)}
                    className="flex items-center justify-center gap-2 bg-[#1d6ff2] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 active:scale-95">
                    <UserPlus size={20} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {modalAgregarAlumno && (
                <ModalAgregarAlumno
                    modalAgregarAlumno={modalAgregarAlumno}
                    setModalAgregarAlumno={setModalAgregarAlumno}
                />
            )}

            <div className="bg-white rounded-3xl border border-[#e4eaf3] shadow-sm overflow-hidden">
                {/* Barra de herramientas de la tabla */}
                <div className="p-5 border-b border-[#e4eaf3] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#f8fbff]">
                    <div className="relative w-full sm:w-96">
                        <GooeyInput
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar..."
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-[#e4eaf3] rounded-xl text-[#0f1b3d] bg-white hover:bg-[#f8fbff] transition-colors w-full sm:w-auto justify-center">
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto min-h-[300px]">
                    {cargando ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <Loader2 className="animate-spin text-[#1d6ff2]" size={40} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e4eaf3] bg-[#f8fbff] text-sm text-[#667394]">
                                    <th className="px-6 py-4 font-semibold">Usuario</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e4eaf3]">
                                {usuariosFiltrados.map((u, i) => (
                                    <tr key={`${u.rol}-${u.id}`} className="hover:bg-[#f8fbff]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.rol === 'Docente' ? 'bg-blue-100 text-[#1d6ff2]' : 'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    {u.nombre[0]}{u.apellido[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0f1b3d]">{u.nombre} {u.apellido}</p>
                                                    <p className="text-sm text-[#667394]">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.rol === 'Docente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.estado ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {u.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-[#667394] hover:text-[#1d6ff2] hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-2 text-[#667394] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-[#667394]">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                <div className="p-4 border-t border-[#e4eaf3] flex items-center justify-between text-sm text-[#667394]">
                    <p>Mostrando {usuariosFiltrados.length} usuarios</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-[#e4eaf3] rounded-lg bg-white hover:bg-[#f8fbff] disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 border border-[#e4eaf3] rounded-lg bg-white hover:bg-[#f8fbff] disabled:opacity-50" disabled>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;