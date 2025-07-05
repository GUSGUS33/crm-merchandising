import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { db } from '../lib/supabase'
import NuevoLeadModal from '../components/NuevoLeadModal'
import VerLeadModal from '../components/VerLeadModal'
import EditarLeadModal from '../components/EditarLeadModal'
import LeadsKanban from '../components/LeadsKanban'
import { Search, Filter, Plus, Eye, Edit, TrendingUp, TrendingDown, Minus, Table, LayoutDashboard } from 'lucide-react'

const LeadsPage = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredLeads, setFilteredLeads] = useState([])
  const [showNuevoLeadModal, setShowNuevoLeadModal] = useState(false)
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [vistaKanban, setVistaKanban] = useState(false)

  useEffect(() => {
    loadLeads()
  }, [])

  useEffect(() => {
    const filtered = leads.filter(lead =>
      lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.origen.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLeads(filtered)
  }, [leads, searchTerm])

  const loadLeads = async () => {
    try {
      const { data, error } = await db.getLeads()
      if (error) {
        console.error('Error loading leads:', error)
      } else {
        setLeads(data || [])
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadCreated = (nuevoLead) => {
    setLeads(prev => [nuevoLead, ...prev])
  }

  const handleLeadUpdated = () => {
    loadLeads() // Recargar la lista de leads
  }

  const handleVerLead = (lead) => {
    setSelectedLead(lead)
    setVerModalOpen(true)
  }

  const handleEditarLead = (lead) => {
    setSelectedLead(lead)
    setEditarModalOpen(true)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800'
      case 'contactado':
        return 'bg-yellow-100 text-yellow-800'
      case 'calificado':
        return 'bg-purple-100 text-purple-800'
      case 'propuesta':
        return 'bg-orange-100 text-orange-800'
      case 'negociacion':
        return 'bg-indigo-100 text-indigo-800'
      case 'ganado':
        return 'bg-green-100 text-green-800'
      case 'perdido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProbabilidadIcon = (probabilidad) => {
    if (probabilidad >= 75) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (probabilidad >= 50) return <Minus className="w-4 h-4 text-yellow-600" />
    return <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Calcular métricas
  const totalLeads = leads.length
  const leadsActivos = leads.filter(lead => !['ganado', 'perdido'].includes(lead.estado)).length
  const valorTotal = leads.reduce((sum, lead) => sum + (parseFloat(lead.valor_estimado) || 0), 0)
  const probabilidadPromedio = leads.length > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + lead.probabilidad, 0) / leads.length)
    : 0

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
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gestiona tus oportunidades de venta</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Botones de vista */}
          <div className="flex space-x-2">
            <button
              onClick={() => setVistaKanban(false)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                !vistaKanban 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table className="h-4 w-4" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setVistaKanban(true)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                vistaKanban 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Kanban</span>
            </button>
          </div>
          <Button 
            onClick={() => setShowNuevoLeadModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Leads Activos</p>
              <p className="text-2xl font-bold text-gray-900">{leadsActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 font-bold">€</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 font-bold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Probabilidad Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{probabilidadPromedio}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido condicional */}
      {vistaKanban ? (
        <LeadsKanban />
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar leads..."
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

          {/* Lista de Leads */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Leads ({filteredLeads.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probabilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Estimado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.nombre}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.empresa}</div>
                        <div className="text-sm text-gray-500">{lead.telefono}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(lead.estado)}`}>
                          {lead.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getProbabilidadIcon(lead.probabilidad)}
                          <span className="ml-2 text-sm text-gray-900">{lead.probabilidad}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.valor_estimado ? formatCurrency(lead.valor_estimado) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.origen || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(lead.fecha_contacto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Ver"
                            onClick={() => handleVerLead(lead)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Editar"
                            onClick={() => handleEditarLead(lead)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay leads</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando tu primer lead.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => setShowNuevoLeadModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Lead
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Nuevo Lead */}
      <NuevoLeadModal
        isOpen={showNuevoLeadModal}
        onClose={() => setShowNuevoLeadModal(false)}
        onLeadCreated={handleLeadCreated}
      />

      {/* Modal de Ver Lead */}
      <VerLeadModal
        lead={selectedLead}
        isOpen={verModalOpen}
        onClose={() => {
          setVerModalOpen(false)
          setSelectedLead(null)
        }}
      />

      {/* Modal de Editar Lead */}
      <EditarLeadModal
        lead={selectedLead}
        isOpen={editarModalOpen}
        onClose={() => {
          setEditarModalOpen(false)
          setSelectedLead(null)
        }}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  )
}

export default LeadsPage

