import React from 'react'
import { X, Download, Mail, Edit, FileText, Calendar, User, Building } from 'lucide-react'
import { Button } from './ui/button'

const VerFacturaModal = ({ factura, isOpen, onClose }) => {
  if (!isOpen || !factura) return null

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'borrador': return 'text-gray-600 bg-gray-100'
      case 'enviada': return 'text-blue-600 bg-blue-100'
      case 'pagada': return 'text-green-600 bg-green-100'
      case 'vencida': return 'text-red-600 bg-red-100'
      case 'cancelada': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'borrador': return '📝 Borrador'
      case 'enviada': return '📤 Enviada'
      case 'pagada': return '✅ Pagada'
      case 'vencida': return '⚠️ Vencida'
      case 'cancelada': return '❌ Cancelada'
      default: return estado
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'borrador': return <FileText className="h-5 w-5 text-gray-600" />
      case 'enviada': return <Mail className="h-5 w-5 text-blue-600" />
      case 'pagada': return <FileText className="h-5 w-5 text-green-600" />
      case 'vencida': return <FileText className="h-5 w-5 text-red-600" />
      case 'cancelada': return <FileText className="h-5 w-5 text-red-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isVencida = () => {
    if (!factura.fecha_vencimiento || factura.estado === 'pagada') return false
    const hoy = new Date()
    const vencimiento = new Date(factura.fecha_vencimiento)
    return vencimiento < hoy
  }

  const getDiasVencimiento = () => {
    if (!factura.fecha_vencimiento) return null
    const hoy = new Date()
    const vencimiento = new Date(factura.fecha_vencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const diasVencimiento = getDiasVencimiento()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {getEstadoIcon(factura.estado)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Factura {factura.numero}</h2>
              <p className="text-sm text-gray-500">Detalles completos de la factura</p>
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
          {/* Estado y Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Número de Factura</label>
                <p className="text-xl font-bold text-gray-900">{factura.numero}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(factura.estado)}`}>
                    {getEstadoTexto(factura.estado)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Total de la Factura</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(factura.total)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Emisión</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{formatDate(factura.fecha_emision)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Vencimiento</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{formatDate(factura.fecha_vencimiento)}</p>
                    {diasVencimiento !== null && factura.estado !== 'pagada' && (
                      <p className={`text-xs ${isVencida() ? 'text-red-600' : diasVencimiento <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {isVencida() 
                          ? `Vencida hace ${Math.abs(diasVencimiento)} días`
                          : diasVencimiento === 0 
                            ? 'Vence hoy'
                            : diasVencimiento === 1
                              ? 'Vence mañana'
                              : `${diasVencimiento} días restantes`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                <p className="text-gray-900">
                  {factura.created_at ? new Date(factura.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{factura.cliente_nombre || 'No especificado'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Empresa</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{factura.cliente_empresa || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{factura.cliente_email || 'No especificado'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{factura.cliente_telefono || 'No especificado'}</p>
                </div>
              </div>

              {factura.cliente_direccion && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-gray-900">{factura.cliente_direccion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items de la Factura */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items de la Factura</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {factura.items && factura.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.descripcion}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.cantidad}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(item.precio_unitario)}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(factura.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">IVA (21%):</span>
                  <span className="text-sm font-medium">{formatCurrency(factura.iva)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-base font-bold text-green-600">{formatCurrency(factura.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {factura.notas && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notas Adicionales</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{factura.notas}</p>
              </div>
            </div>
          )}

          {/* Alertas */}
          {isVencida() && factura.estado !== 'pagada' && (
            <div className="border-t pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">Factura Vencida</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Esta factura venció hace {Math.abs(diasVencimiento)} días. Considera enviar un recordatorio al cliente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="text-green-600 hover:text-green-700">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button variant="outline" className="text-blue-600 hover:text-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Edit className="h-4 w-4 mr-2" />
              Editar Factura
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerFacturaModal

