import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const NuevoLeadModal = ({ isOpen, onClose, onLeadCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    origen: '',
    probabilidad: 25,
    valor_estimado: '',
    notas: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevoLead = {
        ...formData,
        id: Date.now().toString(),
        estado: 'nuevo',
        fecha_contacto: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await db.leads.insert(nuevoLead)
      
      if (error) {
        alert('Error al crear el lead: ' + error.message)
        return
      }

      alert('¡Lead creado exitosamente!')
      onLeadCreated?.(nuevoLead)
      onClose()
      
      // Resetear formulario
      setFormData({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        origen: '',
        probabilidad: 25,
        valor_estimado: '',
        notas: ''
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <Input
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Empresa ABC S.L."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+34 600 123 456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origen
              </label>
              <select
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar origen</option>
                <option value="Sitio Web 1">Sitio Web 1</option>
                <option value="Sitio Web 2">Sitio Web 2</option>
                <option value="Sitio Web 3">Sitio Web 3</option>
                <option value="Referido">Referido</option>
                <option value="Redes Sociales">Redes Sociales</option>
                <option value="Email Marketing">Email Marketing</option>
                <option value="Llamada Fría">Llamada Fría</option>
                <option value="Evento">Evento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probabilidad de Cierre (%)
              </label>
              <select
                name="probabilidad"
                value={formData.probabilidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10% - Contacto inicial</option>
                <option value={25}>25% - Interés mostrado</option>
                <option value={50}>50% - Propuesta enviada</option>
                <option value={75}>75% - Negociación avanzada</option>
                <option value={90}>90% - Casi cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Estimado (€)
              </label>
              <Input
                name="valor_estimado"
                type="number"
                value={formData.valor_estimado}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Información adicional sobre el lead..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? 'Creando...' : 'Crear Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuevoLeadModal

