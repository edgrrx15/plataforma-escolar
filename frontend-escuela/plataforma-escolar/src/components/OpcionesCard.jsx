import React from 'react'

function OpcionesCard() {
    return (
        <div className="flex justify-between">
            <h2 className="text-3xl font-semibold mb-6">Opciones</h2>
            <div className="space-x-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Opción 1
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    Opción 2
                </button>
            </div>
        </div>
    )
}
export default OpcionesCard