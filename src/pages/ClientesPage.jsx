import React, { useState, useEffect } from 'react'
import { Users, Plus, Search, Filter, Eye, Edit } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import NuevoClienteModal from '../components/NuevoClienteModal'
import VerClienteModal from '../components/VerClienteModal'
import EditarClienteModal from '../components/EditarClienteModal'
import { db } from '../lib/supabase'

const ClientesPage = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)

  useEffect(() => {
    loadClientes()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const handleClienteCreated = () => {
    loadClientes() // Recargar la lista de clientes
  }

  const handleClienteUpdated = () => {
    loadClientes() // Recargar la lista de clientes
  }

  const handleVerCliente = (cliente) => {
    setSelectedCliente(cliente)
    setVerModalOpen(true)
  }

  const handleEditarCliente = (cliente) => {
    setSelectedCliente(cliente)
    setEditarModalOpen(true)
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getOrigenColor = (origen) => {
    const colors = {
      'sitio_web_1': 'bg-blue-100 text-blue-800',
      'sitio_web_2': 'bg-green-100 text-green-800',
      'sitio_web_3': 'bg-purple-100 text-purple-800',
      'Sitio Web 1': 'bg-blue-100 text-blue-800',
      'Sitio Web 2': 'bg-green-100 text-green-800',
      'Sitio Web 3': 'bg-purple-100 text-purple-800',
      'referido': 'bg-yellow-100 text-yellow-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'otro': 'bg-gray-100 text-gray-800'
    }
    return colors[origen] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoColor = (estado) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const formatOrigenDisplay = (origen) => {
    const displayNames = {
      'sitio_web_1': 'Sitio Web 1',
      'sitio_web_2': 'Sitio Web 2', 
      'sitio_web_3': 'Sitio Web 3',
      'referido': 'Referido',
      'marketing': 'Marketing',
      'otro': 'Otro'
    }
    return displayNames[origen] || origen
  }

  const formatEstadoDisplay = (estado) => {
    return estado === 'activo' ? '✅ Activo' : '❌ Inactivo'
  }

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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Clientes
          </h1>
          <p className="text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {clientes.filter(c => c.estado === 'activo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sitio Web 1</p>
              <p className="text-2xl font-bold text-blue-600">
                {clientes.filter(c => c.origen === 'sitio_web_1' || c.origen === 'Sitio Web 1').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sitio Web 2</p>
              <p className="text-2xl font-bold text-green-600">
                {clientes.filter(c => c.origen === 'sitio_web_2' || c.origen === 'Sitio Web 2').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Más Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Lista de Clientes ({filteredClientes.length})
          </h3>
        </div>
        
        {filteredClientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'No hay clientes registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cliente.empresa}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrigenColor(cliente.origen)}`}>
                        {formatOrigenDisplay(cliente.origen)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cliente.estado)}`}>
                        {formatEstadoDisplay(cliente.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cliente.fecha_registro || cliente.fechaRegistro).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleVerCliente(cliente)}
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleEditarCliente(cliente)}
                        >
                          <Edit className="h-3 w-3" />
                          Editar
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

      {/* Modal de Nuevo Cliente */}
      <NuevoClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClienteCreated={handleClienteCreated}
      />

      {/* Modal de Ver Cliente */}
      <VerClienteModal
        cliente={selectedCliente}
        isOpen={verModalOpen}
        onClose={() => {
          setVerModalOpen(false)
          setSelectedCliente(null)
        }}
      />

      {/* Modal de Editar Cliente */}
      <EditarClienteModal
        cliente={selectedCliente}
        isOpen={editarModalOpen}
        onClose={() => {
          setEditarModalOpen(false)
          setSelectedCliente(null)
        }}
        onClienteUpdated={handleClienteUpdated}
      />
    </div>
  )
}

export default ClientesPage

