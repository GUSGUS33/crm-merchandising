import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { db } from '../lib/supabase'

const NuevaFacturaModal = ({ isOpen, onClose, onFacturaCreated }) => {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_empresa: '',
    cliente_email: '',
    cliente_direccion: '',
    cliente_telefono: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    notas: '',
    estado: 'borrador'
  })
  
  const [items, setItems] = useState([
    { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }
  ])
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      // Calcular fecha de vencimiento (30 días después de emisión)
      const fechaEmision = new Date(formData.fecha_emision)
      const fechaVencimiento = new Date(fechaEmision)
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)
      
      setFormData(prev => ({
        ...prev,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0]
      }))
    }
  }, [isOpen, formData.fecha_emision])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.cliente_nombre.trim()) {
      newErrors.cliente_nombre = 'El nombre del cliente es obligatorio'
    }
    
    if (!formData.cliente_email.trim()) {
      newErrors.cliente_email = 'El email del cliente es obligatorio'
    }
    
    if (!formData.fecha_emision) {
      newErrors.fecha_emision = 'La fecha de emisión es obligatoria'
    }
    
    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria'
    }

    // Validar que hay al menos un item con descripción
    const itemsValidos = items.filter(item => item.descripcion.trim())
    if (itemsValidos.length === 0) {
      newErrors.items = 'Debe agregar al menos un item a la factura'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // Filtrar items válidos
      const itemsValidos = items.filter(item => item.descripcion.trim())
      
      // Calcular totales
      const subtotal = itemsValidos.reduce((sum, item) => sum + item.total, 0)
      const iva = subtotal * 0.21 // 21% IVA
      const total = subtotal + iva

      // Generar número de factura
      const year = new Date().getFullYear()
      const facturaNumber = `FACT-${year}-${String(Date.now()).slice(-6)}`

      const facturaData = {
        ...formData,
        numero: facturaNumber,
        items: itemsValidos,
        subtotal,
        iva,
        total,
        created_at: new Date().toISOString()
      }

      const { data, error } = await db.createFactura(facturaData)
      
      if (error) {
        console.error('Error al crear factura:', error)
        return
      }

      onFacturaCreated?.(data[0])
      onClose()
      
      // Reset form
      setFormData({
        cliente_nombre: '',
        cliente_empresa: '',
        cliente_email: '',
        cliente_direccion: '',
        cliente_telefono: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        notas: '',
        estado: 'borrador'
      })
      setItems([{ descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }])
    } catch (error) {
      console.error('Error al crear factura:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    
    // Recalcular total del item
    if (field === 'cantidad' || field === 'precio_unitario') {
      newItems[index].total = newItems[index].cantidad * newItems[index].precio_unitario
    }
    
    setItems(newItems)
    
    // Clear items error
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: ''
      }))
    }
  }

  const addItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calcularIVA = () => {
    return calcularSubtotal() * 0.21
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Save className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Nueva Factura</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <Input
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className={errors.cliente_nombre ? 'border-red-500' : ''}
                />
                {errors.cliente_nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.cliente_nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <Input
                  name="cliente_empresa"
                  value={formData.cliente_empresa}
                  onChange={handleChange}
                  placeholder="Empresa S.L."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  name="cliente_email"
                  type="email"
                  value={formData.cliente_email}
                  onChange={handleChange}
                  placeholder="cliente@empresa.com"
                  className={errors.cliente_email ? 'border-red-500' : ''}
                />
                {errors.cliente_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.cliente_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  name="cliente_telefono"
                  value={formData.cliente_telefono}
                  onChange={handleChange}
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <Input
                  name="cliente_direccion"
                  value={formData.cliente_direccion}
                  onChange={handleChange}
                  placeholder="Calle Principal 123, 28001 Madrid"
                />
              </div>
            </div>
          </div>

          {/* Información de la Factura */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Factura</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Emisión *
                </label>
                <Input
                  name="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={handleChange}
                  className={errors.fecha_emision ? 'border-red-500' : ''}
                />
                {errors.fecha_emision && (
                  <p className="text-red-500 text-xs mt-1">{errors.fecha_emision}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <Input
                  name="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                  className={errors.fecha_vencimiento ? 'border-red-500' : ''}
                />
                {errors.fecha_vencimiento && (
                  <p className="text-red-500 text-xs mt-1">{errors.fecha_vencimiento}</p>
                )}
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
                  <option value="borrador">📝 Borrador</option>
                  <option value="enviada">📤 Enviada</option>
                  <option value="pagada">✅ Pagada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items de la Factura */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items de la Factura</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>

            {errors.items && (
              <p className="text-red-500 text-sm mb-4">{errors.items}</p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <Input
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto/servicio"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                      {formatCurrency(item.total)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(calcularSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">IVA (21%):</span>
                  <span className="text-sm font-medium">{formatCurrency(calcularIVA())}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-base font-bold">{formatCurrency(calcularTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Notas adicionales para el cliente..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                'Creando...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Factura
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NuevaFacturaModal

