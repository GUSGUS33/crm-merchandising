import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const NuevaTareaModal = ({ isOpen, onClose, onTareaCreated }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cliente_id: '',
    asignado_a: '',
    prioridad: 'media',
    fecha_vencimiento: '',
    tipo: 'llamada'
  })
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cargarClientes()
    }
  }, [isOpen])

  const cargarClientes = async () => {
    try {
      const { data } = await db.clientes.select()
      setClientes(data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevaTarea = {
        ...formData,
        id: Date.now().toString(),
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await db.tareas.insert(nuevaTarea)
      
      if (error) {
        alert('Error al crear la tarea: ' + error.message)
        return
      }

      alert('¡Tarea creada exitosamente!')
      onTareaCreated?.(nuevaTarea)
      onClose()
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        cliente_id: '',
        asignado_a: '',
        prioridad: 'media',
        fecha_vencimiento: '',
        tipo: 'llamada'
      })
    } catch (error) {
      alert('Error inesperado: ' + error.message)
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
  }

  // Generar fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Tarea *
            </label>
            <Input
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Llamar a cliente potencial"
              required
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente Relacionado
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.empresa}
                  </option>
                ))}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar usuario</option>
                <option value="admin@crm.com">Administrador</option>
                <option value="gerente@crm.com">Gerente Comercial</option>
                <option value="comercial@crm.com">Comercial</option>
                <option value="marketing@crm.com">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
                <option value="urgente">🚨 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Tarea
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="llamada">📞 Llamada</option>
                <option value="email">📧 Email</option>
                <option value="reunion">🤝 Reunión</option>
                <option value="seguimiento">👀 Seguimiento</option>
                <option value="propuesta">📋 Propuesta</option>
                <option value="administrativo">📁 Administrativo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento *
              </label>
              <Input
                name="fecha_vencimiento"
                type="datetime-local"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                min={today}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuevaTareaModal

