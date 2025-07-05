import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Globe, Eye, Edit, Trash2, ExternalLink, Mail } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { db } from '../lib/supabase'
import NuevoSitioWebModal from '../components/NuevoSitioWebModal'
import VerSitioWebModal from '../components/VerSitioWebModal'
import EditarSitioWebModal from '../components/EditarSitioWebModal'

const SitiosWebPage = () => {
  const [sitiosWeb, setSitiosWeb] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNuevoSitioModal, setShowNuevoSitioModal] = useState(false)
  const [showVerSitioModal, setShowVerSitioModal] = useState(false)
  const [showEditarSitioModal, setShowEditarSitioModal] = useState(false)
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null)

  useEffect(() => {
    loadSitiosWeb()
  }, [])

  const loadSitiosWeb = async () => {
    setLoading(true)
    try {
      const { data, error } = await db.getSitiosWeb()
      if (error) {
        console.error('Error al cargar sitios web:', error)
        return
      }
      setSitiosWeb(data || [])
    } catch (error) {
      console.error('Error al cargar sitios web:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSitioCreated = (nuevoSitio) => {
    setSitiosWeb(prev => [nuevoSitio, ...prev])
  }

  const handleSitioUpdated = (sitioActualizado) => {
    setSitiosWeb(prev => prev.map(sitio => 
      sitio.id === sitioActualizado.id ? sitioActualizado : sitio
    ))
  }

  const handleVerSitio = (sitio) => {
    setSitioSeleccionado(sitio)
    setShowVerSitioModal(true)
  }

  const handleEditarSitio = (sitio) => {
    setSitioSeleccionado(sitio)
    setShowEditarSitioModal(true)
  }

  const handleEliminarSitio = async (sitio) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el sitio web "${sitio.nombre}"?`)) {
      try {
        const { error } = await db.deleteSitioWeb(sitio.id)
        if (error) {
          console.error('Error al eliminar sitio web:', error)
          return
        }
        setSitiosWeb(prev => prev.filter(s => s.id !== sitio.id))
      } catch (error) {
        console.error('Error al eliminar sitio web:', error)
      }
    }
  }

  const filteredSitios = sitiosWeb.filter(sitio =>
    sitio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sitio.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sitio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'text-green-600 bg-green-100'
      case 'inactivo': return 'text-red-600 bg-red-100'
      case 'mantenimiento': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'activo': return '🟢 Activo'
      case 'inactivo': return '🔴 Inactivo'
      case 'mantenimiento': return '🟡 Mantenimiento'
      default: return estado
    }
  }

  const calcularMetricas = () => {
    const total = sitiosWeb.length
    const activos = sitiosWeb.filter(s => s.estado === 'activo').length
    const inactivos = sitiosWeb.filter(s => s.estado === 'inactivo').length
    const mantenimiento = sitiosWeb.filter(s => s.estado === 'mantenimiento').length

    return { total, activos, inactivos, mantenimiento }
  }

  const metricas = calcularMetricas()

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sitios Web</h1>
          <p className="text-gray-600">Gestiona los sitios web de tu empresa</p>
        </div>
        <Button 
          onClick={() => setShowNuevoSitioModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Sitio Web
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sitios</p>
              <p className="text-2xl font-bold text-gray-900">{metricas.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{metricas.activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{metricas.inactivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mantenimiento</p>
              <p className="text-2xl font-bold text-yellow-600">{metricas.mantenimiento}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar sitios web..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Más Filtros
          </Button>
        </div>
      </div>

      {/* Lista de sitios web */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Sitios Web ({filteredSitios.length})
          </h2>
        </div>

        {filteredSitios.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sitios web</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron sitios web que coincidan con tu búsqueda.' : 'Comienza creando tu primer sitio web.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setShowNuevoSitioModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Sitio Web
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sitio Web
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSitios.map((sitio) => (
                  <tr key={sitio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {sitio.logo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={sitio.logo}
                              alt={sitio.nombre}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{sitio.nombre}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {sitio.descripcion}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{sitio.url}</span>
                        {sitio.url && (
                          <a
                            href={sitio.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{sitio.email}</span>
                        {sitio.email && (
                          <a
                            href={`mailto:${sitio.email}`}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(sitio.estado)}`}>
                        {getEstadoTexto(sitio.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {sitio.sitio_id || sitio.id}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerSitio(sitio)}
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarSitio(sitio)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEliminarSitio(sitio)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modales */}
      <NuevoSitioWebModal
        isOpen={showNuevoSitioModal}
        onClose={() => setShowNuevoSitioModal(false)}
        onSitioCreated={handleSitioCreated}
      />
      
      <VerSitioWebModal
        isOpen={showVerSitioModal}
        onClose={() => setShowVerSitioModal(false)}
        sitio={sitioSeleccionado}
        onEdit={handleEditarSitio}
      />
      
      <EditarSitioWebModal
        isOpen={showEditarSitioModal}
        onClose={() => setShowEditarSitioModal(false)}
        sitio={sitioSeleccionado}
        onSitioUpdated={handleSitioUpdated}
      />
    </div>
  )
}

export default SitiosWebPage

