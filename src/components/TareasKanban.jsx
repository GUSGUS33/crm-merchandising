import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  User, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Phone,
  Mail,
  FileText,
  Settings,
  Eye,
  Edit3,
  Plus
} from 'lucide-react'
import { db } from '../lib/supabase'

// Componente para cada tarjeta de tarea
const TareaCard = ({ tarea, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: tarea.id,
    data: {
      type: 'tarea',
      tarea,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Obtener icono según el tipo de tarea
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'llamada':
        return <Phone className="h-3 w-3" />
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'reunion':
        return <User className="h-3 w-3" />
      case 'administrativo':
        return <FileText className="h-3 w-3" />
      default:
        return <Settings className="h-3 w-3" />
    }
  }

  // Obtener color de prioridad
  const getColorPrioridad = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'text-red-600 bg-red-100'
      case 'media':
        return 'text-yellow-600 bg-yellow-100'
      case 'baja':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Verificar si la tarea está vencida
  const isVencida = () => {
    const hoy = new Date()
    const fechaVencimiento = new Date(tarea.fecha_vencimiento)
    return fechaVencimiento < hoy && tarea.estado !== 'completada'
  }

  // Calcular días restantes
  const getDiasRestantes = () => {
    const hoy = new Date()
    const fechaVencimiento = new Date(tarea.fecha_vencimiento)
    const diffTime = fechaVencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const diasRestantes = getDiasRestantes()
  const vencida = isVencida()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-move transition-shadow hover:shadow-md ${
        isOverlay ? 'shadow-lg rotate-3' : ''
      } ${vencida ? 'border-red-300 bg-red-50' : ''}`}
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {tarea.titulo}
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {tarea.descripcion}
          </p>
        </div>
        <div className="flex space-x-1 ml-2">
          <button 
            className="p-1 text-gray-400 hover:text-blue-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-3 w-3" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-green-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit3 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Tipo y prioridad */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs text-gray-600">
            {getTipoIcon(tarea.tipo)}
            <span className="ml-1 capitalize">{tarea.tipo}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getColorPrioridad(tarea.prioridad)}`}>
          {tarea.prioridad?.toUpperCase()}
        </div>
      </div>

      {/* Asignado a */}
      <div className="flex items-center mb-3">
        <User className="h-3 w-3 text-gray-500 mr-1" />
        <span className="text-xs text-gray-600">{tarea.asignado_a}</span>
      </div>

      {/* Cliente relacionado */}
      {tarea.cliente_relacionado && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Cliente:</span> {tarea.cliente_relacionado}
          </p>
        </div>
      )}

      {/* Fecha de vencimiento */}
      <div className="flex justify-between items-center pt-2 border-t">
        <div className={`flex items-center text-xs ${vencida ? 'text-red-600' : 'text-gray-500'}`}>
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES')}
        </div>
        <div className="flex items-center space-x-1">
          {vencida ? (
            <div className="flex items-center text-xs text-red-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Vencida</span>
            </div>
          ) : diasRestantes <= 1 ? (
            <div className="flex items-center text-xs text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              <span>Urgente</span>
            </div>
          ) : (
            <div className="flex items-center text-xs text-gray-500">
              <span>{diasRestantes} días</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para cada columna del Kanban
const KanbanColumn = ({ etapa, tareas }) => {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: etapa.id,
    data: {
      type: 'column',
      etapa,
    },
  })

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      {/* Header de la columna */}
      <div className={`${etapa.headerColor} text-white p-3 rounded-t-lg`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{etapa.titulo}</h3>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
            {tareas.length}
          </span>
        </div>
        <p className="text-xs opacity-90 mt-1">{etapa.descripcion}</p>
      </div>

      {/* Área de drop */}
      <div className={`${etapa.color} border-2 border-dashed rounded-b-lg min-h-96 p-3 space-y-3 ${
        isOver ? 'bg-opacity-50 border-blue-400' : ''
      }`}>
        {tareas.map((tarea) => (
          <TareaCard key={tarea.id} tarea={tarea} />
        ))}

        {/* Botón para agregar nueva tarea en esta etapa */}
        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Agregar Tarea</span>
        </button>
      </div>
    </div>
  )
}

const TareasKanban = () => {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Definir las etapas del flujo de trabajo
  const etapas = [
    {
      id: 'pendiente',
      titulo: 'Por Hacer',
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-500',
      descripcion: 'Tareas pendientes de iniciar'
    },
    {
      id: 'en_progreso',
      titulo: 'En Progreso',
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-500',
      descripcion: 'Tareas en desarrollo'
    },
    {
      id: 'revision',
      titulo: 'En Revisión',
      color: 'bg-yellow-100 border-yellow-300',
      headerColor: 'bg-yellow-500',
      descripcion: 'Tareas esperando revisión'
    },
    {
      id: 'completada',
      titulo: 'Completadas',
      color: 'bg-green-100 border-green-300',
      headerColor: 'bg-green-500',
      descripcion: 'Tareas finalizadas'
    },
    {
      id: 'cancelada',
      titulo: 'Canceladas',
      color: 'bg-red-100 border-red-300',
      headerColor: 'bg-red-500',
      descripcion: 'Tareas canceladas o descartadas'
    }
  ]

  // Cargar tareas al inicializar
  useEffect(() => {
    cargarTareas()
  }, [])

  const cargarTareas = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.getTareas()
      if (error) {
        console.error('Error cargando tareas:', error)
      } else {
        setTareas(data || [])
      }
    } catch (error) {
      console.error('Error cargando tareas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar tareas por etapa
  const tareasPorEtapa = etapas.reduce((acc, etapa) => {
    acc[etapa.id] = tareas.filter(tarea => tarea.estado === etapa.id)
    return acc
  }, {})

  // Manejar el inicio del drag
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  // Manejar el drag over
  const handleDragOver = (event) => {
    const { active, over } = event
    
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Si estamos arrastrando sobre una columna
    if (activeData?.type === 'tarea' && overData?.type === 'column') {
      // No hacer nada aquí, se manejará en handleDragEnd
      return
    }
  }

  // Manejar el final del drag
  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeData.type !== 'tarea') return

    let nuevoEstado = null

    // Si se suelta sobre una columna
    if (overData?.type === 'column') {
      nuevoEstado = overData.etapa.id
    }
    // Si se suelta sobre otra tarea, usar el estado de esa tarea
    else if (overData?.type === 'tarea') {
      nuevoEstado = overData.tarea.estado
    }

    if (!nuevoEstado || activeData.tarea.estado === nuevoEstado) return

    try {
      // Actualizar el estado de la tarea
      const tareaActualizada = { ...activeData.tarea, estado: nuevoEstado }
      const { error } = await db.updateTarea(tareaActualizada.id, tareaActualizada)
      
      if (error) {
        console.error('Error actualizando tarea:', error)
        return
      }
      
      // Actualizar el estado local
      setTareas(prevTareas => 
        prevTareas.map(tarea => 
          tarea.id === activeData.tarea.id 
            ? { ...tarea, estado: nuevoEstado }
            : tarea
        )
      )
    } catch (error) {
      console.error('Error actualizando tarea:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeTarea = activeId ? tareas.find(tarea => tarea.id === activeId) : null

  // Calcular estadísticas
  const totalTareas = tareas.length
  const tareasVencidas = tareas.filter(tarea => {
    const hoy = new Date()
    const fechaVencimiento = new Date(tarea.fecha_vencimiento)
    return fechaVencimiento < hoy && tarea.estado !== 'completada'
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
          <p className="text-gray-600">Organización visual del flujo de trabajo</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total de tareas: <span className="font-semibold">{totalTareas}</span>
          </div>
          {tareasVencidas > 0 && (
            <div className="text-sm text-red-600">
              Vencidas: <span className="font-semibold">{tareasVencidas}</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => (
            <KanbanColumn 
              key={etapa.id}
              etapa={etapa} 
              tareas={tareasPorEtapa[etapa.id] || []} 
            />
          ))}
        </div>

        <DragOverlay>
          {activeTarea ? <TareaCard tarea={activeTarea} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Estadísticas por etapa */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Flujo de Trabajo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {etapas.map((etapa) => {
            const tareasEtapa = tareasPorEtapa[etapa.id] || []
            const tareasVencidasEtapa = tareasEtapa.filter(tarea => {
              const hoy = new Date()
              const fechaVencimiento = new Date(tarea.fecha_vencimiento)
              return fechaVencimiento < hoy && tarea.estado !== 'completada'
            }).length
            
            return (
              <div key={etapa.id} className="text-center">
                <div className={`${etapa.headerColor} text-white p-3 rounded-lg mb-2`}>
                  <div className="text-2xl font-bold">{tareasEtapa.length}</div>
                  <div className="text-xs opacity-90">Tareas</div>
                </div>
                <div className="text-sm font-medium text-gray-900">{etapa.titulo}</div>
                {tareasVencidasEtapa > 0 && (
                  <div className="text-xs text-red-600">{tareasVencidasEtapa} vencidas</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TareasKanban

