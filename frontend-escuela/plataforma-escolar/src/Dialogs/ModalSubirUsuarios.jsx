import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Trash2, AlertCircle } from 'lucide-react';

const ModalSubirUsuarios = ({ modalSubirUsuarios, setModalSubirUsuarios, onUploadSuccess }) => {
    const [archivo, setArchivo] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Manejar la selección de archivo por el input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validarYGuardarArchivo(file);
    };

    // Manejar el arrastrar y soltar
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        validarYGuardarArchivo(file);
    };

    const validarYGuardarArchivo = (file) => {
        setError('');
        if (file) {
            // Validar que sea un archivo Excel o CSV
            const validExtensions = ['.xlsx', '.xls', '.csv'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (validExtensions.includes(fileExtension)) {
                setArchivo(file);
            } else {
                setError('Por favor, selecciona un archivo válido de Excel (.xlsx, .xls) o CSV.');
                setArchivo(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!archivo) return;

        setCargando(true);
        setError('');

        try {
            // FormData para enviar el archivo al backend
            const formData = new FormData();
            formData.append('file', archivo);

            const host = window.location.hostname;
            const response = await fetch(`http://${host}:3000/api/admin/usuarios/importar`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al procesar el archivo en el servidor.');
            }

            const data = await response.json();
            if (onUploadSuccess) onUploadSuccess(data);

            alert(`¡Importación exitosa! Se importaron ${data.importados} usuarios correctamente.`);
            setModalSubirUsuarios(false);
            setArchivo(null);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Ocurrió un error al intentar subir e importar el archivo.');
        } finally {
            setCargando(false);
        }
    };

    if (!modalSubirUsuarios) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-2xl rounded-3xl sm:rounded-[32px] bg-white border border-[#e4eaf3] shadow-[0_30px_100px_rgba(15,27,61,0.25)] p-6 sm:p-8 max-h-[95vh] overflow-y-auto">

                {/* BOTÓN CERRAR */}
                <button
                    onClick={() => {
                        setModalSubirUsuarios(false);
                        setArchivo(null);
                        setError('');
                    }}
                    className="cursor-pointer absolute right-4 top-4 sm:right-5 sm:top-5 w-10 h-10 rounded-full flex items-center justify-center text-[#667394] hover:bg-[#f1f5fb] hover:text-[#0f1b3d] transition"
                >
                    <X size={22} />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4 sm:gap-5 mb-8 mt-2 sm:mt-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#e7f1ff] flex items-center justify-center shrink-0">
                        <UploadCloud className="text-[#1d6ff2] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#08183f]">Importar Usuarios</h2>
                        <p className="text-sm sm:text-base text-[#667394] mt-1 sm:mt-2">Sube un archivo de Excel (.xlsx) para registrar alumnos o docentes masivamente.</p>
                    </div>
                </div>

                {/* ÁREA DE DRAG AND DROP */}
                <div className="mb-6">
                    {!archivo ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-56 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${isDragging
                                ? 'border-[#1d6ff2] bg-blue-50/50 scale-[1.02]'
                                : 'border-[#dce3ee] bg-[#f8fbff] hover:bg-blue-50/30 hover:border-blue-300'
                                }`}
                        >
                            <div className="w-16 h-16 mb-4 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1d6ff2]">
                                <FileSpreadsheet size={32} strokeWidth={1.5} />
                            </div>
                            <p className="text-[#08183f] font-bold text-lg mb-1">Haz clic o arrastra tu archivo aquí</p>
                            <p className="text-[#667394] text-sm text-center">Soporta archivos .xlsx, .xls o .csv hasta 10MB</p>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="w-full rounded-[24px] border border-[#dce3ee] bg-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-green-600">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div className="truncate">
                                    <p className="font-bold text-[#08183f] truncate">{archivo.name}</p>
                                    <p className="text-sm text-[#667394]">
                                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setArchivo(null)}
                                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                title="Eliminar archivo"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* MENSAJE DE ERROR */}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl mb-6 text-sm font-medium">
                        <AlertCircle size={18} className="shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* NOTA DE PLANTILLA (Opcional pero recomendada) */}
                <div className="bg-slate-50 border border-[#dce3ee] rounded-2xl p-4 mb-2 flex items-start gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-[#1d6ff2] shrink-0" />
                    <p className="text-sm text-[#667394]">
                        Asegúrate de que el archivo contenga las columnas correctas: <span className="font-semibold text-[#08183f]">Nombre, Apellido, Email, Rol</span> y <span className="font-semibold text-[#08183f]">Contraseña</span>.
                    </p>
                </div>

                {/* FOOTER & BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={() => {
                            setModalSubirUsuarios(false);
                            setArchivo(null);
                        }}
                        disabled={cargando}
                        className="flex-1 h-14 rounded-2xl border border-[#dce3ee] hover:bg-[#E7F1FF] text-[#08183f] font-semibold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!archivo || cargando}
                        className="flex-1 h-14 rounded-2xl bg-[#1d6ff2] hover:bg-[#155fd4] text-white font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Procesando archivo...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={20} />
                                <span>Subir Archivo</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalSubirUsuarios;