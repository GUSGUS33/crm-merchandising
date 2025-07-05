import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { db } from '../lib/supabase'
import PresupuestoPDF from '../components/PresupuestoPDF'
import EmailSender from '../components/EmailSender'
import NuevoPresupuestoModal from '../components/NuevoPresupuestoModal'
import VerPresupuestoModal from '../components/VerPresupuestoModal'
import EditarPresupuestoModal from '../components/EditarPresupuestoModal'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Copy, 
  Download, 
  Mail, 
  Trash2,
  FileText,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react'

const PresupuestosPage = () => {
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPresupuestos, setFilteredPresupuestos] = useState([])
  const [selectedEstado, setSelectedEstado] = useState('todos')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null)
  const [isNuevoPresupuestoModalOpen, setIsNuevoPresupuestoModalOpen] = useState(false)
  const [isVerPresupuestoModalOpen, setIsVerPresupuestoModalOpen] = useState(false)
  const [isEditarPresupuestoModalOpen, setIsEditarPresupuestoModalOpen] = useState(false)

  useEffect(() => {
    loadPresupuestos()
  }, [])

  useEffect(() => {
    let filtered = presupuestos.filter(presupuesto =>
      presupuesto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedEstado !== 'todos') {
      filtered = filtered.filter(presupuesto => presupuesto.estado === selectedEstado)
    }

    setFilteredPresupuestos(filtered)
  }, [presupuestos, searchTerm, selectedEstado])

  const loadPresupuestos = async () => {
    try {
      const { data, error } = await db.getPresupuestos()
      if (error) {
        console.error('Error loading presupuestos:', error)
      } else {
        setPresupuestos(data || [])
      }
    } catch (error) {
      console.error('Error loading presupuestos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'borrador':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className="h-4 w-4" />,
          label: 'Borrador'
        }
      case 'enviado':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <Mail className="h-4 w-4" />,
          label: 'Enviado'
        }
      case 'en_espera':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4" />,
          label: 'En Espera'
        }
      case 'aprobado':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Aprobado'
        }
      case 'rechazado':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4" />,
          label: 'Rechazado'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className="h-4 w-4" />,
          label: estado
        }
    }
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

  const isExpired = (fechaValidez) => {
    return new Date(fechaValidez) < new Date()
  }

  const handleDuplicate = async (id) => {
    try {
      const { data, error } = await db.duplicatePresupuesto(id)
      if (error) {
        console.error('Error duplicating presupuesto:', error)
        alert('Error al duplicar presupuesto')
      } else {
        await loadPresupuestos()
        alert('Presupuesto duplicado exitosamente')
      }
    } catch (error) {
      console.error('Error duplicating presupuesto:', error)
      alert('Error al duplicar presupuesto')
    }
  }

  const handleDownloadPDF = (presupuesto) => {
    const pdfGenerator = PresupuestoPDF({ 
      presupuesto, 
      onGenerate: (success) => {
        if (success) {
          alert(`PDF del presupuesto ${presupuesto.numero} descargado exitosamente`)
        } else {
          alert('Error al generar el PDF')
        }
      }
    })
    pdfGenerator.generatePDF()
  }

  const handleSendEmail = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setEmailModalOpen(true)
  }

  const handleVerPresupuesto = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setIsVerPresupuestoModalOpen(true)
  }

  const handleEditarPresupuesto = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setIsEditarPresupuestoModalOpen(true)
  }

  const handleEmailSent = (result) => {
    if (result.success) {
      alert(result.message)
    } else {
      alert(result.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        const { error } = await db.deletePresupuesto(id)
        if (error) {
          console.error('Error deleting presupuesto:', error)
          alert('Error al eliminar presupuesto')
        } else {
          await loadPresupuestos()
          alert('Presupuesto eliminado exitosamente')
        }
      } catch (error) {
        console.error('Error deleting presupuesto:', error)
        alert('Error al eliminar presupuesto')
      }
    }
  }

  const getStats = () => {
    const total = presupuestos.length
    const borradores = presupuestos.filter(p => p.estado === 'borrador').length
    const enviados = presupuestos.filter(p => p.estado === 'enviado').length
    const aprobados = presupuestos.filter(p => p.estado === 'aprobado').length
    const valorTotal = presupuestos.reduce((sum, p) => sum + p.total, 0)
    const valorAprobado = presupuestos.filter(p => p.estado === 'aprobado').reduce((sum, p) => sum + p.total, 0)
    
    return { total, borradores, enviados, aprobados, valorTotal, valorAprobado }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-600">Gestiona tus presupuestos y propuestas comerciales</p>
        </div>
        <Button 
          onClick={() => setIsNuevoPresupuestoModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Presupuestos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{stats.aprobados}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Euro className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Aprobado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.valorAprobado)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar presupuestos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="en_espera">En Espera</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Más Filtros
        </Button>
      </div>

      {/* Presupuestos Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Lista de Presupuestos ({filteredPresupuestos.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validez
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPresupuestos.map((presupuesto) => {
                const estadoConfig = getEstadoConfig(presupuesto.estado)
                const expired = isExpired(presupuesto.fecha_validez)
                
                return (
                  <tr key={presupuesto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{presupuesto.numero}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{presupuesto.cliente.nombre}</div>
                        <div className="text-sm text-gray-500">{presupuesto.cliente.empresa}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                        {estadoConfig.icon}
                        <span className="ml-1">{estadoConfig.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(presupuesto.fecha)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm ${expired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {formatDate(presupuesto.fecha_validez)}
                        </span>
                        {expired && <AlertCircle className="h-4 w-4 text-red-500 ml-1" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(presupuesto.total)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Ver"
                          onClick={() => handleVerPresupuesto(presupuesto)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Editar"
                          onClick={() => handleEditarPresupuesto(presupuesto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Duplicar"
                          onClick={() => handleDuplicate(presupuesto.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Descargar PDF"
                          onClick={() => handleDownloadPDF(presupuesto)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Enviar por Email"
                          onClick={() => handleSendEmail(presupuesto)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Eliminar"
                          onClick={() => handleDelete(presupuesto.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPresupuestos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay presupuestos</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedEstado !== 'todos' 
                ? 'No se encontraron presupuestos que coincidan con los filtros.' 
                : 'Comienza creando tu primer presupuesto.'}
            </p>
            {!searchTerm && selectedEstado === 'todos' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Presupuesto
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de envío de email */}
      <EmailSender
        presupuesto={selectedPresupuesto}
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false)
          setSelectedPresupuesto(null)
        }}
        onSend={handleEmailSent}
      />

      {/* Modal de nuevo presupuesto */}
      <NuevoPresupuestoModal
        isOpen={isNuevoPresupuestoModalOpen}
        onClose={() => setIsNuevoPresupuestoModalOpen(false)}
        onPresupuestoCreated={() => {
          setIsNuevoPresupuestoModalOpen(false)
          loadPresupuestos() // Recargar la lista
        }}
      />

      {/* Modal de ver presupuesto */}
      <VerPresupuestoModal
        presupuesto={selectedPresupuesto}
        isOpen={isVerPresupuestoModalOpen}
        onClose={() => {
          setIsVerPresupuestoModalOpen(false)
          setSelectedPresupuesto(null)
        }}
        onDownloadPDF={handleDownloadPDF}
        onSendEmail={handleSendEmail}
        onDuplicate={(presupuesto) => handleDuplicate(presupuesto.id)}
      />

      {/* Modal de editar presupuesto */}
      <EditarPresupuestoModal
        presupuesto={selectedPresupuesto}
        isOpen={isEditarPresupuestoModalOpen}
        onClose={() => {
          setIsEditarPresupuestoModalOpen(false)
          setSelectedPresupuesto(null)
        }}
        onPresupuestoUpdated={() => {
          setIsEditarPresupuestoModalOpen(false)
          setSelectedPresupuesto(null)
          loadPresupuestos() // Recargar la lista
        }}
      />
    </div>
  )
}

export default PresupuestosPage

