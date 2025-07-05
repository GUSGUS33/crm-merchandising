import React, { useState, useEffect } from 'react'
import { X, Save, CheckSquare } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const EditarTareaModal = ({ tarea, isOpen, onClose, onTareaUpdated }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cliente_relacionado: '',
    asignado_a: '',
    prioridad: 'media',
    tipo: 'llamada',
    estado: 'pendiente',
    fecha_vencimiento: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (tarea && isOpen) {
      setFormData({
        titulo: tarea.titulo || '',
        descripcion: tarea.descripcion || '',
        cliente_relacionado: tarea.cliente_relacionado || '',
        asignado_a: tarea.asignado_a || '',
        prioridad: tarea.prioridad || 'media',
        tipo: tarea.tipo || 'llamada',
        estado: tarea.estado || 'pendiente',
        fecha_vencimiento: tarea.fecha_vencimiento ? 
          new Date(tarea.fecha_vencimiento).toISOString().split('T')[0] : ''
      })
      setErrors({})
    }
  }, [tarea, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio'
    }
    
    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const tareaData = {
        ...formData,
        id: tarea.id,
        created_at: tarea.created_at
      }

      const { data, error } = await db.updateTarea(tarea.id, tareaData)
      
      if (error) {
        console.error('Error al actualizar tarea:', error)
        return
      }

      onTareaUpdated?.(data)
      onClose()
      
      // Reset form
      setFormData({
        titulo: '',
        descripcion: '',
        cliente_relacionado: '',
        asignado_a: '',
        prioridad: 'media',
        tipo: 'llamada',
        estado: 'pendiente',
        fecha_vencimiento: ''
      })
    } catch (error) {
      console.error('Error al actualizar tarea:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (!isOpen || !tarea) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Tarea</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Tarea *
            </label>
            <Input
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Llamar a cliente potencial"
              className={errors.titulo ? 'border-red-500' : ''}
            />
            {errors.titulo && (
              <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles de la tarea..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente Relacionado
            </label>
            <select
              name="cliente_relacionado"
              value={formData.cliente_relacionado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar cliente</option>
              <option value="Juan Pérez">Juan Pérez</option>
              <option value="María García">María García</option>
              <option value="Carlos Mendoza">Carlos Mendoza</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignado a
            </label>
            <select
              name="asignado_a"
              value={formData.asignado_a}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar usuario</option>
              <option value="Administrador">Administrador</option>
              <option value="Gerente Comercial">Gerente Comercial</option>
              <option value="Comercial">Comercial</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
                <option value="urgente">🚨 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pendiente">⏳ Pendiente</option>
                <option value="en_progreso">🔄 En Progreso</option>
                <option value="completada">✅ Completada</option>
                <option value="cancelada">❌ Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tarea
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="llamada">📞 Llamada</option>
              <option value="email">📧 Email</option>
              <option value="reunion">🤝 Reunión</option>
              <option value="seguimiento">👀 Seguimiento</option>
              <option value="propuesta">📋 Propuesta</option>
              <option value="administrativo">📁 Administrativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Vencimiento *
            </label>
            <Input
              name="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              className={errors.fecha_vencimiento ? 'border-red-500' : ''}
            />
            {errors.fecha_vencimiento && (
              <p className="text-red-500 text-xs mt-1">{errors.fecha_vencimiento}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarTareaModal

