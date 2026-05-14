import React from 'react'
import { X, GraduationCap } from 'lucide-react'

const ModalAgregarClase = ({ modalAbierto, setModalAbierto }) => {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 ${modalAbierto ? 'block' : 'hidden'}`}>

            <div className="relative w-full max-w-3xl rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-8 overflow-y-auto max-h-[95vh]">

                {/* CLOSE */}
                <button
                    onClick={() => setModalAbierto(false)}
                    className="cursor-pointer absolute right-5 top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-5 mb-8">

                    <div className="w-16 h-16 rounded-2xl bg-[#e7f1ff] flex items-center justify-center">
                        <GraduationCap
                            className="text-[#1d6ff2]"
                            size={32}
                        />
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-[#08183f]">
                            Nueva clase
                        </h2>

                        <p className="text-[#667394] mt-2">
                            Ingresa el codigo de la clase para unirte.
                        </p>
                    </div>

                </div>

                {/* FORM */}
                <form className="space-y-6">

                    <div>
                        <label className="block text-[#14264b] font-medium mb-3">
                            Codigo de la clase
                        </label>

                        <input
                            type="text"
                            placeholder="Ejemplo: RED-A12"
                            className="w-full h-14 px-5 border border-[#dce3ee] rounded-2xl outline-none focus:border-[#1d6ff2] focus:ring-4 focus:ring-blue-100 text-[#08183f] placeholder-gray-400"
                        />
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
                            Unirse a la clase
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default ModalAgregarClase