import React, { useState } from 'react'
import { X, Mail } from 'lucide-react'

const ModalRecuperar = ({modalAbierto, setModalAbierto}) => {

  return (
    <>
      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[95vh]">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            {/* Icono */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="text-blue-600" size={30} />
            </div>

            {/* Título */}
            <h2 className="mt-4 text-center text-2xl font-semibold text-gray-900">
              ¿Olvidaste tu contraseña?
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Ingresa tu correo electrónico y un administrador te contactará para ayudarte a recuperar tu cuenta.
            </p>

            {/* Formulario */}
            <form className="mt-6 space-y-4">
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Correo Insitucional
                </label>

                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Enviar enlace
              </button>
            </form>

            {/* Texto extra */}
            <p className="mt-4 text-center text-sm text-gray-500">
              Recuerda revisar tu carpeta de spam o correo no deseado.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ModalRecuperar