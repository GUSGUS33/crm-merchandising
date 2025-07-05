import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Zap, CheckCircle, AlertCircle, ExternalLink, Bot, Sparkles, Globe, Cpu } from 'lucide-react';

const ConfiguracionIAModal = ({ isOpen, onClose, onSave }) => {
  const [proveedor, setProveedor] = useState('openrouter');
  const [config, setConfig] = useState({
    openrouter: {
      apiKey: '',
      model: 'anthropic/claude-3.5-sonnet',
      temperature: 0.7,
      maxTokens: 1000
    },
    groq: {
      apiKey: '',
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 1000
    },
    huggingface: {
      apiKey: '',
      model: 'microsoft/DialoGPT-large',
      temperature: 0.7,
      maxTokens: 1000
    },
    deepseek: {
      apiKey: '',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000
    }
  });
  const [mostrarApiKey, setMostrarApiKey] = useState(false);
  const [probandoConexion, setProbandoConexion] = useState(false);
  const [estadoPrueba, setEstadoPrueba] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const proveedores = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      icon: Globe,
      description: 'Acceso a múltiples modelos de IA con una sola API',
      tipo: 'Pago',
      color: 'blue',
      url: 'https://openrouter.ai',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: Sparkles,
      description: 'Modelo de IA avanzado con opciones gratuitas',
      tipo: 'Freemium',
      color: 'purple',
      url: 'https://platform.deepseek.com',
      apiUrl: 'https://api.deepseek.com/chat/completions'
    },
    {
      id: 'groq',
      name: 'Groq',
      icon: Zap,
      description: 'Inferencia ultra-rápida con tier gratuito generoso',
      tipo: 'Freemium',
      color: 'orange',
      url: 'https://console.groq.com',
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      icon: Bot,
      description: 'Plataforma open source con modelos gratuitos',
      tipo: 'Freemium',
      color: 'yellow',
      url: 'https://huggingface.co',
      apiUrl: 'https://api-inference.huggingface.co/models'
    }
  ];

  const modelosPorProveedor = {
    openrouter: [
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Excelente para redacción profesional',
        recommended: true,
        cost: '$3/1M tokens'
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        description: 'Rápido y eficiente',
        cost: '$0.25/1M tokens'
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Modelo avanzado multimodal',
        cost: '$5/1M tokens'
      },
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Versión económica de GPT-4',
        cost: '$0.15/1M tokens'
      },
      {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1 (Gratis)',
        provider: 'DeepSeek',
        description: 'Modelo gratuito vía OpenRouter',
        cost: 'Gratis',
        free: true
      }
    ],
    deepseek: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'DeepSeek',
        description: 'Modelo principal de DeepSeek',
        recommended: true,
        cost: '$0.14/1M tokens'
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        provider: 'DeepSeek',
        description: 'Modelo especializado en razonamiento',
        cost: '$0.55/1M tokens'
      }
    ],
    groq: [
      {
        id: 'meta-llama/llama-4-scout-17b-16e-instruct',
        name: 'Llama 4 Scout 17B',
        provider: 'Meta',
        description: 'Modelo más reciente de Llama 4 (2025)',
        recommended: true,
        cost: 'Gratis (con límites)',
        free: true
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        provider: 'Meta',
        description: 'Modelo versátil y potente actualizado',
        cost: 'Gratis (con límites)',
        free: true
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        provider: 'Meta',
        description: 'Modelo rápido y eficiente',
        cost: 'Gratis (con límites)',
        free: true
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'Mistral',
        description: 'Modelo de mezcla de expertos',
        cost: 'Gratis (con límites)',
        free: true
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        provider: 'Google',
        description: 'Modelo eficiente de Google',
        cost: 'Gratis (con límites)',
        free: true
      }
    ],
    huggingface: [
      {
        id: 'microsoft/DialoGPT-large',
        name: 'DialoGPT Large',
        provider: 'Microsoft',
        description: 'Modelo conversacional',
        recommended: true,
        cost: 'Gratis (con límites)',
        free: true
      },
      {
        id: 'facebook/blenderbot-400M-distill',
        name: 'BlenderBot',
        provider: 'Meta',
        description: 'Bot conversacional',
        cost: 'Gratis (con límites)',
        free: true
      }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      cargarConfiguracion();
    }
  }, [isOpen]);

  const cargarConfiguracion = () => {
    try {
      const configGuardada = localStorage.getItem('ai_config');
      if (configGuardada) {
        const parsed = JSON.parse(configGuardada);
        setProveedor(parsed.proveedor || 'openrouter');
        setConfig(prev => ({ ...prev, ...parsed.config }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const probarConexion = async () => {
    const currentConfig = config[proveedor];
    if (!currentConfig.apiKey.trim()) {
      setEstadoPrueba({ tipo: 'error', mensaje: 'Por favor, ingresa tu API Key' });
      return;
    }

    setProbandoConexion(true);
    setEstadoPrueba(null);

    try {
      const proveedorInfo = proveedores.find(p => p.id === proveedor);
      let requestBody, headers;

      // Configurar request según el proveedor
      switch (proveedor) {
        case 'openrouter':
          headers = {
            'Authorization': `Bearer ${currentConfig.apiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'CRM Test Connection'
          };
          requestBody = {
            model: currentConfig.model,
            messages: [{ role: 'user', content: 'Responde solo con "OK" para probar la conexión.' }],
            max_tokens: 10,
            temperature: 0.1
          };
          break;

        case 'deepseek':
          headers = {
            'Authorization': `Bearer ${currentConfig.apiKey}`,
            'Content-Type': 'application/json'
          };
          requestBody = {
            model: currentConfig.model,
            messages: [{ role: 'user', content: 'Responde solo con "OK" para probar la conexión.' }],
            max_tokens: 10,
            temperature: 0.1
          };
          break;

        case 'groq':
          headers = {
            'Authorization': `Bearer ${currentConfig.apiKey}`,
            'Content-Type': 'application/json'
          };
          requestBody = {
            model: currentConfig.model,
            messages: [{ role: 'user', content: 'Responde solo con "OK" para probar la conexión.' }],
            max_tokens: 10,
            temperature: 0.1
          };
          break;

        case 'huggingface':
          headers = {
            'Authorization': `Bearer ${currentConfig.apiKey}`,
            'Content-Type': 'application/json'
          };
          requestBody = {
            inputs: 'Responde solo con "OK" para probar la conexión.',
            parameters: {
              max_new_tokens: 10,
              temperature: 0.1
            }
          };
          break;

        default:
          throw new Error('Proveedor no soportado');
      }

      const response = await fetch(proveedorInfo.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setEstadoPrueba({ 
          tipo: 'success', 
          mensaje: '¡Conexión exitosa! La configuración es válida.' 
        });
      } else {
        const errorData = await response.text();
        let errorMessage = `Error de conexión: ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            if (errorJson.error.code === 'model_decommissioned') {
              errorMessage = `El modelo ${currentConfig.model} ha sido descontinuado. Por favor, selecciona un modelo más reciente como Llama 4 Scout o Llama 3.3 70B.`;
            } else if (errorJson.error.message && errorJson.error.message.includes('Insufficient Balance')) {
              errorMessage = 'Balance insuficiente en tu cuenta. Verifica tu plan o espera a que se renueve tu límite gratuito.';
            } else if (errorJson.error.message && errorJson.error.message.includes('rate_limit')) {
              errorMessage = 'Has alcanzado el límite de velocidad. Espera unos minutos antes de intentar nuevamente.';
            } else if (response.status === 401) {
              errorMessage = 'API Key inválida. Verifica que hayas copiado correctamente tu clave de API.';
            } else if (response.status === 402) {
              errorMessage = 'Balance insuficiente en tu cuenta.';
            } else if (response.status === 429) {
              errorMessage = 'Demasiadas solicitudes. Espera unos minutos.';
            } else {
              errorMessage = `Error: ${errorJson.error.message || errorData}`;
            }
          }
        } catch (parseError) {
          // Si no se puede parsear el JSON, usar mensajes por código de estado
          if (response.status === 401) {
            errorMessage = 'API Key inválida. Verifica tu clave de API.';
          } else if (response.status === 402) {
            errorMessage = 'Balance insuficiente en tu cuenta.';
          } else if (response.status === 429) {
            errorMessage = 'Demasiadas solicitudes. Espera unos minutos.';
          } else if (response.status === 500) {
            errorMessage = 'Error del servidor. Intenta nuevamente en unos minutos.';
          } else {
            errorMessage = `Error de conexión: ${response.status} - ${errorData}`;
          }
        }
        
        setEstadoPrueba({ 
          tipo: 'error', 
          mensaje: errorMessage
        });
      }
    } catch (error) {
      setEstadoPrueba({ 
        tipo: 'error', 
        mensaje: `Error de red: ${error.message}` 
      });
    } finally {
      setProbandoConexion(false);
    }
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    try {
      const configCompleta = {
        proveedor,
        config
      };
      localStorage.setItem('ai_config', JSON.stringify(configCompleta));
      
      // También mantener compatibilidad con el sistema anterior
      if (proveedor === 'openrouter') {
        localStorage.setItem('openrouter_config', JSON.stringify(config.openrouter));
      }
      
      setEstadoPrueba({ 
        tipo: 'success', 
        mensaje: '¡Configuración guardada exitosamente!' 
      });
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (error) {
      setEstadoPrueba({ 
        tipo: 'error', 
        mensaje: `Error guardando configuración: ${error.message}` 
      });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarConfig = (campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [proveedor]: {
        ...prev[proveedor],
        [campo]: valor
      }
    }));
  };

  const proveedorActual = proveedores.find(p => p.id === proveedor);
  const configActual = config[proveedor];
  const modelosActuales = modelosPorProveedor[proveedor] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Zap className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Configuración de IA</h2>
                <p className="text-purple-100 text-sm">
                  Configura tu proveedor de IA preferido para el asistente de correos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Selector de Proveedor */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu Proveedor de IA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proveedores.map((prov) => {
                const IconComponent = prov.icon;
                const isSelected = proveedor === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setProveedor(prov.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? `border-${prov.color}-500 bg-${prov.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <IconComponent className={`w-6 h-6 mr-3 mt-1 ${
                        isSelected ? `text-${prov.color}-600` : 'text-gray-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{prov.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            prov.tipo === 'Gratis' ? 'bg-green-100 text-green-800' :
                            prov.tipo === 'Freemium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prov.tipo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{prov.description}</p>
                        <a
                          href={prov.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-xs mt-2 ${
                            isSelected ? `text-${prov.color}-600` : 'text-gray-500'
                          } hover:underline`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Obtener API Key <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuración del Proveedor Seleccionado */}
          <div className="space-y-6">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key de {proveedorActual?.name}
              </label>
              <div className="relative">
                <input
                  type={mostrarApiKey ? 'text' : 'password'}
                  value={configActual?.apiKey || ''}
                  onChange={(e) => actualizarConfig('apiKey', e.target.value)}
                  placeholder={`sk-${proveedor}-...`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setMostrarApiKey(!mostrarApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {mostrarApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tu API key se guarda localmente en tu navegador y nunca se envía a nuestros servidores.
              </p>
            </div>

            {/* Selector de Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo de IA
              </label>
              <select
                value={configActual?.model || ''}
                onChange={(e) => actualizarConfig('model', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {modelosActuales.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.name} {modelo.recommended ? '(Recomendado)' : ''} - {modelo.cost}
                  </option>
                ))}
              </select>
            </div>

            {/* Parámetros Avanzados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura ({configActual?.temperature || 0.7})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={configActual?.temperature || 0.7}
                  onChange={(e) => actualizarConfig('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservador</span>
                  <span>Creativo</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={configActual?.maxTokens || 1000}
                  onChange={(e) => actualizarConfig('maxTokens', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Información de Costos */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">💰 Información de Costos</h4>
              <div className="space-y-1 text-sm text-yellow-700">
                {modelosActuales.filter(m => m.free).length > 0 && (
                  <div>• <strong>Modelos Gratuitos:</strong> {modelosActuales.filter(m => m.free).map(m => m.name).join(', ')}</div>
                )}
                {proveedor === 'openrouter' && (
                  <div>• <strong>OpenRouter:</strong> Pago por uso, desde $0.15/1M tokens</div>
                )}
                {proveedor === 'groq' && (
                  <div>• <strong>Groq:</strong> Tier gratuito generoso, luego pago por uso</div>
                )}
                {proveedor === 'huggingface' && (
                  <div>• <strong>Hugging Face:</strong> Tier gratuito con límites, PRO $10/mes</div>
                )}
                {proveedor === 'deepseek' && (
                  <div>• <strong>DeepSeek:</strong> Muy económico, desde $0.14/1M tokens</div>
                )}
              </div>
            </div>

            {/* Estado de la Prueba */}
            {estadoPrueba && (
              <div className={`p-4 rounded-lg flex items-center ${
                estadoPrueba.tipo === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {estadoPrueba.tipo === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="text-sm">{estadoPrueba.mensaje}</span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={probarConexion}
                disabled={probandoConexion || !configActual?.apiKey}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {probandoConexion ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {probandoConexion ? 'Probando...' : 'Probar Conexión'}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarConfiguracion}
                  disabled={guardando || !configActual?.apiKey}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {guardando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {guardando ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionIAModal;

