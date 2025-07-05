import React from 'react'
import { X, Globe, Mail, ExternalLink, Hash, Calendar, Activity } from 'lucide-react'
import { Button } from './ui/button'

const VerSitioWebModal = ({ isOpen, onClose, sitio, onEdit }) => {
  if (!isOpen || !sitio) return null

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'text-green-600 bg-green-100'
      case 'inactivo': return 'text-red-600 bg-red-100'
      case 'mantenimiento': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'activo': return '🟢 Activo'
      case 'inactivo': return '🔴 Inactivo'
      case 'mantenimiento': return '🟡 Mantenimiento'
      default: return estado
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Globe className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{sitio.nombre}</h2>
              <p className="text-sm text-gray-500">Información del sitio web</p>
            </div>
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

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Logo y información principal */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {sitio.logo ? (
                <img
                  src={sitio.logo}
                  alt={sitio.nombre}
                  className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <Globe className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{sitio.nombre}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(sitio.estado)}`}>
                  {getEstadoTexto(sitio.estado)}
                </span>
              </div>
              
              {sitio.descripcion && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {sitio.descripcion}
                </p>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Información de Contacto
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  URL del Sitio Web
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 mr-2">{sitio.url}</span>
                  {sitio.url && (
                    <a
                      href={sitio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="Abrir sitio web"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Email de Contacto
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 mr-2">{sitio.email}</span>
                  {sitio.email && (
                    <a
                      href={`mailto:${sitio.email}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Enviar email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información técnica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              Información Técnica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  ID del Sitio
                </label>
                <code className="bg-white px-2 py-1 rounded text-sm border">
                  {sitio.sitio_id || sitio.id}
                </code>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Estado Actual
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(sitio.estado)}`}>
                  {getEstadoTexto(sitio.estado)}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fechas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Creación
                </label>
                <span className="text-sm text-gray-900">
                  {formatDate(sitio.created_at)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Última Actualización
                </label>
                <span className="text-sm text-gray-900">
                  {formatDate(sitio.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas simuladas */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Estadísticas del Sitio
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">12</div>
                <div className="text-xs text-gray-500">Presupuestos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">8</div>
                <div className="text-xs text-gray-500">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">25</div>
                <div className="text-xs text-gray-500">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">€15.2k</div>
                <div className="text-xs text-gray-500">Facturado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            {sitio.url && (
              <Button
                variant="outline"
                onClick={() => window.open(sitio.url, '_blank')}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visitar Sitio
              </Button>
            )}
            
            {sitio.email && (
              <Button
                variant="outline"
                onClick={() => window.open(`mailto:${sitio.email}`, '_blank')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                onClose()
                onEdit(sitio)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Editar Sitio
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerSitioWebModal

