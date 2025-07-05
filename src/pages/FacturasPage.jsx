import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { db } from '../lib/supabase'
import NuevaFacturaModal from '../components/NuevaFacturaModal'
import VerFacturaModal from '../components/VerFacturaModal'
import EditarFacturaModal from '../components/EditarFacturaModal'
import { Search, Filter, Plus, Eye, Edit, FileText, Euro, Calendar, Download, Mail } from 'lucide-react'

const FacturasPage = () => {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFacturas, setFilteredFacturas] = useState([])
  const [showNuevaFacturaModal, setShowNuevaFacturaModal] = useState(false)
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState(null)

  useEffect(() => {
    loadFacturas()
  }, [])

  useEffect(() => {
    const filtered = facturas.filter(factura =>
      factura.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredFacturas(filtered)
  }, [facturas, searchTerm])

  const loadFacturas = async () => {
    try {
      const { data, error } = await db.getFacturas()
      if (error) {
        console.error('Error loading facturas:', error)
      } else {
        setFacturas(data || [])
      }
    } catch (error) {
      console.error('Error loading facturas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFacturaCreated = (nuevaFactura) => {
    setFacturas(prev => [nuevaFactura, ...prev])
  }

  const handleFacturaUpdated = () => {
    loadFacturas() // Recargar la lista de facturas
  }

  const handleVerFactura = (factura) => {
    setSelectedFactura(factura)
    setVerModalOpen(true)
  }

  const handleEditarFactura = (factura) => {
    setSelectedFactura(factura)
    setEditarModalOpen(true)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800'
      case 'enviada': return 'bg-blue-100 text-blue-800'
      case 'pagada': return 'bg-green-100 text-green-800'
      case 'vencida': return 'bg-red-100 text-red-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Calcular métricas
  const totalFacturas = facturas.length
  const facturasEnviadas = facturas.filter(f => f.estado === 'enviada').length
  const facturasPagadas = facturas.filter(f => f.estado === 'pagada').length
  const facturasVencidas = facturas.filter(f => f.estado === 'vencida').length
  const totalFacturado = facturas.reduce((sum, f) => sum + (f.total || 0), 0)
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + (f.total || 0), 0)
  const totalPendiente = facturas.filter(f => f.estado === 'enviada').reduce((sum, f) => sum + (f.total || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Gestiona la facturación de tu empresa</p>
        </div>
        <Button 
          onClick={() => setShowNuevaFacturaModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Facturas</p>
              <p className="text-2xl font-bold text-gray-900">{totalFacturas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Facturado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFacturado)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPagado)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Euro className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendiente de Cobro</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendiente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas por Estado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Enviadas</p>
              <p className="text-xl font-bold text-blue-600">{facturasEnviadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">P</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagadas</p>
              <p className="text-xl font-bold text-green-600">{facturasPagadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">V</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vencidas</p>
              <p className="text-xl font-bold text-red-600">{facturasVencidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">B</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Borradores</p>
              <p className="text-xl font-bold text-gray-600">
                {facturas.filter(f => f.estado === 'borrador').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Más Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Facturas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Facturas ({filteredFacturas.length})
          </h3>
        </div>

        {filteredFacturas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron facturas que coincidan con la búsqueda.' : (
              <div>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay facturas
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando tu primera factura.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setShowNuevaFacturaModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Factura
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Emisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFacturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{factura.numero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {factura.cliente_nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {factura.cliente_empresa}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(factura.estado)}`}>
                        {getEstadoTexto(factura.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(factura.fecha_emision)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(factura.fecha_vencimiento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(factura.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="Ver"
                          onClick={() => handleVerFactura(factura)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Editar"
                          onClick={() => handleEditarFactura(factura)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Descargar PDF"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Enviar por Email"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nueva Factura */}
      <NuevaFacturaModal
        isOpen={showNuevaFacturaModal}
        onClose={() => setShowNuevaFacturaModal(false)}
        onFacturaCreated={handleFacturaCreated}
      />

      {/* Modal de Ver Factura */}
      <VerFacturaModal
        factura={selectedFactura}
        isOpen={verModalOpen}
        onClose={() => {
          setVerModalOpen(false)
          setSelectedFactura(null)
        }}
      />

      {/* Modal de Editar Factura */}
      <EditarFacturaModal
        factura={selectedFactura}
        isOpen={editarModalOpen}
        onClose={() => {
          setEditarModalOpen(false)
          setSelectedFactura(null)
        }}
        onFacturaUpdated={handleFacturaUpdated}
      />
    </div>
  )
}

export default FacturasPage

