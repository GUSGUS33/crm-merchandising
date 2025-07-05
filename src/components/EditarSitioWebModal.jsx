import React, { useState, useEffect } from 'react'
import { X, Upload, Globe, Mail, FileText, Hash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const EditarSitioWebModal = ({ isOpen, onClose, sitio, onSitioUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    email: '',
    descripcion: '',
    sitio_id: '',
    estado: 'activo',
    logo: ''
  })
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')

  // Cargar datos del sitio cuando se abre el modal
  useEffect(() => {
    if (isOpen && sitio) {
      setFormData({
        nombre: sitio.nombre || '',
        url: sitio.url || '',
        email: sitio.email || '',
        descripcion: sitio.descripcion || '',
        sitio_id: sitio.sitio_id || sitio.id || '',
        estado: sitio.estado || 'activo',
        logo: sitio.logo || ''
      })
      setLogoPreview(sitio.logo || '')
    }
  }, [isOpen, sitio])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // En un entorno real, aquí subirías el archivo a un servicio de almacenamiento
      // Por ahora, creamos una URL temporal para la vista previa
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoUrl = e.target.result
        setLogoPreview(logoUrl)
        setFormData(prev => ({
          ...prev,
          logo: logoUrl
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.nombre || !formData.url || !formData.email) {
      alert('Por favor, completa todos los campos obligatorios.')
      return
    }

    // Validar formato de URL
    try {
      new URL(formData.url)
    } catch {
      alert('Por favor, ingresa una URL válida (ej: https://ejemplo.com)')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, ingresa un email válido.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await db.updateSitioWeb(sitio.id, formData)
      
      if (error) {
        console.error('Error al actualizar sitio web:', error)
        alert('Error al actualizar el sitio web. Por favor, inténtalo de nuevo.')
        return
      }

      // Notificar al componente padre
      if (onSitioUpdated && data && data[0]) {
        onSitioUpdated(data[0])
      }

      onClose()
      
    } catch (error) {
      console.error('Error al actualizar sitio web:', error)
      alert('Error al actualizar el sitio web. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Resetear formulario al cerrar
    setFormData({
      nombre: '',
      url: '',
      email: '',
      descripcion: '',
      sitio_id: '',
      estado: 'activo',
      logo: ''
    })
    setLogoPreview('')
    onClose()
  }

  if (!isOpen || !sitio) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Globe className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Editar Sitio Web</h2>
              <p className="text-sm text-gray-500">{sitio.nombre}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Sitio Web *
                </label>
                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Merchandising Corporativo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Sitio *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="sitio_id"
                    value={formData.sitio_id}
                    onChange={handleInputChange}
                    placeholder="SW001"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Sitio Web *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@ejemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del sitio web y sus servicios..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="activo">🟢 Activo</option>
                <option value="inactivo">🔴 Inactivo</option>
                <option value="mantenimiento">🟡 Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Logo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo del Sitio Web</h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cambiar Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG o SVG. Máximo 2MB. Deja vacío para mantener el logo actual.
                </p>
              </div>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span> {sitio.created_at ? new Date(sitio.created_at).toLocaleDateString('es-ES') : 'No disponible'}
              </div>
              <div>
                <span className="font-medium">Última actualización:</span> {sitio.updated_at ? new Date(sitio.updated_at).toLocaleDateString('es-ES') : 'No disponible'}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarSitioWebModal

