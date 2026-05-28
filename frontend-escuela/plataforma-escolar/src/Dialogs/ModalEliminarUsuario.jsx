import React from 'react';
import { X, Trash2 } from 'lucide-react';

const ModalEliminarUsuario = ({ modalEliminarAbierto, setModalEliminarAbierto, usuario, onEliminar }) => {

    const handleEliminar = async () => {
        if (!usuario || !usuario.id_usuario) return;

        try {
            const host = window.location.hostname;
            const response = await fetch(`http://${host}:3000/api/admin/usuarios/${usuario.id_usuario}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (onEliminar) onEliminar(usuario.id_usuario);
                alert('Usuario eliminado exitosamente');
                setModalEliminarAbierto(false);
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    };

    if (!modalEliminarAbierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8">

                {/* Botón Cerrar */}
                <button
                    onClick={() => setModalEliminarAbierto(false)}
                    className="absolute right-5 top-5 cursor-pointer text-[#667394] hover:text-gray-800 hover:bg-[#f1f5fb] p-1 rounded-full transition"
                >
                    <X size={22} />
                </button>

                {/* Icono */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="text-red-600" size={48} />
                    </div>
                </div>

                {/* Título */}
                <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f] text-center mb-2">
                    Eliminar Usuario
                </h2>

                {/* Mensaje de Confirmación */}
                <p className="text-[#667394] text-center mb-8">
                    ¿Estás seguro de que deseas eliminar a{' '}
                    <strong className="text-[#08183f]">
                        {usuario?.nombre} {usuario?.apellido}
                    </strong>
                    ? Esta acción no se puede deshacer.
                </p>

                {/* Botones de Acción */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setModalEliminarAbierto(false)}
                        className="flex-1 px-6 py-4 rounded-2xl border border-[#dce3ee] font-bold text-[#14264b] hover:bg-[#f1f5fb] hover:text-[#08183f] transition-all shadow-sm active:scale-95"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleEliminar}
                        className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/25 active:scale-95"
                    >
                        Eliminar
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalEliminarUsuario;