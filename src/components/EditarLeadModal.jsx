import React, { useState, useEffect } from 'react'
import { X, Save, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const EditarLeadModal = ({ lead, isOpen, onClose, onLeadUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    origen: 'sitio_web_1',
    estado: 'nuevo',
    probabilidad: 25,
    valor_estimado: '',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        nombre: lead.nombre || '',
        empresa: lead.empresa || '',
        email: lead.email || '',
        telefono: lead.telefono || '',
        origen: lead.origen || 'sitio_web_1',
        estado: lead.estado || 'nuevo',
        probabilidad: lead.probabilidad || 25,
        valor_estimado: lead.valor_estimado || '',
        notas: lead.notas || ''
      })
      setErrors({})
    }
  }, [lead, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.empresa.trim()) {
      newErrors.empresa = 'La empresa es obligatoria'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.valor_estimado || formData.valor_estimado <= 0) {
      newErrors.valor_estimado = 'El valor estimado debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const leadData = {
        ...formData,
        id: lead.id,
        fecha_contacto: lead.fecha_contacto,
        valor_estimado: parseFloat(formData.valor_estimado)
      }

      const { data, error } = await db.updateLead(lead.id, leadData)
      
      if (error) {
        console.error('Error al actualizar lead:', error)
        return
      }

      onLeadUpdated?.(data)
      onClose()
      
      // Reset form
      setFormData({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        origen: 'sitio_web_1',
        estado: 'nuevo',
        probabilidad: 25,
        valor_estimado: '',
        notas: ''
      })
    } catch (error) {
      console.error('Error al actualizar lead:', error)
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

  if (!isOpen || !lead) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Lead</h2>
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
              Nombre Completo *
            </label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
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
              className={errors.empresa ? 'border-red-500' : ''}
            />
            {errors.empresa && (
              <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>
            )}
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
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="sitio_web_1">Sitio Web 1</option>
              <option value="sitio_web_2">Sitio Web 2</option>
              <option value="sitio_web_3">Sitio Web 3</option>
              <option value="referido">Referido</option>
              <option value="redes_sociales">Redes Sociales</option>
              <option value="email_marketing">Email Marketing</option>
              <option value="llamada_fria">Llamada Fría</option>
              <option value="evento">Evento</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="nuevo">🆕 Nuevo</option>
              <option value="contactado">📞 Contactado</option>
              <option value="calificado">✅ Calificado</option>
              <option value="propuesta_enviada">📋 Propuesta Enviada</option>
              <option value="negociacion">🤝 Negociación</option>
              <option value="ganado">🎉 Ganado</option>
              <option value="perdido">❌ Perdido</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              Valor Estimado (€) *
            </label>
            <Input
              name="valor_estimado"
              type="number"
              min="0"
              step="0.01"
              value={formData.valor_estimado}
              onChange={handleChange}
              placeholder="5000"
              className={errors.valor_estimado ? 'border-red-500' : ''}
            />
            {errors.valor_estimado && (
              <p className="text-red-500 text-xs mt-1">{errors.valor_estimado}</p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
              className="bg-purple-600 hover:bg-purple-700"
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

export default EditarLeadModal

