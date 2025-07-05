import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ConfiguracionWhatsAppModal = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({
    waba_id: '',
    phone_number_id: '',
    access_token: '',
    webhook_url: '',
    webhook_verify_token: '',
    app_id: '',
    app_secret: ''
  });

  const [showTokens, setShowTokens] = useState({
    access_token: false,
    webhook_verify_token: false,
    app_secret: false
  });

  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarConfiguracion();
    }
  }, [isOpen]);

  const cargarConfiguracion = async () => {
    try {
      // Cargar configuración existente desde localStorage o Supabase
      const savedConfig = localStorage.getItem('whatsapp_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleShowToken = (field) => {
    setShowTokens(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validarConfiguracion = () => {
    const camposRequeridos = ['waba_id', 'phone_number_id', 'access_token'];
    const camposVacios = camposRequeridos.filter(campo => !config[campo].trim());
    
    if (camposVacios.length > 0) {
      alert(`Los siguientes campos son obligatorios: ${camposVacios.join(', ')}`);
      return false;
    }

    return true;
  };

  const probarConexion = async () => {
    if (!validarConfiguracion()) return;

    setLoading(true);
    setTestStatus(null);

    try {
      // Simular prueba de conexión con la API de WhatsApp
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}`, {
        headers: {
          'Authorization': `Bearer ${config.access_token}`
        }
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('Error probando conexión:', error);
      setTestStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validarConfiguracion()) return;

    setLoading(true);
    try {
      // Guardar en localStorage (en producción sería en Supabase)
      localStorage.setItem('whatsapp_config', JSON.stringify(config));
      
      // Llamar callback del componente padre
      if (onSave) {
        await onSave(config);
      }

      alert('Configuración guardada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const generarWebhookUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/whatsapp/webhook`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración de WhatsApp Business API
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Información Importante</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Estos datos se obtienen de tu cuenta de WhatsApp Business API en Meta for Developers. 
                  Asegúrate de tener los permisos necesarios y que tu aplicación esté aprobada.
                </p>
              </div>
            </div>
          </div>

          {/* Configuración básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WABA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Cuenta WhatsApp Business *
              </label>
              <input
                type="text"
                value={config.waba_id}
                onChange={(e) => handleInputChange('waba_id', e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID numérico de tu cuenta de WhatsApp Business
              </p>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Número de Teléfono *
              </label>
              <input
                type="text"
                value={config.phone_number_id}
                onChange={(e) => handleInputChange('phone_number_id', e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID del número registrado en WhatsApp Business
              </p>
            </div>

            {/* Access Token */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Acceso Permanente *
              </label>
              <div className="relative">
                <input
                  type={showTokens.access_token ? "text" : "password"}
                  value={config.access_token}
                  onChange={(e) => handleInputChange('access_token', e.target.value)}
                  placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken('access_token')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showTokens.access_token ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Token de larga duración para autenticación con la API
              </p>
            </div>

            {/* App ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Aplicación Facebook
              </label>
              <input
                type="text"
                value={config.app_id}
                onChange={(e) => handleInputChange('app_id', e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID de tu aplicación en Facebook Developers
              </p>
            </div>

            {/* App Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secreto de Aplicación Facebook
              </label>
              <div className="relative">
                <input
                  type={showTokens.app_secret ? "text" : "password"}
                  value={config.app_secret}
                  onChange={(e) => handleInputChange('app_secret', e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken('app_secret')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showTokens.app_secret ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Secreto de tu aplicación para seguridad
              </p>
            </div>
          </div>

          {/* Configuración de Webhook */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Webhook</h3>
            
            <div className="space-y-4">
              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={config.webhook_url || generarWebhookUrl()}
                    onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                    placeholder={generarWebhookUrl()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('webhook_url', generarWebhookUrl())}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL donde Meta enviará las notificaciones de mensajes
                </p>
              </div>

              {/* Webhook Verify Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de Verificación del Webhook
                </label>
                <div className="relative">
                  <input
                    type={showTokens.webhook_verify_token ? "text" : "password"}
                    value={config.webhook_verify_token}
                    onChange={(e) => handleInputChange('webhook_verify_token', e.target.value)}
                    placeholder="mi_token_secreto_123"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('webhook_verify_token')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showTokens.webhook_verify_token ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Token secreto para verificar que las solicitudes vienen de Meta
                </p>
              </div>
            </div>
          </div>

          {/* Estado de la prueba */}
          {testStatus && (
            <div className={`p-4 rounded-lg ${
              testStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  testStatus === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {testStatus === 'success' 
                    ? 'Conexión exitosa con WhatsApp Business API' 
                    : 'Error al conectar con WhatsApp Business API'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            * Campos obligatorios
          </div>
          <div className="flex space-x-3">
            <button
              onClick={probarConexion}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionWhatsAppModal;

