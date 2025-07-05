import React from 'react'
import { Button } from './ui/button'
import { X, Download, Mail, Copy, Calendar, User, Building, Euro, FileText } from 'lucide-react'

const VerPresupuestoModal = ({ presupuesto, isOpen, onClose, onDownloadPDF, onSendEmail, onDuplicate }) => {
  if (!isOpen || !presupuesto) return null

  const getEstadoColor = (estado) => {
    const colors = {
      'borrador': 'bg-gray-100 text-gray-800',
      'enviado': 'bg-red-100 text-red-800',
      'en_espera': 'bg-yellow-100 text-yellow-800',
      'aprobado': 'bg-green-100 text-green-800',
      'rechazado': 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      'borrador': '📝 Borrador',
      'enviado': '📤 Enviado',
      'en_espera': '⏳ En Espera',
      'aprobado': '✅ Aprobado',
      'rechazado': '❌ Rechazado'
    }
    return labels[estado] || estado
  }

  const getSitioWebDisplay = (sitio) => {
    const sitios = {
      'sitio_web_1': '🔵 Sitio Web 1',
      'sitio_web_2': '🟢 Sitio Web 2',
      'sitio_web_3': '🟣 Sitio Web 3'
    }
    return sitios[sitio] || sitio
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const isVencido = () => {
    return new Date(presupuesto.fecha_validez) < new Date()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                {presupuesto.numero}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEstadoColor(presupuesto.estado)}`}>
                  {getEstadoLabel(presupuesto.estado)}
                </span>
                <span className="text-sm text-gray-500">
                  {getSitioWebDisplay(presupuesto.sitio_web)}
                </span>
                {isVencido() && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    ⚠️ Vencido
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos del presupuesto */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Información del Presupuesto
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{new Date(presupuesto.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Válido hasta:</span>
                  <span className={`font-medium ${isVencido() ? 'text-red-600' : ''}`}>
                    {new Date(presupuesto.fecha_validez).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-medium">{new Date(presupuesto.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {presupuesto.updated_at !== presupuesto.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actualizado:</span>
                    <span className="font-medium">{new Date(presupuesto.updated_at).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Datos del Cliente
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{presupuesto.cliente.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{presupuesto.cliente.empresa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{presupuesto.cliente.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items del presupuesto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items del Presupuesto</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presupuesto.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.descripcion}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(item.precio_unitario)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-80 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Euro className="h-5 w-5 text-purple-600" />
                Resumen de Totales
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(presupuesto.subtotal)}</span>
                </div>
                {presupuesto.descuento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({presupuesto.descuento}%):</span>
                    <span>-{formatCurrency((presupuesto.subtotal * presupuesto.descuento) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>IVA (21%):</span>
                  <span className="font-medium">{formatCurrency(presupuesto.impuestos)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(presupuesto.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {presupuesto.notas && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700">{presupuesto.notas}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onDownloadPDF(presupuesto)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
            <Button
              onClick={() => onSendEmail(presupuesto)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Enviar por Email
            </Button>
            <Button
              onClick={() => onDuplicate(presupuesto)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="ml-auto"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerPresupuestoModal

