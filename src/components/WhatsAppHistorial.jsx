import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { whatsappService, whatsappNotifications } from '../lib/whatsapp'
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react'

const WhatsAppHistorial = ({ contacto, tipo = 'cliente' }) => {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    if (contacto?.telefono) {
      cargarMensajes()
    }
  }, [contacto])

  const cargarMensajes = () => {
    if (!contacto?.telefono) return
    
    const historial = whatsappService.getMessageHistory(contacto.telefono)
    setMensajes(historial)
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !contacto?.telefono) return

    setEnviando(true)
    try {
      await whatsappService.sendTextMessage(
        contacto.telefono,
        nuevoMensaje,
        {
          type: 'manual_message',
          contactoId: contacto.id,
          contactoTipo: tipo,
          userId: 'current_user'
        }
      )
      
      setNuevoMensaje('')
      setMostrarFormulario(false)
      cargarMensajes() // Recargar mensajes
      
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error enviando mensaje')
    } finally {
      setEnviando(false)
    }
  }

  const enviarNotificacionAutomatica = async (tipoNotificacion) => {
    if (!contacto?.telefono) return

    setEnviando(true)
    try {
      switch (tipoNotificacion) {
        case 'seguimiento':
          if (tipo === 'lead') {
            await whatsappNotifications.notifySeguimientoLead(contacto)
          }
          break
        case 'recordatorio':
          // Buscar próxima tarea del contacto
          const proximaTarea = {
            fecha_vencimiento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            descripcion: 'Reunión programada'
          }
          await whatsappNotifications.notifyRecordatorioReunion(contacto, proximaTarea)
          break
        default:
          break
      }
      
      cargarMensajes()
      
    } catch (error) {
      console.error('Error enviando notificación:', error)
      alert('Error enviando notificación')
    } finally {
      setEnviando(false)
    }
  }

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp)
    const ahora = new Date()
    const diferencia = ahora - fecha
    
    if (diferencia < 24 * 60 * 60 * 1000) {
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diferencia < 7 * 24 * 60 * 60 * 1000) {
      return fecha.toLocaleDateString('es-ES', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      })
    }
  }

  if (!contacto?.telefono) {
    return (
      <div className="text-center py-8">
        <Phone className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin número de teléfono</h3>
        <p className="mt-1 text-sm text-gray-500">
          Agrega un número de teléfono para usar WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con información del contacto */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{contacto.nombre}</h4>
            <p className="text-sm text-gray-600">{contacto.telefono}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Mensaje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cargarMensajes}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Formulario para nuevo mensaje */}
      {mostrarFormulario && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-3">
            <textarea
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows="3"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {tipo === 'lead' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enviarNotificacionAutomatica('seguimiento')}
                    disabled={enviando}
                  >
                    Seguimiento
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => enviarNotificacionAutomatica('recordatorio')}
                  disabled={enviando}
                >
                  Recordatorio
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setNuevoMensaje('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarMensaje}
                  disabled={enviando || !nuevoMensaje.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {enviando ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de mensajes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mensajes.length > 0 ? (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${mensaje.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  mensaje.direction === 'outbound'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{mensaje.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${
                    mensaje.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatearFecha(mensaje.timestamp)}
                  </p>
                  <div className="flex items-center space-x-1">
                    {mensaje.simulation && (
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        mensaje.direction === 'outbound' 
                          ? 'bg-blue-400 text-blue-100' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        SIM
                      </span>
                    )}
                    {mensaje.direction === 'outbound' && (
                      <CheckCircle className="w-3 h-3 text-blue-200" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mensajes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los mensajes de WhatsApp aparecerán aquí.
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      {mensajes.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">{mensajes.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-600">
                {mensajes.filter(m => m.direction === 'outbound').length}
              </p>
              <p className="text-xs text-gray-500">Enviados</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {mensajes.filter(m => m.direction === 'inbound').length}
              </p>
              <p className="text-xs text-gray-500">Recibidos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppHistorial

