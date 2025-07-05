import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Zap, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const ConfiguracionOpenRouterModal = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({
    apiKey: '',
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.7,
    maxTokens: 1000
  });
  const [mostrarApiKey, setMostrarApiKey] = useState(false);
  const [probandoConexion, setProbandoConexion] = useState(false);
  const [estadoPrueba, setEstadoPrueba] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const modelosDisponibles = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Excelente para redacción profesional y análisis detallado',
      recommended: true
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Rápido y eficiente para tareas simples'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Modelo avanzado de OpenAI con capacidades multimodales'
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      description: 'Versión más rápida y económica de GPT-4'
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      provider: 'Meta',
      description: 'Modelo open source potente para diversas tareas'
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      provider: 'Google',
      description: 'Modelo avanzado de Google con gran contexto'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      cargarConfiguracion();
    }
  }, [isOpen]);

  const cargarConfiguracion = () => {
    try {
      const configGuardada = localStorage.getItem('openrouter_config');
      if (configGuardada) {
        setConfig(JSON.parse(configGuardada));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const probarConexion = async () => {
    if (!config.apiKey.trim()) {
      setEstadoPrueba({ tipo: 'error', mensaje: 'Por favor, ingresa tu API Key' });
      return;
    }

    setProbandoConexion(true);
    setEstadoPrueba(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'CRM Test Connection'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: 'Responde solo con "OK" para probar la conexión.'
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0]) {
          setEstadoPrueba({ 
            tipo: 'exito', 
            mensaje: 'Conexión exitosa. La configuración es válida.' 
          });
        } else {
          setEstadoPrueba({ 
            tipo: 'error', 
            mensaje: 'Respuesta inesperada del servidor.' 
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setEstadoPrueba({ 
          tipo: 'error', 
          mensaje: `Error ${response.status}: ${errorData.error?.message || 'Verifica tu API Key y modelo seleccionado'}` 
        });
      }
    } catch (error) {
      setEstadoPrueba({ 
        tipo: 'error', 
        mensaje: `Error de conexión: ${error.message}` 
      });
    } finally {
      setProbandoConexion(false);
    }
  };

  const guardarConfiguracion = async () => {
    if (!config.apiKey.trim()) {
      setEstadoPrueba({ tipo: 'error', mensaje: 'La API Key es obligatoria' });
      return;
    }

    setGuardando(true);
    try {
      localStorage.setItem('openrouter_config', JSON.stringify(config));
      
      if (onSave) {
        await onSave(config);
      }
      
      setEstadoPrueba({ 
        tipo: 'exito', 
        mensaje: 'Configuración guardada exitosamente' 
      });
      
      setTimeout(() => {
        onClose();
      }, 1500);
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
    setConfig(prev => ({ ...prev, [campo]: valor }));
    setEstadoPrueba(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Configuración de IA</h2>
                <p className="text-purple-100">Configura OpenRouter para el asistente de correos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Información de OpenRouter */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">¿Qué es OpenRouter?</h3>
                <p className="text-slate-600 mb-3">
                  OpenRouter te permite acceder a múltiples modelos de IA (Claude, GPT-4, Llama, etc.) 
                  con una sola API key. Es más económico que usar las APIs directas y te da flexibilidad 
                  para elegir el mejor modelo para cada tarea.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://openrouter.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Crear cuenta en OpenRouter
                  </a>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                  >
                    Obtener API Key
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Configuración */}
            <div className="space-y-6">
              
              {/* API Key */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">API Key de OpenRouter</h3>
                
                <div className="relative">
                  <input
                    type={mostrarApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => actualizarConfig('apiKey', e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarApiKey(!mostrarApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 mt-2">
                  Tu API key se guarda localmente en tu navegador y nunca se envía a nuestros servidores.
                </p>
              </div>

              {/* Modelo */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Modelo de IA</h3>
                
                <div className="space-y-3">
                  {modelosDisponibles.map((modelo) => (
                    <div
                      key={modelo.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        config.model === modelo.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => actualizarConfig('model', modelo.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{modelo.name}</span>
                            {modelo.recommended && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{modelo.provider}</div>
                          <div className="text-sm text-slate-500 mt-1">{modelo.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          config.model === modelo.id
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-slate-300'
                        }`}>
                          {config.model === modelo.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración Avanzada */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Configuración Avanzada</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperatura ({config.temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => actualizarConfig('temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Más conservador</span>
                      <span>Más creativo</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Máximo de tokens
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={config.maxTokens}
                      onChange={(e) => actualizarConfig('maxTokens', parseInt(e.target.value))}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Controla la longitud máxima de las respuestas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prueba y Estado */}
            <div className="space-y-6">
              
              {/* Prueba de Conexión */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Prueba de Conexión</h3>
                
                <button
                  onClick={probarConexion}
                  disabled={probandoConexion || !config.apiKey.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {probandoConexion ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Probando conexión...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Probar Conexión
                    </>
                  )}
                </button>

                {estadoPrueba && (
                  <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                    estadoPrueba.tipo === 'exito' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {estadoPrueba.tipo === 'exito' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        estadoPrueba.tipo === 'exito' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {estadoPrueba.tipo === 'exito' ? '¡Conexión exitosa!' : 'Error de conexión'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        estadoPrueba.tipo === 'exito' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {estadoPrueba.mensaje}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de Costos */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">💰 Información de Costos</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>• <strong>Claude 3.5 Sonnet:</strong> ~$3 por 1M tokens (recomendado)</p>
                  <p>• <strong>GPT-4o:</strong> ~$5 por 1M tokens</p>
                  <p>• <strong>Claude 3 Haiku:</strong> ~$0.25 por 1M tokens (económico)</p>
                  <p>• <strong>Llama 3.1 70B:</strong> ~$0.88 por 1M tokens (open source)</p>
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  Los costos son aproximados. Un correo típico usa ~200-500 tokens.
                </p>
              </div>

              {/* Consejos */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">💡 Consejos</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• <strong>Claude 3.5 Sonnet</strong> es excelente para correos profesionales</li>
                  <li>• <strong>GPT-4o Mini</strong> es más rápido para tareas simples</li>
                  <li>• Temperatura baja (0.3-0.5) para correos formales</li>
                  <li>• Temperatura alta (0.7-0.9) para correos creativos</li>
                  <li>• Puedes cambiar de modelo en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando || !config.apiKey.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionOpenRouterModal;

