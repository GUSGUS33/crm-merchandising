import React from 'react'
import { X, Mail, Phone, Building, TrendingUp, Calendar, Globe, Euro } from 'lucide-react'
import { Button } from './ui/button'

const VerLeadModal = ({ lead, isOpen, onClose }) => {
  if (!isOpen || !lead) return null

  const getOrigenIcon = (origen) => {
    switch (origen) {
      case 'sitio_web_1': return '🔵'
      case 'sitio_web_2': return '🟢'
      case 'sitio_web_3': return '🟣'
      case 'referido': return '👥'
      case 'redes_sociales': return '📱'
      case 'email_marketing': return '📧'
      case 'llamada_fria': return '📞'
      case 'evento': return '🎪'
      default: return '🌐'
    }
  }

  const getOrigenTexto = (origen) => {
    switch (origen) {
      case 'sitio_web_1': return 'Sitio Web 1'
      case 'sitio_web_2': return 'Sitio Web 2'
      case 'sitio_web_3': return 'Sitio Web 3'
      case 'referido': return 'Referido'
      case 'redes_sociales': return 'Redes Sociales'
      case 'email_marketing': return 'Email Marketing'
      case 'llamada_fria': return 'Llamada Fría'
      case 'evento': return 'Evento'
      default: return 'Otro'
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'nuevo': return 'text-blue-600 bg-blue-100'
      case 'contactado': return 'text-yellow-600 bg-yellow-100'
      case 'calificado': return 'text-purple-600 bg-purple-100'
      case 'propuesta_enviada': return 'text-orange-600 bg-orange-100'
      case 'negociacion': return 'text-indigo-600 bg-indigo-100'
      case 'ganado': return 'text-green-600 bg-green-100'
      case 'perdido': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'nuevo': return '🆕 Nuevo'
      case 'contactado': return '📞 Contactado'
      case 'calificado': return '✅ Calificado'
      case 'propuesta_enviada': return '📋 Propuesta Enviada'
      case 'negociacion': return '🤝 Negociación'
      case 'ganado': return '🎉 Ganado'
      case 'perdido': return '❌ Perdido'
      default: return estado
    }
  }

  const getProbabilidadColor = (probabilidad) => {
    if (probabilidad >= 75) return 'text-green-600 bg-green-100'
    if (probabilidad >= 50) return 'text-yellow-600 bg-yellow-100'
    if (probabilidad >= 25) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detalles del Lead</h2>
              <p className="text-sm text-gray-500">Información completa del prospecto</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-lg font-semibold text-gray-900">{lead.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Empresa</label>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{lead.empresa}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(lead.estado)}`}>
                    {getEstadoTexto(lead.estado)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Origen</label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getOrigenIcon(lead.origen)}</span>
                  <p className="text-gray-900">{getOrigenTexto(lead.origen)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${lead.telefono}`} className="text-blue-600 hover:text-blue-800">
                    {lead.telefono}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Probabilidad de Cierre</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProbabilidadColor(lead.probabilidad)}`}>
                    {lead.probabilidad}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Valor Estimado</label>
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-gray-400" />
                  <p className="text-lg font-semibold text-green-600">
                    {new Intl.NumberFormat('es-ES', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    }).format(lead.valor_estimado || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {lead.notas && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notas</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notas}</p>
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Contacto</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {lead.fecha_contacto ? new Date(lead.fecha_contacto).toLocaleDateString('es-ES') : 'No disponible'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">ID del Lead</label>
                <p className="text-gray-900 font-mono text-sm">{lead.id}</p>
              </div>
            </div>
          </div>

          {/* Métricas del Lead */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Interacciones</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Presupuestos</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600">Tareas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Convertir a Cliente
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VerLeadModal

