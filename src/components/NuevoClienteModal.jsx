import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const NuevoClienteModal = ({ isOpen, onClose, onClienteCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    origen: 'sitio_web_1',
    estado: 'activo'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const clienteData = {
        ...formData,
        fecha_registro: new Date().toISOString()
      }

      const { data, error } = await db.createCliente(clienteData)
      
      if (error) {
        console.error('Error al crear cliente:', error)
        alert('Error al crear el cliente')
      } else {
        alert('¡Cliente creado exitosamente!')
        onClienteCreated()
        onClose()
        setFormData({
          nombre: '',
          empresa: '',
          email: '',
          telefono: '',
          origen: 'sitio_web_1',
          estado: 'activo'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Empresa S.L."
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuevoClienteModal

