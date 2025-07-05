import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, Mail, Send } from 'lucide-react'

const EmailSender = ({ presupuesto, isOpen, onClose, onSend }) => {
  const [emailData, setEmailData] = useState({
    to: presupuesto?.cliente?.email || '',
    subject: `Presupuesto ${presupuesto?.numero} - ${presupuesto?.cliente?.empresa}`,
    message: `Estimado/a ${presupuesto?.cliente?.nombre},

Adjunto encontrará el presupuesto ${presupuesto?.numero} solicitado para su empresa ${presupuesto?.cliente?.empresa}.

Detalles del presupuesto:
- Número: ${presupuesto?.numero}
- Fecha: ${presupuesto?.fecha ? new Date(presupuesto.fecha).toLocaleDateString('es-ES') : ''}
- Válido hasta: ${presupuesto?.fecha_validez ? new Date(presupuesto.fecha_validez).toLocaleDateString('es-ES') : ''}
- Total: ${presupuesto?.total ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(presupuesto.total) : ''}

Si tiene alguna pregunta o necesita modificaciones, no dude en contactarnos.

Quedamos a la espera de su respuesta.

Saludos cordiales,
Equipo CRM Merchandising`
  })
  const [sending, setSending] = useState(false)

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSend = async () => {
    setSending(true)
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aquí iría la lógica real de envío de email
      // Por ejemplo, usando EmailJS, SendGrid, o una API propia
      
      console.log('Email enviado:', emailData)
      
      if (onSend) {
        onSend({
          success: true,
          message: `Email enviado exitosamente a ${emailData.to}`
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Error sending email:', error)
      if (onSend) {
        onSend({
          success: false,
          message: 'Error al enviar el email'
        })
      }
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Enviar Presupuesto por Email
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información del presupuesto */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Presupuesto a enviar:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Número:</span>
                <span className="ml-2 font-medium">{presupuesto?.numero}</span>
              </div>
              <div>
                <span className="text-gray-600">Cliente:</span>
                <span className="ml-2 font-medium">{presupuesto?.cliente?.nombre}</span>
              </div>
              <div>
                <span className="text-gray-600">Empresa:</span>
                <span className="ml-2 font-medium">{presupuesto?.cliente?.empresa}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium text-green-600">
                  {presupuesto?.total ? new Intl.NumberFormat('es-ES', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  }).format(presupuesto.total) : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de email */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatario
              </label>
              <Input
                type="email"
                value={emailData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="email@cliente.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <Input
                type="text"
                value={emailData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Asunto del email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escriba su mensaje aquí..."
                required
              />
            </div>
          </div>

          {/* Nota sobre el PDF */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Archivo adjunto</h4>
                <p className="text-sm text-blue-700">
                  El PDF del presupuesto se generará automáticamente y se adjuntará al email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !emailData.to || !emailData.subject}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailSender

