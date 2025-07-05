import React from 'react'
import { X, Calendar, User, AlertCircle, CheckCircle, Clock, Building } from 'lucide-react'
import { Button } from './ui/button'

const VerTareaModal = ({ tarea, isOpen, onClose }) => {
  if (!isOpen || !tarea) return null

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'llamada': return '📞'
      case 'email': return '📧'
      case 'reunion': return '🤝'
      case 'seguimiento': return '👀'
      case 'propuesta': return '📋'
      case 'administrativo': return '📁'
      default: return '📋'
    }
  }

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'llamada': return 'Llamada'
      case 'email': return 'Email'
      case 'reunion': return 'Reunión'
      case 'seguimiento': return 'Seguimiento'
      case 'propuesta': return 'Propuesta'
      case 'administrativo': return 'Administrativo'
      default: return tipo
    }
  }

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'baja': return 'text-green-600 bg-green-100'
      case 'media': return 'text-yellow-600 bg-yellow-100'
      case 'alta': return 'text-red-600 bg-red-100'
      case 'urgente': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPrioridadTexto = (prioridad) => {
    switch (prioridad) {
      case 'baja': return '🟢 Baja'
      case 'media': return '🟡 Media'
      case 'alta': return '🔴 Alta'
      case 'urgente': return '🚨 Urgente'
      default: return prioridad
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'text-yellow-600 bg-yellow-100'
      case 'en_progreso': return 'text-blue-600 bg-blue-100'
      case 'completada': return 'text-green-600 bg-green-100'
      case 'cancelada': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳ Pendiente'
      case 'en_progreso': return '🔄 En Progreso'
      case 'completada': return '✅ Completada'
      case 'cancelada': return '❌ Cancelada'
      default: return estado
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'en_progreso': return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'completada': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelada': return <X className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const isVencida = () => {
    if (!tarea.fecha_vencimiento) return false
    const hoy = new Date()
    const vencimiento = new Date(tarea.fecha_vencimiento)
    return vencimiento < hoy && tarea.estado !== 'completada'
  }

  const getDiasRestantes = () => {
    if (!tarea.fecha_vencimiento) return null
    const hoy = new Date()
    const vencimiento = new Date(tarea.fecha_vencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const diasRestantes = getDiasRestantes()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              {getEstadoIcon(tarea.estado)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detalles de la Tarea</h2>
              <p className="text-sm text-gray-500">Información completa de la tarea</p>
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
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Título de la Tarea</label>
              <p className="text-xl font-semibold text-gray-900">{tarea.titulo}</p>
            </div>

            {tarea.descripcion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <div className="mt-1 bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{tarea.descripcion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(tarea.estado)}`}>
                    {getEstadoTexto(tarea.estado)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Prioridad</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                    {getPrioridadTexto(tarea.prioridad)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Tarea</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg">{getTipoIcon(tarea.tipo)}</span>
                  <p className="text-gray-900">{getTipoTexto(tarea.tipo)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Asignado a</label>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{tarea.asignado_a || 'Sin asignar'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Cliente Relacionado</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Building className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{tarea.cliente_relacionado || 'Sin cliente'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Vencimiento</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900">
                      {tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </p>
                    {diasRestantes !== null && (
                      <p className={`text-xs ${isVencida() ? 'text-red-600' : diasRestantes <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {isVencida() 
                          ? `Vencida hace ${Math.abs(diasRestantes)} días`
                          : diasRestantes === 0 
                            ? 'Vence hoy'
                            : diasRestantes === 1
                              ? 'Vence mañana'
                              : `${diasRestantes} días restantes`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                <p className="text-gray-900">
                  {tarea.created_at ? new Date(tarea.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">ID de la Tarea</label>
                <p className="text-gray-900 font-mono text-sm">{tarea.id}</p>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {isVencida() && (
            <div className="border-t pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">Tarea Vencida</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Esta tarea venció hace {Math.abs(diasRestantes)} días. Considera actualizarla o completarla.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {tarea.estado !== 'completada' && (
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Completada
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerTareaModal

