import React from 'react'
import { useState } from 'react'
import { X } from 'lucide-react'

const ModalConfirmacionEliminar = ({ message, onClose, onConfirm }) => {

    const confirmarAccion = () => {
        onConfirm();
        onClose();
    }

    const cerrar = () => {
        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
        >
            <div className="relative w-full max-w-md rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 text-center overflow-y-auto max-h-[95vh]">

                {/* El botón de cerrar va arriba a la derecha */}
                <button
                    onClick={cerrar}
                    className="absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition cursor-pointer"
                >
                    <X size={22} />
                </button>

                {/* Icóno grande rojo */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-red-100">
                    <X className="text-red-600 w-10 h-10 sm:w-12 sm:h-12" />
                </div>

                {/* Título */}
                <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f] mb-2 sm:mb-4">
                    Confirmar eliminación
                </h2>

                {/* Mensaje */}
                <p className="text-[#667394] text-base sm:text-lg mb-6 sm:mb-8">
                    {message}
                    <br />
                    Esta acción no se puede deshacer.
                </p>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={cerrar}
                        className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmarAccion}
                        className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-500/25 cursor-pointer"
                    >
                        Eliminar definitivamente
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ModalConfirmacionEliminar