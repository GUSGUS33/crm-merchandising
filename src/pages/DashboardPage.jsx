import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  UserPlus, 
  FileText, 
  CheckSquare,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import NuevoClienteModal from '../components/NuevoClienteModal'
import NuevoLeadModal from '../components/NuevoLeadModal'
import NuevaTareaModal from '../components/NuevaTareaModal'
import DashboardAvanzado from '../components/DashboardAvanzado'
import NotasPostIt from '../components/NotasPostIt'

const DashboardPage = () => {
  const { user, getUserRole } = useAuth()
  const navigate = useNavigate()

  // Estados para los modales
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false)
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [isTareaModalOpen, setIsTareaModalOpen] = useState(false)
  
  // Estado para alternar entre dashboard básico y avanzado
  const [vistaAvanzada, setVistaAvanzada] = useState(false)

  // Datos de ejemplo para el dashboard
  const stats = [
    {
      title: 'Total Clientes',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Leads Activos',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      title: 'Facturas Pendientes',
      value: '23',
      change: '-8%',
      changeType: 'negative',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Tareas Vencidas',
      value: '7',
      change: '+2',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'cliente',
      message: 'Nuevo cliente registrado: Empresa ABC S.L.',
      time: 'Hace 2 horas',
      icon: Users
    },
    {
      id: 2,
      type: 'factura',
      message: 'Factura #2024-001 marcada como pagada',
      time: 'Hace 4 horas',
      icon: FileText
    },
    {
      id: 3,
      type: 'lead',
      message: 'Lead convertido a cliente: María García',
      time: 'Hace 6 horas',
      icon: UserPlus
    },
    {
      id: 4,
      type: 'tarea',
      message: 'Tarea completada: Seguimiento cliente XYZ',
      time: 'Hace 1 día',
      icon: CheckSquare
    }
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: 'Llamar a cliente potencial',
      client: 'Empresa DEF',
      dueDate: '2025-01-08',
      priority: 'alta'
    },
    {
      id: 2,
      title: 'Enviar presupuesto personalizado',
      client: 'Corporación GHI',
      dueDate: '2025-01-09',
      priority: 'media'
    },
    {
      id: 3,
      title: 'Reunión de seguimiento',
      client: 'Startup JKL',
      dueDate: '2025-01-10',
      priority: 'baja'
    }
  ]

  const getPriorityColor = (priority) => {
    const colors = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baja': 'bg-green-100 text-green-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido de vuelta, {user?.email}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setVistaAvanzada(false)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              !vistaAvanzada 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Vista Básica</span>
          </button>
          <button
            onClick={() => setVistaAvanzada(true)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              vistaAvanzada 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Vista Avanzada</span>
          </button>
        </div>
      </div>

      {/* Contenido condicional */}
      {vistaAvanzada ? (
        <DashboardAvanzado />
      ) : (
        <>
          {/* Dashboard básico existente */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs mes anterior
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Próximas Tareas
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {task.client}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setIsClienteModalOpen(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Nuevo Cliente</h3>
              <p className="text-sm text-gray-500">Agregar cliente</p>
            </div>
          </button>

          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserPlus className="h-8 w-8 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Nuevo Lead</h3>
              <p className="text-sm text-gray-500">Agregar prospecto</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/presupuestos')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Nuevo Presupuesto</h3>
              <p className="text-sm text-gray-500">Crear presupuesto</p>
            </div>
          </button>
          
          <button 
            onClick={() => setIsTareaModalOpen(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckSquare className="h-8 w-8 text-orange-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Nueva Tarea</h3>
              <p className="text-sm text-gray-500">Programar actividad</p>
            </div>
          </button>
        </div>
      </div>

      {/* Sección de Notas Post-it */}
      <NotasPostIt />

      {/* Modales */}
      <NuevoClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        onClienteCreated={() => {
          setIsClienteModalOpen(false)
          // Aquí podrías actualizar las métricas del dashboard si fuera necesario
        }}
      />

      <NuevoLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onLeadCreated={() => {
          setIsLeadModalOpen(false)
          // Aquí podrías actualizar las métricas del dashboard si fuera necesario
        }}
      />

      <NuevaTareaModal
        isOpen={isTareaModalOpen}
        onClose={() => setIsTareaModalOpen(false)}
        onTareaCreated={() => {
          setIsTareaModalOpen(false)
          // Aquí podrías actualizar las métricas del dashboard si fuera necesario
        }}
      />
        </>
      )}
    </div>
  )
}

export default DashboardPage

