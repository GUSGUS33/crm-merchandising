import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { db } from '../lib/supabase'
import NuevaTareaModal from '../components/NuevaTareaModal'
import VerTareaModal from '../components/VerTareaModal'
import EditarTareaModal from '../components/EditarTareaModal'
import TareasKanban from '../components/TareasKanban'
import { Search, Filter, Plus, Eye, Edit, CheckCircle, Clock, AlertTriangle, Calendar, Table, LayoutDashboard } from 'lucide-react'

const TareasPage = () => {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTareas, setFilteredTareas] = useState([])
  const [showNuevaTareaModal, setShowNuevaTareaModal] = useState(false)
  const [verModalOpen, setVerModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [selectedTarea, setSelectedTarea] = useState(null)
  const [vistaKanban, setVistaKanban] = useState(false)

  useEffect(() => {
    loadTareas()
  }, [])

  useEffect(() => {
    const filtered = tareas.filter(tarea =>
      tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarea.asignado_a.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTareas(filtered)
  }, [tareas, searchTerm])

  const loadTareas = async () => {
    try {
      const { data, error } = await db.getTareas()
      if (error) {
        console.error('Error loading tareas:', error)
      } else {
        setTareas(data || [])
      }
    } catch (error) {
      console.error('Error loading tareas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTareaCreated = (nuevaTarea) => {
    setTareas(prev => [nuevaTarea, ...prev])
  }

  const handleTareaUpdated = () => {
    loadTareas() // Recargar la lista de tareas
  }

  const handleVerTarea = (tarea) => {
    setSelectedTarea(tarea)
    setVerModalOpen(true)
  }

  const handleEditarTarea = (tarea) => {
    setSelectedTarea(tarea)
    setEditarModalOpen(true)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800'
      case 'completada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'baja':
        return 'bg-green-100 text-green-800'
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'urgente':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadIcon = (prioridad) => {
    switch (prioridad) {
      case 'baja':
        return '🟢'
      case 'media':
        return '🟡'
      case 'alta':
        return '🔴'
      case 'urgente':
        return '🚨'
      default:
        return '⚪'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'llamada':
        return '📞'
      case 'email':
        return '📧'
      case 'reunion':
        return '🤝'
      case 'seguimiento':
        return '👀'
      case 'propuesta':
        return '📋'
      case 'administrativo':
        return '📁'
      default:
        return '📝'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isVencida = (fechaVencimiento) => {
    return new Date(fechaVencimiento) < new Date()
  }

  const isProximaVencer = (fechaVencimiento) => {
    const ahora = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento - ahora
    return diferencia > 0 && diferencia <= 24 * 60 * 60 * 1000 // 24 horas
  }

  // Calcular métricas
  const totalTareas = tareas.length
  const tareasPendientes = tareas.filter(tarea => tarea.estado === 'pendiente').length
  const tareasCompletadas = tareas.filter(tarea => tarea.estado === 'completada').length
  const tareasVencidas = tareas.filter(tarea => 
    tarea.estado !== 'completada' && isVencida(tarea.fecha_vencimiento)
  ).length

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
          <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">Gestiona tus actividades y seguimientos</p>
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
            onClick={() => setShowNuevaTareaModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tareas</p>
              <p className="text-2xl font-bold text-gray-900">{totalTareas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{tareasPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{tareasCompletadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vencidas</p>
              <p className="text-2xl font-bold text-gray-900">{tareasVencidas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido condicional */}
      {vistaKanban ? (
        <TareasKanban />
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar tareas..."
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

          {/* Lista de Tareas */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Tareas ({filteredTareas.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarea
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignado a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTareas.map((tarea) => (
                    <tr key={tarea.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tarea.titulo}</div>
                          <div className="text-sm text-gray-500">{tarea.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getTipoIcon(tarea.tipo)}</span>
                          <span className="text-sm text-gray-900 capitalize">{tarea.tipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getPrioridadIcon(tarea.prioridad)}</span>
                          <span className="text-sm text-gray-900 capitalize">{tarea.prioridad}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tarea.asignado_a}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isVencida(tarea.fecha_vencimiento) && tarea.estado !== 'completada'
                            ? 'text-red-600 font-semibold'
                            : isProximaVencer(tarea.fecha_vencimiento)
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {formatDate(tarea.fecha_vencimiento)}
                        </div>
                        {isVencida(tarea.fecha_vencimiento) && tarea.estado !== 'completada' && (
                          <div className="text-xs text-red-600">Vencida</div>
                        )}
                        {isProximaVencer(tarea.fecha_vencimiento) && (
                          <div className="text-xs text-orange-600">Próxima a vencer</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Ver"
                            onClick={() => handleVerTarea(tarea)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Editar"
                            onClick={() => handleEditarTarea(tarea)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTareas.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando tu primera tarea.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => setShowNuevaTareaModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Nueva Tarea */}
      <NuevaTareaModal
        isOpen={showNuevaTareaModal}
        onClose={() => setShowNuevaTareaModal(false)}
        onTareaCreated={handleTareaCreated}
      />

      {/* Modal de Ver Tarea */}
      <VerTareaModal
        tarea={selectedTarea}
        isOpen={verModalOpen}
        onClose={() => {
          setVerModalOpen(false)
          setSelectedTarea(null)
        }}
      />

      {/* Modal de Editar Tarea */}
      <EditarTareaModal
        tarea={selectedTarea}
        isOpen={editarModalOpen}
        onClose={() => {
          setEditarModalOpen(false)
          setSelectedTarea(null)
        }}
        onTareaUpdated={handleTareaUpdated}
      />
    </div>
  )
}

export default TareasPage

