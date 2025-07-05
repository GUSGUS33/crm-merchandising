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
  Building, 
  Mail, 
  Phone, 
  DollarSign,
  Calendar,
  Eye,
  Edit3,
  Plus
} from 'lucide-react'
import { db } from '../lib/supabase'

// Componente para cada tarjeta de lead
const LeadCard = ({ lead, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: lead.id,
    data: {
      type: 'lead',
      lead,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Formatear valor monetario
  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor)
  }

  // Obtener color de probabilidad
  const getColorProbabilidad = (probabilidad) => {
    if (probabilidad >= 80) return 'text-green-600 bg-green-100'
    if (probabilidad >= 60) return 'text-yellow-600 bg-yellow-100'
    if (probabilidad >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-move transition-shadow hover:shadow-md ${
        isOverlay ? 'shadow-lg rotate-3' : ''
      }`}
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {lead.nombre}
          </h4>
          <p className="text-xs text-gray-600 flex items-center mt-1">
            <Building className="h-3 w-3 mr-1" />
            {lead.empresa}
          </p>
        </div>
        <div className="flex space-x-1">
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

      {/* Información de contacto */}
      <div className="space-y-1 mb-3">
        <p className="text-xs text-gray-600 flex items-center">
          <Mail className="h-3 w-3 mr-1" />
          {lead.email}
        </p>
        {lead.telefono && (
          <p className="text-xs text-gray-600 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {lead.telefono}
          </p>
        )}
      </div>

      {/* Métricas */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs text-gray-600">
            <DollarSign className="h-3 w-3 mr-1" />
            {formatearValor(lead.valor_estimado || 0)}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getColorProbabilidad(lead.probabilidad || 0)}`}>
          {lead.probabilidad || 0}%
        </div>
      </div>

      {/* Notas */}
      {lead.notas && (
        <div className="border-t pt-2">
          <p className="text-xs text-gray-600 line-clamp-2">
            {lead.notas}
          </p>
        </div>
      )}

      {/* Fecha */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(lead.created_at).toLocaleDateString('es-ES')}
        </div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>
    </div>
  )
}

// Componente para cada columna del Kanban
const KanbanColumn = ({ etapa, leads }) => {
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
            {leads.length}
          </span>
        </div>
        <p className="text-xs opacity-90 mt-1">{etapa.descripcion}</p>
      </div>

      {/* Área de drop */}
      <div className={`${etapa.color} border-2 border-dashed rounded-b-lg min-h-96 p-3 space-y-3 ${
        isOver ? 'bg-opacity-50 border-blue-400' : ''
      }`}>
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {/* Botón para agregar nuevo lead en esta etapa */}
        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Agregar Lead</span>
        </button>
      </div>
    </div>
  )
}

const LeadsKanban = () => {
  const [leads, setLeads] = useState([])
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

  // Definir las etapas del pipeline de ventas
  const etapas = [
    {
      id: 'nuevo',
      titulo: 'Nuevos Leads',
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-500',
      descripcion: 'Leads recién generados'
    },
    {
      id: 'contactado',
      titulo: 'Contactados',
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-500',
      descripcion: 'Primer contacto realizado'
    },
    {
      id: 'calificado',
      titulo: 'Calificados',
      color: 'bg-yellow-100 border-yellow-300',
      headerColor: 'bg-yellow-500',
      descripcion: 'Lead calificado como oportunidad'
    },
    {
      id: 'propuesta_enviada',
      titulo: 'Propuesta Enviada',
      color: 'bg-purple-100 border-purple-300',
      headerColor: 'bg-purple-500',
      descripcion: 'Propuesta comercial enviada'
    },
    {
      id: 'negociacion',
      titulo: 'En Negociación',
      color: 'bg-orange-100 border-orange-300',
      headerColor: 'bg-orange-500',
      descripcion: 'Negociando términos y condiciones'
    },
    {
      id: 'ganado',
      titulo: 'Ganados',
      color: 'bg-green-100 border-green-300',
      headerColor: 'bg-green-500',
      descripcion: 'Lead convertido en cliente'
    },
    {
      id: 'perdido',
      titulo: 'Perdidos',
      color: 'bg-red-100 border-red-300',
      headerColor: 'bg-red-500',
      descripcion: 'Oportunidad perdida'
    }
  ]

  // Cargar leads al inicializar
  useEffect(() => {
    cargarLeads()
  }, [])

  const cargarLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.getLeads()
      if (error) {
        console.error('Error cargando leads:', error)
      } else {
        setLeads(data || [])
      }
    } catch (error) {
      console.error('Error cargando leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar leads por etapa
  const leadsPorEtapa = etapas.reduce((acc, etapa) => {
    acc[etapa.id] = leads.filter(lead => lead.estado === etapa.id)
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
    if (activeData?.type === 'lead' && overData?.type === 'column') {
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

    if (!activeData || activeData.type !== 'lead') return

    let nuevoEstado = null

    // Si se suelta sobre una columna
    if (overData?.type === 'column') {
      nuevoEstado = overData.etapa.id
    }
    // Si se suelta sobre otro lead, usar el estado de ese lead
    else if (overData?.type === 'lead') {
      nuevoEstado = overData.lead.estado
    }

    if (!nuevoEstado || activeData.lead.estado === nuevoEstado) return

    try {
      // Actualizar el estado del lead
      const leadActualizado = { ...activeData.lead, estado: nuevoEstado }
      const { error } = await db.updateLead(leadActualizado.id, leadActualizado)
      
      if (error) {
        console.error('Error actualizando lead:', error)
        return
      }
      
      // Actualizar el estado local
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === activeData.lead.id 
            ? { ...lead, estado: nuevoEstado }
            : lead
        )
      )
    } catch (error) {
      console.error('Error actualizando lead:', error)
    }
  }

  // Formatear valor monetario
  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-gray-600">Gestión visual de leads por etapas</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total de leads: <span className="font-semibold">{leads.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Valor total: <span className="font-semibold">
              {formatearValor(leads.reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0))}
            </span>
          </div>
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
              leads={leadsPorEtapa[etapa.id] || []} 
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Estadísticas por etapa */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {etapas.map((etapa) => {
            const leadsEtapa = leadsPorEtapa[etapa.id] || []
            const valorTotal = leadsEtapa.reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0)
            
            return (
              <div key={etapa.id} className="text-center">
                <div className={`${etapa.headerColor} text-white p-3 rounded-lg mb-2`}>
                  <div className="text-2xl font-bold">{leadsEtapa.length}</div>
                  <div className="text-xs opacity-90">Leads</div>
                </div>
                <div className="text-sm font-medium text-gray-900">{etapa.titulo}</div>
                <div className="text-xs text-gray-600">{formatearValor(valorTotal)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LeadsKanban

