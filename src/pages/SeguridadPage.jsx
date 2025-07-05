import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { SecurityLogger, ThreatDetection, EncryptionService } from '../lib/security'
import ConfiguracionIAModal from '../components/ConfiguracionIAModal'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity, 
  Clock, 
  User, 
  MapPin, 
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Zap,
  Bot
} from 'lucide-react'

const SeguridadPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [logs, setLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showOpenRouterModal, setShowOpenRouterModal] = useState(false)

  useEffect(() => {
    loadSecurityData()
  }, [])

  useEffect(() => {
    filterData()
  }, [logs, alerts, searchTerm, filterLevel])

  const loadSecurityData = () => {
    setLoading(true)
    try {
      const securityLogs = SecurityLogger.getLogs()
      const securityAlerts = SecurityLogger.getAlerts()
      
      setLogs(securityLogs.reverse()) // Más recientes primero
      setAlerts(securityAlerts.reverse())
    } catch (error) {
      console.error('Error cargando datos de seguridad:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = logs

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por nivel
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel)
    }

    setFilteredLogs(filtered)

    // Filtrar alertas
    let filteredAlertsData = alerts
    if (searchTerm) {
      filteredAlertsData = filteredAlertsData.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredAlerts(filteredAlertsData)
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const resolveAlert = (alertId) => {
    SecurityLogger.resolveAlert(alertId)
    loadSecurityData()
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `security_logs_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const generateTestAlert = () => {
    SecurityLogger.log(
      'test_security_alert',
      { message: 'Alerta de prueba generada manualmente' },
      'admin',
      'warning'
    )
    loadSecurityData()
  }

  // Calcular estadísticas
  const stats = {
    totalLogs: logs.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    warningAlerts: alerts.filter(a => a.severity === 'warning' && !a.resolved).length,
    resolvedAlerts: alerts.filter(a => a.resolved).length,
    todayLogs: logs.filter(log => {
      const today = new Date().toDateString()
      return new Date(log.timestamp).toDateString() === today
    }).length
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Logs Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertas Críticas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Advertencias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.warningAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Logs Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayLogs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Recientes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
        </div>
        <div className="p-6">
          {filteredAlerts.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(alert.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay alertas recientes</p>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={generateTestAlert} variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Generar Alerta de Prueba
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Logs
            </Button>
            <Button onClick={loadSecurityData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Datos
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLogs = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos los niveles</option>
            <option value="critical">Crítico</option>
            <option value="error">Error</option>
            <option value="warning">Advertencia</option>
            <option value="info">Información</option>
          </select>
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Logs de Seguridad ({filteredLogs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                      <span className="ml-1">{log.level}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{log.userId || 'Sistema'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron logs con los filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAlertas = () => (
    <div className="space-y-6">
      {/* Lista de Alertas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Alertas de Seguridad ({filteredAlerts.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.resolved ? 'border-gray-200 bg-gray-50' : 
                  alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                          alert.severity === 'critical' ? 'text-red-600 bg-red-100' :
                          alert.severity === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                          'text-blue-600 bg-blue-100'
                        }`}>
                          {alert.severity}
                        </span>
                        {alert.resolved && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resuelta
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(alert.timestamp).toLocaleString('es-ES')}
                      </p>
                      {alert.resolvedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          Resuelta: {new Date(alert.resolvedAt).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alertas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se han detectado alertas de seguridad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEncriptacion = () => (
    <div className="space-y-6">
      {/* Estado de Encriptación */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Estado de Encriptación</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Campos Encriptados</h4>
              <div className="space-y-2">
                {['Email', 'Teléfono', 'Notas', 'Descripción', 'Dirección'].map((field) => (
                  <div key={field} className="flex items-center">
                    <Lock className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">{field}</span>
                    <span className="ml-auto text-xs text-green-600">Protegido</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configuración</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Algoritmo:</span>
                  <span className="text-sm font-medium">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Modo:</span>
                  <span className="text-sm font-medium">CBC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Estado:</span>
                  <span className="text-sm text-green-600 font-medium">Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Herramientas de Encriptación */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Herramientas de Encriptación</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto a Encriptar
              </label>
              <Input
                placeholder="Ingrese texto para encriptar..."
                id="encrypt-input"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  const input = document.getElementById('encrypt-input')
                  const output = document.getElementById('encrypt-output')
                  if (input.value) {
                    output.value = EncryptionService.encrypt(input.value)
                  }
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Encriptar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('encrypt-input')
                  const output = document.getElementById('encrypt-output')
                  if (input.value) {
                    output.value = EncryptionService.decrypt(input.value)
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Desencriptar
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado
              </label>
              <textarea
                id="encrypt-output"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="3"
                readOnly
                placeholder="El resultado aparecerá aquí..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderConfiguracionIA = () => {
    // Obtener configuración actual
    const getConfiguracionActual = () => {
      try {
        const config = localStorage.getItem('ai_config');
        if (config) {
          return JSON.parse(config);
        }
        // Fallback a configuración antigua de OpenRouter
        const oldConfig = localStorage.getItem('openrouter_config');
        if (oldConfig) {
          return {
            proveedor: 'openrouter',
            config: { openrouter: JSON.parse(oldConfig) }
          };
        }
        return null;
      } catch (error) {
        console.error('Error leyendo configuración:', error);
        return null;
      }
    };

    const configuracionActual = getConfiguracionActual();
    const proveedorActual = configuracionActual?.proveedor || 'No configurado';
    const tieneApiKey = configuracionActual?.config?.[configuracionActual.proveedor]?.apiKey;

    const proveedoresDisponibles = [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Acceso a múltiples modelos (Claude, GPT-4, etc.)',
        tipo: 'Pago',
        color: 'blue',
        icon: '🌐'
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        description: 'Modelo avanzado con opciones gratuitas',
        tipo: 'Freemium',
        color: 'purple',
        icon: '✨'
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'Inferencia ultra-rápida con tier gratuito',
        tipo: 'Freemium',
        color: 'orange',
        icon: '⚡'
      },
      {
        id: 'huggingface',
        name: 'Hugging Face',
        description: 'Plataforma open source con modelos gratuitos',
        tipo: 'Freemium',
        color: 'yellow',
        icon: '🤗'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Configuración Principal */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de IA</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configura tu proveedor de IA preferido para el asistente de correos
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Bot className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Proveedor de IA</h4>
                    <p className="text-sm text-gray-600">
                      Elige entre múltiples proveedores, incluyendo opciones gratuitas
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowOpenRouterModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Estado Actual</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Proveedor:</span>
                      <span className="text-sm font-medium">
                        {proveedorActual === 'No configurado' ? 'No configurado' : 
                         proveedoresDisponibles.find(p => p.id === proveedorActual)?.name || proveedorActual}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">API Key:</span>
                      <span className="text-sm font-medium">
                        {tieneApiKey ? '••••••••' : 'No configurada'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Estado:</span>
                      <span className={`text-sm font-medium ${
                        tieneApiKey ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tieneApiKey ? 'Configurado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Proveedores Disponibles</h4>
                  <div className="space-y-2">
                    {proveedoresDisponibles.map((proveedor) => (
                      <div key={proveedor.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{proveedor.icon}</span>
                          <span className="text-sm text-gray-700">{proveedor.name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          proveedor.tipo === 'Freemium' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {proveedor.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones Gratuitas Destacadas */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">🆓 Opciones Gratuitas</h3>
            <p className="text-sm text-gray-600 mt-1">
              Proveedores con tiers gratuitos para empezar sin costo
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⚡</span>
                  <h4 className="font-medium text-green-800">Groq</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Inferencia ultra-rápida con tier gratuito generoso
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Llama 3.1 70B gratis</li>
                  <li>• Velocidad excepcional</li>
                  <li>• Límites generosos</li>
                </ul>
              </div>

              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">✨</span>
                  <h4 className="font-medium text-purple-800">DeepSeek</h4>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Modelo avanzado con precios muy competitivos
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• DeepSeek R1 gratis vía OpenRouter</li>
                  <li>• API directa muy económica</li>
                  <li>• Rendimiento excelente</li>
                </ul>
              </div>

              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🤗</span>
                  <h4 className="font-medium text-yellow-800">Hugging Face</h4>
                </div>
                <p className="text-sm text-yellow-700 mb-2">
                  Plataforma open source con modelos gratuitos
                </p>
                <ul className="text-xs text-yellow-600 space-y-1">
                  <li>• Múltiples modelos gratuitos</li>
                  <li>• Comunidad activa</li>
                  <li>• Fácil de usar</li>
                </ul>
              </div>

              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🌐</span>
                  <h4 className="font-medium text-blue-800">OpenRouter</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  Acceso a múltiples modelos con una sola API
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• DeepSeek R1 gratis</li>
                  <li>• Múltiples proveedores</li>
                  <li>• Precios competitivos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Uso */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Información de Uso</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Cómo usar el Asistente de IA</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Haz clic en "Configurar" para elegir tu proveedor de IA</li>
                        <li>Ingresa tu API key (muchas opciones tienen tiers gratuitos)</li>
                        <li>Ve a WhatsApp y selecciona una conversación</li>
                        <li>Haz clic en el icono del lápiz (🖊️) para abrir el asistente</li>
                        <li>Escribe tus ideas y selecciona un tono</li>
                        <li>El asistente generará un correo profesional</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Recomendaciones para Empezar</h4>
                    <div className="mt-2 text-sm text-green-700">
                      <ul className="space-y-1">
                        <li>• <strong>Para empezar gratis:</strong> Prueba Groq con Llama 3.1 70B</li>
                        <li>• <strong>Para máximo rendimiento:</strong> DeepSeek R1 vía OpenRouter (gratis)</li>
                        <li>• <strong>Para uso profesional:</strong> Claude 3.5 Sonnet vía OpenRouter</li>
                        <li>• <strong>Para experimentar:</strong> Hugging Face con múltiples modelos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Configuración */}
        <ConfiguracionIAModal
          isOpen={showOpenRouterModal}
          onClose={() => setShowOpenRouterModal(false)}
          onSave={() => {
            setShowOpenRouterModal(false)
            // Recargar para actualizar el estado
            window.location.reload()
          }}
        />
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Centro de Seguridad</h1>
          <p className="text-gray-600">Monitoreo y administración de seguridad avanzada</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-green-600">
            <Shield className="w-4 h-4 mr-1" />
            Sistema Seguro
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: Activity },
            { id: 'logs', name: 'Logs', icon: Eye },
            { id: 'alertas', name: 'Alertas', icon: AlertTriangle },
            { id: 'encriptacion', name: 'Encriptación', icon: Lock },
            { id: 'ia', name: 'Configuración de IA', icon: Bot }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'alertas' && renderAlertas()}
      {activeTab === 'encriptacion' && renderEncriptacion()}
      {activeTab === 'ia' && renderConfiguracionIA()}
    </div>
  )
}

export default SeguridadPage

