import React, { useState, useEffect } from 'react'
import { Plus, X, Edit3, Save, Trash2 } from 'lucide-react'

const NotasPostIt = () => {
  const [notas, setNotas] = useState([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [textoEditando, setTextoEditando] = useState('')

  // Colores disponibles para las notas
  const colores = [
    'bg-yellow-200 border-yellow-300',
    'bg-pink-200 border-pink-300',
    'bg-blue-200 border-blue-300',
    'bg-green-200 border-green-300',
    'bg-purple-200 border-purple-300',
    'bg-orange-200 border-orange-300'
  ]

  // Cargar notas del localStorage al inicializar
  useEffect(() => {
    const notasGuardadas = localStorage.getItem('crm-notas-postit')
    if (notasGuardadas) {
      setNotas(JSON.parse(notasGuardadas))
    }
  }, [])

  // Guardar notas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('crm-notas-postit', JSON.stringify(notas))
  }, [notas])

  const agregarNota = () => {
    if (nuevaNota.trim()) {
      const nuevaNotaObj = {
        id: Date.now(),
        texto: nuevaNota.trim(),
        color: colores[Math.floor(Math.random() * colores.length)],
        fechaCreacion: new Date().toISOString()
      }
      setNotas([...notas, nuevaNotaObj])
      setNuevaNota('')
      setMostrarFormulario(false)
    }
  }

  const eliminarNota = (id) => {
    setNotas(notas.filter(nota => nota.id !== id))
  }

  const iniciarEdicion = (nota) => {
    setEditandoId(nota.id)
    setTextoEditando(nota.texto)
  }

  const guardarEdicion = () => {
    if (textoEditando.trim()) {
      setNotas(notas.map(nota => 
        nota.id === editandoId 
          ? { ...nota, texto: textoEditando.trim() }
          : nota
      ))
    }
    setEditandoId(null)
    setTextoEditando('')
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setTextoEditando('')
  }

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          📝 Notas Rápidas
        </h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Nota</span>
        </button>
      </div>

      {/* Formulario para nueva nota */}
      {mostrarFormulario && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <textarea
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows="3"
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => {
                setMostrarFormulario(false)
                setNuevaNota('')
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={agregarNota}
              disabled={!nuevaNota.trim()}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Grid de notas */}
      {notas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p>No hay notas aún</p>
          <p className="text-sm">Haz clic en "Nueva Nota" para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notas.map((nota) => (
            <div
              key={nota.id}
              className={`${nota.color} border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group`}
              style={{
                minHeight: '150px',
                transform: `rotate(${Math.random() * 4 - 2}deg)`,
                transformOrigin: 'center'
              }}
            >
              {/* Botones de acción */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                {editandoId === nota.id ? (
                  <>
                    <button
                      onClick={guardarEdicion}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      title="Guardar"
                    >
                      <Save className="h-3 w-3" />
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      title="Cancelar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => iniciarEdicion(nota)}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Editar"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => eliminarNota(nota.id)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Contenido de la nota */}
              <div className="pr-8">
                {editandoId === nota.id ? (
                  <textarea
                    value={textoEditando}
                    onChange={(e) => setTextoEditando(e.target.value)}
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-gray-800"
                    rows="4"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {nota.texto}
                  </p>
                )}
              </div>

              {/* Fecha de creación */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-600 opacity-70">
                {formatearFecha(nota.fechaCreacion)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotasPostIt

