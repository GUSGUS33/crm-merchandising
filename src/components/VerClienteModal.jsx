import React, { useState } from 'react'
import { X, Mail, Phone, Building, MapPin, Calendar, Globe, MessageCircle, User } from 'lucide-react'
import { Button } from './ui/button'
import WhatsAppHistorial from './WhatsAppHistorial'

const VerClienteModal = ({ cliente, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('info')

  if (!isOpen || !cliente) return null

  const getOrigenIcon = (origen) => {
    switch (origen) {
      case 'sitio_web_1': return '🔵'
      case 'sitio_web_2': return '🟢'
      case 'sitio_web_3': return '🟣'
      case 'referido': return '👥'
      case 'marketing': return '📢'
      default: return '🌐'
    }
  }

  const getOrigenTexto = (origen) => {
    switch (origen) {
      case 'sitio_web_1': return 'Sitio Web 1'
      case 'sitio_web_2': return 'Sitio Web 2'
      case 'sitio_web_3': return 'Sitio Web 3'
      case 'referido': return 'Referido'
      case 'marketing': return 'Marketing'
      default: return 'Otro'
    }
  }

  const getEstadoColor = (estado) => {
    return estado === 'activo' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  const renderInfoTab = () => (
    <div className="space-y-6">
      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
            <p className="text-lg font-semibold text-gray-900">{cliente.nombre}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Empresa</label>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{cliente.empresa}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(cliente.estado)}`}>
                {cliente.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:text-blue-800">
                {cliente.email}
              </a>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Teléfono</label>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:text-blue-800">
                {cliente.telefono}
              </a>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Origen</label>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getOrigenIcon(cliente.origen)}</span>
              <p className="text-gray-900">{getOrigenTexto(cliente.origen)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">
                {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">ID del Cliente</label>
            <p className="text-gray-900 font-mono text-sm">{cliente.id}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas del Cliente */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Actividad</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Presupuestos</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Facturas</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Tareas</p>
          </div>
        </div>
      </div>

      {/* Notas */}
      {cliente.notas && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{cliente.notas}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{cliente.nombre}</h2>
              <p className="text-sm text-gray-500">{cliente.empresa}</p>
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 mr-2 inline" />
              Información
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'whatsapp'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2 inline" />
              WhatsApp
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && renderInfoTab()}
          {activeTab === 'whatsapp' && (
            <WhatsAppHistorial contacto={cliente} tipo="cliente" />
          )}
        </div>
      </div>
    </div>
  )
}

export default VerClienteModal

