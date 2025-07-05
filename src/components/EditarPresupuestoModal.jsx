import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, Trash2, Calculator, X } from 'lucide-react'
import { db } from '../lib/supabase'

const EditarPresupuestoModal = ({ presupuesto, isOpen, onClose, onPresupuestoUpdated }) => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cliente_id: '',
    sitio_web: 'sitio_web_1',
    fecha: '',
    fecha_validez: '',
    estado: 'borrador',
    notas: '',
    descuento: 0
  })
  const [items, setItems] = useState([])

  useEffect(() => {
    if (isOpen && presupuesto) {
      loadClientes()
      // Pre-rellenar el formulario con los datos del presupuesto
      setFormData({
        cliente_id: presupuesto.cliente_id,
        sitio_web: presupuesto.sitio_web || 'sitio_web_1',
        fecha: presupuesto.fecha,
        fecha_validez: presupuesto.fecha_validez,
        estado: presupuesto.estado,
        notas: presupuesto.notas || '',
        descuento: presupuesto.descuento || 0
      })
      
      // Pre-rellenar los items
      setItems(presupuesto.items.map((item, index) => ({
        id: index + 1,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        total: item.total
      })))
    }
  }, [isOpen, presupuesto])

  const loadClientes = async () => {
    try {
      const { data, error } = await db.getClientes()
      if (error) {
        console.error('Error al cargar clientes:', error)
      } else {
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Buscar datos del cliente seleccionado
      const clienteSeleccionado = clientes.find(c => c.id === formData.cliente_id)
      
      if (!clienteSeleccionado) {
        alert('Por favor selecciona un cliente')
        setLoading(false)
        return
      }

      // Calcular totales
      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      const descuentoAmount = (subtotal * formData.descuento) / 100
      const subtotalConDescuento = subtotal - descuentoAmount
      const impuestos = subtotalConDescuento * 0.21 // 21% IVA
      const total = subtotalConDescuento + impuestos

      const presupuestoData = {
        cliente_id: formData.cliente_id,
        cliente: {
          nombre: clienteSeleccionado.nombre,
          empresa: clienteSeleccionado.empresa,
          email: clienteSeleccionado.email
        },
        sitio_web: formData.sitio_web,
        fecha: formData.fecha,
        fecha_validez: formData.fecha_validez,
        estado: formData.estado,
        items: items.filter(item => item.descripcion.trim() !== ''),
        subtotal: subtotal,
        descuento: formData.descuento,
        impuestos: impuestos,
        total: total,
        notas: formData.notas
      }

      const { data, error } = await db.updatePresupuesto(presupuesto.id, presupuestoData)
      
      if (error) {
        console.error('Error al actualizar presupuesto:', error)
        alert('Error al actualizar el presupuesto')
      } else {
        alert('¡Presupuesto actualizado exitosamente!')
        onPresupuestoUpdated()
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el presupuesto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalcular total del item
        if (field === 'cantidad' || field === 'precio_unitario') {
          updatedItem.total = updatedItem.cantidad * updatedItem.precio_unitario
        }
        
        return updatedItem
      }
      return item
    })
    setItems(updatedItems)
  }

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1
    setItems([...items, {
      id: newId,
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      total: 0
    }])
  }

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Cálculos totales
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const descuentoAmount = (subtotal * formData.descuento) / 100
  const subtotalConDescuento = subtotal - descuentoAmount
  const impuestos = subtotalConDescuento * 0.21
  const total = subtotalConDescuento + impuestos

  const getSitioWebDisplay = (sitio) => {
    const sitios = {
      'sitio_web_1': '🔵 Sitio Web 1',
      'sitio_web_2': '🟢 Sitio Web 2',
      'sitio_web_3': '🟣 Sitio Web 3'
    }
    return sitios[sitio] || sitio
  }

  if (!isOpen || !presupuesto) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Editar Presupuesto {presupuesto.numero}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.empresa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web de Origen *
              </label>
              <select
                name="sitio_web"
                value={formData.sitio_web}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sitio_web_1">🔵 Sitio Web 1</option>
                <option value="sitio_web_2">🟢 Sitio Web 2</option>
                <option value="sitio_web_3">🟣 Sitio Web 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Presupuesto *
              </label>
              <Input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Validez *
              </label>
              <Input
                type="date"
                name="fecha_validez"
                value={formData.fecha_validez}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="borrador">📝 Borrador</option>
                <option value="enviado">📤 Enviado</option>
                <option value="en_espera">⏳ En Espera</option>
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">❌ Rechazado</option>
              </select>
            </div>
          </div>

          {/* Items del presupuesto */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items del Presupuesto</h3>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <Input
                          placeholder="Descripción del producto/servicio"
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.precio_unitario}
                          onChange={(e) => handleItemChange(item.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {item.total.toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cálculos y totales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Cálculos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleChange}
                  className="w-24"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                {formData.descuento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({formData.descuento}%):</span>
                    <span>-{descuentoAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>IVA (21%):</span>
                  <span className="font-medium">{impuestos.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Notas internas o comentarios para el cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || items.every(item => !item.descripcion.trim())}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Actualizando...' : 'Actualizar Presupuesto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarPresupuestoModal

