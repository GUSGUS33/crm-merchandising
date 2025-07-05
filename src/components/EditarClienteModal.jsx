import React, { useState, useEffect } from 'react'
import { X, Save, Building } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const EditarClienteModal = ({ cliente, isOpen, onClose, onClienteUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    origen: 'sitio_web_1',
    estado: 'activo'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (cliente && isOpen) {
      setFormData({
        nombre: cliente.nombre || '',
        empresa: cliente.empresa || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        origen: cliente.origen || 'sitio_web_1',
        estado: cliente.estado || 'activo'
      })
      setErrors({})
    }
  }, [cliente, isOpen])

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const clienteData = {
        ...formData,
        id: cliente.id,
        fecha_registro: cliente.fecha_registro
      }

      const { data, error } = await db.updateCliente(cliente.id, clienteData)
      
      if (error) {
        console.error('Error al actualizar cliente:', error)
        return
      }

      onClienteUpdated?.(data)
      onClose()
      
      // Reset form
      setFormData({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        origen: 'sitio_web_1',
        estado: 'activo'
      })
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
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

  if (!isOpen || !cliente) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
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
              placeholder="Empresa S.L."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sitio_web_1">Sitio Web 1</option>
              <option value="sitio_web_2">Sitio Web 2</option>
              <option value="sitio_web_3">Sitio Web 3</option>
              <option value="referido">Referido</option>
              <option value="marketing">Marketing</option>
              <option value="otro">Otro</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="activo">✅ Activo</option>
              <option value="inactivo">❌ Inactivo</option>
            </select>
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
              className="bg-blue-600 hover:bg-blue-700"
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

export default EditarClienteModal

