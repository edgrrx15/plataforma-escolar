import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  Upload,
  CheckCircle2,
  MessageSquare,
  User,
  Download,
  Users
} from 'lucide-react';

const DetallesTarea = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tareaData, setTareaData] = useState(null);
  const [entregaData, setEntregaData] = useState(null);
  const [entregasAlumnos, setEntregasAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estudiante states
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  // Docente states
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [calificacion, setCalificacion] = useState('');
  const [comentarioProfesor, setComentarioProfesor] = useState('');

  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');
  const idEstudiante = usuarioInfo?.id_estudiante;
  const esDocente = usuarioInfo?.rol === 'docente' || usuarioInfo?.rol === 'profesor';

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // Cargar detalles de la tarea
        const queryParams = new URLSearchParams();
        if (usuarioInfo.id_estudiante) queryParams.append('estudianteId', usuarioInfo.id_estudiante);
        if (usuarioInfo.id_profesor) queryParams.append('profesorId', usuarioInfo.id_profesor);

        const resTarea = await fetch(`http://localhost:3000/api/tareas/${id}?${queryParams.toString()}`);
        if (!resTarea.ok) throw new Error('Tarea no encontrada');
        const dataTarea = await resTarea.json();
        setTareaData(dataTarea);

        if (esDocente) {
          // Si es docente, cargar lista de estudiantes
          const resAlumnos = await fetch(`http://localhost:3000/api/tareas/${id}/entregas`);
          const dataAlumnos = await resAlumnos.json();
          setEntregasAlumnos(dataAlumnos);
        } else if (idEstudiante) {
          // Si es estudiante, cargar su entrega
          const resEntrega = await fetch(`http://localhost:3000/api/tareas/${id}/entrega?estudianteId=${idEstudiante}`);
          const dataEntrega = await resEntrega.json();
          if (dataEntrega.entregada) {
            setEntregaData(dataEntrega.entrega);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [id, idEstudiante, esDocente]);

  // Funciones de Estudiante
  const handleEntregar = async (e) => {
    e.preventDefault();
    if (!idEstudiante) return alert('No se detectó la sesión del estudiante.');

    setSubiendo(true);
    const formData = new FormData();
    formData.append('id_tarea', id);
    formData.append('id_estudiante', idEstudiante);
    formData.append('mensaje', mensaje);
    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      const response = await fetch('http://localhost:3000/api/entregas', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEntregaData(data.entrega); // Marcamos como entregado
      } else {
        alert('Hubo un error al subir la tarea.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al comunicarse con el servidor.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleDesenviar = async () => {
    if (!entregaData) return;
    if (!window.confirm('¿Seguro que deseas anular tu entrega?')) return;

    setSubiendo(true);
    try {
      const response = await fetch(`http://localhost:3000/api/entregas/${entregaData.id_entrega}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setEntregaData(null);
        setArchivo(null);
        setMensaje('');
      } else {
        alert('Error al desenviar la tarea.');
      }
    } catch (e) {
      alert('Error de red al intentar desenviar.');
    } finally {
      setSubiendo(false);
    }
  };

  // Función compartida
  const handleDescargar = (id_entrega) => {
    window.open(`http://localhost:3000/api/entregas/${id_entrega}/descargar`, '_blank');
  };

  // Funciones de Docente
  const handleCalificar = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado || !alumnoSeleccionado.id_entrega) return;
    
    setSubiendo(true);
    try {
      const res = await fetch(`http://localhost:3000/api/entregas/${alumnoSeleccionado.id_entrega}/calificar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion, comentarios_profesor: comentarioProfesor })
      });
      if (res.ok) {
        alert('Calificación guardada correctamente');
        window.location.reload();
      } else {
        alert('Error al calificar.');
      }
    } catch (e) {
      alert('Error de red al calificar.');
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-b-4 border-blue-200 border-t-[#1d6ff2]"></div>
      </div>
    );
  }

  if (!tareaData) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tarea no encontrada</h2>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8">

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(`/clases/${tareaData.id_clase}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 w-fit"
        >
          <ArrowLeft size={18} />
          Volver a la clase
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Panel Izquierdo: Detalles de la Tarea (Compartido) */}
        <div className={`${esDocente ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText size={28} />
              </div>
              <div className="flex-1 pt-1">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
                  {tareaData.titulo}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                  <User size={14} />
                  <span>{tareaData.profesor_nombre}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-slate-800 font-bold bg-slate-50 px-3 py-1.5 rounded-lg text-sm">
                <span>{tareaData.puntos_maximos} pts</span>
              </div>
              <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-lg text-sm">
                <Clock size={14} />
                <span>Sin fecha límite</span>
              </div>
            </div>

            <div className="prose max-w-none text-slate-600">
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{tareaData.descripcion}</p>
            </div>
          </div>

          {/* Comentarios Privados (Solo Estudiante) */}
          {!esDocente && entregaData && entregaData.calificacion !== null && (
            <div className="bg-emerald-50 rounded-3xl sm:rounded-[24px] p-5 sm:p-6 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle2 size={20} />
                Tarea Calificada
              </h3>
              <p className="text-emerald-700 text-lg font-bold mb-1">
                Calificación: {entregaData.calificacion} / {tareaData.puntos_maximos}
              </p>
              {entregaData.comentarios_profesor && (
                <div className="mt-4 bg-white/60 p-4 rounded-xl text-emerald-800 italic">
                  "{entregaData.comentarios_profesor}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Derecho: Dinámico según Rol */}
        <div className={`${esDocente ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-5 sm:p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
            
            {/* VISTA ESTUDIANTE */}
            {!esDocente && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-slate-800">Tu trabajo</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${entregaData ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {entregaData ? 'Entregado' : 'Asignado'}
                  </span>
                </div>

                {entregaData ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">¡Trabajo enviado!</h3>
                    
                    {entregaData.contenido_entrega && (
                      <div className="bg-slate-50 p-3 rounded-xl text-slate-600 text-sm mb-4 text-left border border-slate-100">
                        <p className="font-bold text-xs text-slate-400 mb-1">Tu mensaje:</p>
                        {entregaData.contenido_entrega}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                      <button 
                        onClick={() => handleDescargar(entregaData.id_entrega)}
                        className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                      >
                        <Download size={18} />
                        Descargar archivo enviado
                      </button>

                      <button
                        type="button"
                        onClick={handleDesenviar}
                        disabled={subiendo}
                        className="flex items-center justify-center gap-2 w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl transition-colors"
                      >
                        {subiendo ? (
                          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Desenviar Tarea'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEntregar} className="space-y-5">
                    <div className="border-2 border-dashed border-indigo-100 bg-indigo-50/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center hover:bg-indigo-50 transition-colors relative">
                      <input
                        type="file"
                        onChange={(e) => setArchivo(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm">
                          <Upload size={20} />
                        </div>
                        {archivo ? (
                          <span className="text-indigo-600 font-bold text-sm truncate max-w-[200px]">{archivo.name}</span>
                        ) : (
                          <>
                            <span className="text-indigo-600 font-bold text-sm">Añadir archivo</span>
                            <span className="text-slate-400 text-xs">PDF, Word, Imágenes...</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <MessageSquare size={16} className="text-slate-400" />
                        Comentario privado
                      </label>
                      <textarea
                        rows="3"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        placeholder="Escribe un mensaje al docente..."
                        className="text-black w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={subiendo || (!archivo && !mensaje.trim())}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                      {subiendo ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'Entregar Tarea'
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* VISTA DOCENTE */}
            {esDocente && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20}/></div>
                  <h2 className="text-xl font-extrabold text-slate-800">Entregas de los alumnos</h2>
                </div>

                {!alumnoSeleccionado ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {entregasAlumnos.map(alumno => (
                      <div 
                        key={alumno.id_estudiante}
                        onClick={() => setAlumnoSeleccionado(alumno)}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white text-indigo-600 font-bold flex items-center justify-center border border-indigo-100">
                            {alumno.iniciales}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{alumno.nombre} {alumno.apellido}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${alumno.id_entrega ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                              {alumno.id_entrega ? 'Entregado' : 'Falta'}
                            </span>
                          </div>
                        </div>
                        {alumno.calificacion !== null && alumno.id_entrega && (
                          <div className="font-bold text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            {alumno.calificacion} pts
                          </div>
                        )}
                      </div>
                    ))}
                    {entregasAlumnos.length === 0 && (
                      <p className="text-slate-500 italic col-span-2 text-center p-4">No hay estudiantes inscritos en esta clase.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                    <button 
                      onClick={() => {
                        setAlumnoSeleccionado(null);
                        setCalificacion('');
                        setComentarioProfesor('');
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold flex items-center gap-1"
                    >
                      <ArrowLeft size={14}/> Volver a lista
                    </button>
                    
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">{alumnoSeleccionado.iniciales}</div>
                      {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                    </h3>

                    {!alumnoSeleccionado.id_entrega ? (
                      <div className="text-center p-6 bg-white rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500">Este alumno aún no ha entregado la tarea.</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contenido enviado</p>
                          {alumnoSeleccionado.contenido_entrega && (
                            <p className="text-slate-700 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">"{alumnoSeleccionado.contenido_entrega}"</p>
                          )}
                          {alumnoSeleccionado.tiene_archivo ? (
                            <button 
                              onClick={() => handleDescargar(alumnoSeleccionado.id_entrega)}
                              className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                            >
                              <Download size={16}/> Descargar archivo adjunto
                            </button>
                          ) : (
                            <p className="text-slate-400 text-sm italic text-center py-2">Sin archivo adjunto</p>
                          )}
                        </div>

                        <form onSubmit={handleCalificar} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Calificación</label>
                            <input 
                              type="number" 
                              required
                              min="0"
                              max={tareaData.puntos_maximos}
                              value={calificacion}
                              onChange={(e) => setCalificacion(e.target.value)}
                              placeholder={`Máximo ${tareaData.puntos_maximos}`}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            {alumnoSeleccionado.calificacion !== null && (
                              <p className="text-emerald-600 text-xs font-bold mt-1 flex items-center gap-1">
                                <CheckCircle2 size={12}/> Calificación actual: {alumnoSeleccionado.calificacion}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Retroalimentación</label>
                            <textarea
                              rows="2"
                              value={comentarioProfesor}
                              onChange={(e) => setComentarioProfesor(e.target.value)}
                              placeholder="Escribe un comentario al alumno..."
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            ></textarea>
                          </div>
                          <button 
                            type="submit"
                            disabled={subiendo}
                            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            {subiendo ? 'Guardando...' : 'Guardar Calificación'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DetallesTarea;
