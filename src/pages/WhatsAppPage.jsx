import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { whatsappService, whatsappNotifications, CONFIG_STATUS } from '../lib/whatsapp'
import { 
  MessageCircle, 
  Settings, 
  Send, 
  History, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw,
  Phone,
  FileText,
  Clock,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'

const WhatsAppPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [config, setConfig] = useState(whatsappService.loadConfig())
  const [showTokens, setShowTokens] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [messageHistory, setMessageHistory] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [configStatus, setConfigStatus] = useState(CONFIG_STATUS.NOT_CONFIGURED)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setMessageHistory(whatsappService.getMessageHistory())
    setStats(whatsappService.getMessageStats())
    setConfigStatus(whatsappService.getConfigStatus())
  }

  const handleConfigSave = () => {
    setLoading(true)
    try {
      const success = whatsappService.saveConfig(config)
      if (success) {
        setConfigStatus(whatsappService.getConfigStatus())
        alert('Configuración guardada exitosamente')
      } else {
        alert('Error guardando la configuración')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error guardando la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleTestMessage = async () => {
    if (!testPhone || !testMessage) {
      alert('Por favor ingresa un número de teléfono y mensaje')
      return
    }

    setLoading(true)
    try {
      await whatsappService.sendTextMessage(testPhone, testMessage, {
        type: 'test_message',
        userId: 'admin'
      })
      alert('Mensaje de prueba enviado exitosamente')
      setTestMessage('')
      setTestPhone('')
      loadData() // Recargar historial
    } catch (error) {
      console.error('Error:', error)
      alert('Error enviando mensaje de prueba')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copiado al portapapeles')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case CONFIG_STATUS.NOT_CONFIGURED:
        return 'text-red-600 bg-red-100'
      case CONFIG_STATUS.CONFIGURED:
        return 'text-green-600 bg-green-100'
      case CONFIG_STATUS.TESTING:
        return 'text-yellow-600 bg-yellow-100'
      case CONFIG_STATUS.ACTIVE:
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case CONFIG_STATUS.NOT_CONFIGURED:
        return 'No Configurado'
      case CONFIG_STATUS.CONFIGURED:
        return 'Configurado'
      case CONFIG_STATUS.TESTING:
        return 'En Pruebas'
      case CONFIG_STATUS.ACTIVE:
        return 'Activo'
      default:
        return 'Desconocido'
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estado de configuración */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Estado de WhatsApp Business</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">WhatsApp Business API</h4>
                <p className="text-sm text-gray-600">
                  {whatsappService.isSimulationMode ? 'Modo Simulación Activo' : 'API Conectada'}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(configStatus)}`}>
              {configStatus === CONFIG_STATUS.CONFIGURED ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-1" />
              )}
              {getStatusText(configStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enviados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outbound || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recibidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inbound || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes recientes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Mensajes Recientes</h3>
        </div>
        <div className="p-6">
          {messageHistory.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {messageHistory.slice(0, 5).map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    message.direction === 'outbound' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {message.direction === 'outbound' ? (
                      <Send className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {message.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mensajes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Los mensajes aparecerán aquí cuando comiences a usar WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderConfiguracion = () => (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">Configuración de WhatsApp Business API</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Para configurar WhatsApp Business API necesitas:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Una cuenta de WhatsApp Business</li>
                <li>Una aplicación en Meta for Developers</li>
                <li>Un número de teléfono verificado</li>
                <li>Token de acceso permanente</li>
                <li>ID del número de teléfono</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de configuración */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Credenciales de API</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acceso
            </label>
            <div className="relative">
              <Input
                type={showTokens ? 'text' : 'password'}
                value={config.accessToken}
                onChange={(e) => setConfig({...config, accessToken: e.target.value})}
                placeholder="EAABsBCS1234..."
                className="pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {config.accessToken && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.accessToken)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Número de Teléfono
            </label>
            <Input
              value={config.phoneNumberId}
              onChange={(e) => setConfig({...config, phoneNumberId: e.target.value})}
              placeholder="123456789012345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de la Cuenta de Negocio
            </label>
            <Input
              value={config.businessAccountId}
              onChange={(e) => setConfig({...config, businessAccountId: e.target.value})}
              placeholder="123456789012345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Verificación del Webhook
            </label>
            <Input
              value={config.webhookVerifyToken}
              onChange={(e) => setConfig({...config, webhookVerifyToken: e.target.value})}
              placeholder="mi_token_secreto_123"
            />
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={handleConfigSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Guardar Configuración
            </Button>
          </div>
        </div>
      </div>

      {/* URL del Webhook */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Configuración del Webhook</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Webhook
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value="https://tu-dominio.com/webhook/whatsapp"
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard('https://tu-dominio.com/webhook/whatsapp')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Usa esta URL en la configuración del webhook en Meta for Developers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPruebas = () => (
    <div className="space-y-6">
      {/* Enviar mensaje de prueba */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Enviar Mensaje de Prueba</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono (con código de país)
            </label>
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+34612345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Escribe tu mensaje de prueba aquí..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows="4"
            />
          </div>
          <Button 
            onClick={handleTestMessage}
            disabled={loading || !testPhone || !testMessage}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Enviar Mensaje de Prueba
          </Button>
        </div>
      </div>

      {/* Plantillas de prueba */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Plantillas de Mensajes</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Presupuesto Enviado</h4>
              <p className="text-sm text-gray-600 mb-3">
                Notifica al cliente cuando se envía un presupuesto
              </p>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Probar Template
              </Button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Recordatorio de Reunión</h4>
              <p className="text-sm text-gray-600 mb-3">
                Recuerda al cliente sobre reuniones programadas
              </p>
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Probar Template
              </Button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Seguimiento de Lead</h4>
              <p className="text-sm text-gray-600 mb-3">
                Seguimiento automático de leads sin respuesta
              </p>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Probar Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistorial = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por número de teléfono..."
            className="flex-1"
          />
          <select className="px-3 py-2 border border-gray-300 rounded-md">
            <option value="all">Todos los mensajes</option>
            <option value="outbound">Enviados</option>
            <option value="inbound">Recibidos</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Mensajes ({messageHistory.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {messageHistory.length > 0 ? (
            messageHistory.map((message) => (
              <div key={message.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${
                    message.direction === 'outbound' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {message.direction === 'outbound' ? (
                      <Send className="w-5 h-5 text-blue-600" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{message.phoneNumber}</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          message.direction === 'outbound' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {message.direction === 'outbound' ? 'Enviado' : 'Recibido'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <p className="text-gray-700 mt-2">{message.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Tipo: {message.type}</span>
                      <span>Estado: {message.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mensajes</h3>
              <p className="mt-1 text-sm text-gray-500">
                El historial de mensajes aparecerá aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-gray-600">Gestión de mensajería y notificaciones automáticas</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center text-sm ${
            whatsappService.isSimulationMode ? 'text-yellow-600' : 'text-green-600'
          }`}>
            <MessageCircle className="w-4 h-4 mr-1" />
            {whatsappService.isSimulationMode ? 'Modo Simulación' : 'API Conectada'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
            { id: 'configuracion', name: 'Configuración', icon: Settings },
            { id: 'pruebas', name: 'Pruebas', icon: Send },
            { id: 'historial', name: 'Historial', icon: History }
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
      {activeTab === 'configuracion' && renderConfiguracion()}
      {activeTab === 'pruebas' && renderPruebas()}
      {activeTab === 'historial' && renderHistorial()}
    </div>
  )
}

export default WhatsAppPage

