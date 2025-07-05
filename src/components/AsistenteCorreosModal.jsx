import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Mail, 
  Sparkles, 
  MessageSquare, 
  User,
  ChevronDown,
  FileText,
  DollarSign,
  Clock,
  Bot,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import * as db from '../lib/supabase';
import { getAIConfig, generateEmailWithAI, validateAIConfig, getProviderInfo } from '../lib/aiProviders';

const AsistenteCorreosModal = ({ isOpen, onClose, preselectedContact = null, contextType = null }) => {
  const [pensamientos, setPensamientos] = useState('');
  const [tono, setTono] = useState('profesional');
  const [correoContexto, setCorreoContexto] = useState('');
  const [correoGenerado, setCorreoGenerado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mostrarContexto, setMostrarContexto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(preselectedContact);
  const [contactos, setContactos] = useState([]);
  const [mostrarContactos, setMostrarContactos] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');

  const tonos = [
    { value: 'profesional', label: 'Profesional', description: 'Claro y apropiado para negocios' },
    { value: 'cálido', label: 'Cálido', description: 'Amigable y cercano' },
    { value: 'conciso', label: 'Conciso', description: 'Breve y directo al punto' },
    { value: 'formal', label: 'Formal', description: 'Tradicional y respetuoso' },
    { value: 'casual', label: 'Casual', description: 'Relajado y conversacional' },
    { value: 'persuasivo', label: 'Persuasivo', description: 'Convincente y atractivo' }
  ];

  const plantillasPresupuesto = [
    {
      value: 'envio_presupuesto',
      label: 'Envío de Presupuesto',
      template: 'Necesito enviar un presupuesto al cliente para [describir el proyecto/servicio]. El presupuesto incluye [detalles principales]. Quiero que el cliente entienda el valor de nuestra propuesta.'
    },
    {
      value: 'seguimiento_presupuesto',
      label: 'Seguimiento de Presupuesto',
      template: 'Quiero hacer seguimiento del presupuesto que envié hace [tiempo]. Necesito saber si tienen preguntas y motivarlos a tomar una decisión.'
    },
    {
      value: 'aclaracion_presupuesto',
      label: 'Aclaración de Presupuesto',
      template: 'El cliente tiene dudas sobre [aspecto específico del presupuesto]. Necesito aclarar [puntos específicos] y resolver sus inquietudes.'
    },
    {
      value: 'negociacion_presupuesto',
      label: 'Negociación de Presupuesto',
      template: 'El cliente quiere negociar el precio del presupuesto. Necesito [mantener el precio/ofrecer alternativas/explicar el valor] de manera diplomática.'
    },
    {
      value: 'cierre_presupuesto',
      label: 'Cierre de Presupuesto',
      template: 'El cliente está interesado en el presupuesto. Quiero cerrar la venta explicando los próximos pasos y creando urgencia de manera profesional.'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      cargarContactos();
      if (contextType === 'presupuesto') {
        setPlantillaSeleccionada('envio_presupuesto');
        aplicarPlantilla('envio_presupuesto');
      }
    }
  }, [isOpen, contextType]);

  useEffect(() => {
    if (preselectedContact) {
      setContactoSeleccionado(preselectedContact);
    }
  }, [preselectedContact]);

  const cargarContactos = async () => {
    try {
      const [clientesResult, leadsResult] = await Promise.all([
        db.getClientes(),
        db.getLeads()
      ]);

      const todosContactos = [
        ...clientesResult.data.map(c => ({ ...c, tipo: 'cliente' })),
        ...leadsResult.data.map(l => ({ ...l, tipo: 'lead' }))
      ];

      setContactos(todosContactos);
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  };

  const aplicarPlantilla = (plantillaValue) => {
    const plantilla = plantillasPresupuesto.find(p => p.value === plantillaValue);
    if (plantilla) {
      setPensamientos(plantilla.template);
    }
  };

    const generarCorreo = async () => {
    if (!pensamientos.trim()) return;
    
    // Verificar configuración de IA
    const aiConfig = getAIConfig();
    const validation = validateAIConfig(aiConfig);
    
    if (!validation.valid) {
      alert(`Error de configuración: ${validation.message}\n\nPor favor, configura tu proveedor de IA en Seguridad → Configuración de IA.`);
      return;
    }

    setIsLoading(true);
    
    try {
      const contextoParte = correoContexto.trim() 
        ? `\n\nContexto - Estoy respondiendo a este correo:\n"${correoContexto}"\n\n`
        : '';
      
      const contactoParte = contactoSeleccionado 
        ? `\n\nDestinatario: ${contactoSeleccionado.nombre} (${contactoSeleccionado.empresa || contactoSeleccionado.tipo})\n`
        : '';
      
      const prompt = `Eres un experto redactor de correos electrónicos comerciales. Transforma los siguientes pensamientos en un correo electrónico bien estructurado con un tono ${tono}.

Pensamientos: "${pensamientos}"${contextoParte}${contactoParte}

Instrucciones:
- Escribe un correo electrónico completo y profesional
- Usa un tono ${tono} en todo el mensaje
- Hazlo claro, atractivo y bien estructurado
- Asegúrate de seguir la etiqueta de correo electrónico apropiada
- Incluye un asunto sugerido al inicio
- Enfócate en comunicación comercial y de negocios
- Si es sobre presupuestos, destaca el valor y beneficios
- Responde SOLO con el contenido del correo electrónico. No incluyas explicaciones adicionales.`;

      const correoGenerado = await generateEmailWithAI(prompt, aiConfig);
      setCorreoGenerado(correoGenerado);
      
    } catch (error) {
      console.error('Error generando correo:', error);
      
      let errorMessage = 'Lo siento, hubo un error generando tu correo.';
      
      if (error.message.includes('API Key')) {
        errorMessage = 'Error de autenticación. Verifica tu API Key en la configuración.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'Has alcanzado el límite de tu plan. Considera cambiar de proveedor o esperar.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setCorreoGenerado(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetearFormulario = () => {
    setPensamientos('');
    setCorreoContexto('');
    setCorreoGenerado('');
    setPlantillaSeleccionada('');
    setTono('profesional');
    setMostrarContexto(false);
    setCopiado(false);
    
    // Si no hay contacto preseleccionado, también limpiar la selección
    if (!preselectedContact) {
      setContactoSeleccionado(null);
    }
  };

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(correoGenerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('Error copiando:', error);
    }
  };

  const manejarTeclaPresionada = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generarCorreo();
    }
  };

  const seleccionarContacto = (contacto) => {
    setContactoSeleccionado(contacto);
    setMostrarContactos(false);
  };

  if (!isOpen) return null;

  // Obtener información del proveedor actual
  const currentAIConfig = getAIConfig();
  const currentProvider = currentAIConfig ? getProviderInfo(currentAIConfig.proveedor) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Asistente de Correos</h2>
                <div className="flex items-center gap-2">
                  <p className="text-blue-100">Transforma tus ideas en correos profesionales</p>
                  {currentProvider && (
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                      <Bot className="w-3 h-3" />
                      <span className="text-xs font-medium">{currentProvider.name}</span>
                    </div>
                  )}
                  {!currentProvider && (
                    <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Sin configurar</span>
                    </div>
                  )}
                </div>
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
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Input Section */}
            <div className="space-y-6">
              
              {/* Plantillas de Presupuesto */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Plantillas de Presupuesto</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {plantillasPresupuesto.map((plantilla) => (
                    <button
                      key={plantilla.value}
                      onClick={() => {
                        setPlantillaSeleccionada(plantilla.value);
                        aplicarPlantilla(plantilla.value);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                        plantillaSeleccionada === plantilla.value
                          ? 'border-green-500 bg-green-100 shadow-md'
                          : 'border-green-200 bg-white hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="font-medium text-slate-800 text-sm">{plantilla.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selección de Contacto */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Destinatario</h3>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setMostrarContactos(!mostrarContactos)}
                    className="w-full p-3 border border-slate-300 rounded-lg bg-white flex items-center justify-between hover:border-slate-400 transition-colors"
                  >
                    <span className="text-slate-700">
                      {contactoSeleccionado 
                        ? `${contactoSeleccionado.nombre} (${contactoSeleccionado.empresa || contactoSeleccionado.tipo})`
                        : 'Seleccionar contacto...'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                  
                  {mostrarContactos && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {contactos.map((contacto) => (
                        <button
                          key={`${contacto.tipo}-${contacto.id}`}
                          onClick={() => seleccionarContacto(contacto)}
                          className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-800">{contacto.nombre}</div>
                          <div className="text-sm text-slate-600">
                            {contacto.empresa || contacto.tipo} • {contacto.email}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tus Pensamientos */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Tus Pensamientos</h3>
                </div>
                
                <textarea
                  value={pensamientos}
                  onChange={(e) => setPensamientos(e.target.value)}
                  onKeyDown={manejarTeclaPresionada}
                  placeholder="Escribe lo que quieres comunicar... No te preocupes por la gramática o estructura, solo plasma tus ideas."
                  className="w-full h-32 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
                
                <div className="mt-3 text-sm text-slate-500">
                  💡 Consejo: Presiona Cmd/Ctrl + Enter para generar tu correo
                </div>
              </div>

              {/* Selección de Tono */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Tono del Correo</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {tonos.map((tonoOpcion) => (
                    <button
                      key={tonoOpcion.value}
                      onClick={() => setTono(tonoOpcion.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        tono === tonoOpcion.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-slate-800 text-sm">{tonoOpcion.label}</div>
                      <div className="text-xs text-slate-600 mt-1">{tonoOpcion.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contexto Opcional */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Contexto (Opcional)</h3>
                  </div>
                  <button
                    onClick={() => setMostrarContexto(!mostrarContexto)}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                  >
                    {mostrarContexto ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                
                {mostrarContexto && (
                  <>
                    <p className="text-slate-600 mb-3 text-sm">
                      Pega el correo al que estás respondiendo para mejor contexto
                    </p>
                    <textarea
                      value={correoContexto}
                      onChange={(e) => setCorreoContexto(e.target.value)}
                      placeholder="Pega el correo original aquí..."
                      className="w-full h-24 p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 text-sm"
                    />
                  </>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button
                  onClick={generarCorreo}
                  disabled={isLoading || !pensamientos.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creando tu correo...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generar Correo
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetearFormulario}
                  disabled={isLoading}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  title="Limpiar todos los campos y empezar de nuevo"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetear
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-h-96">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Correo Generado</h3>
                  </div>
                  
                  {correoGenerado && (
                    <button
                      onClick={copiarAlPortapapeles}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-medium text-sm"
                    >
                      {copiado ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {correoGenerado ? (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">
                      {correoGenerado}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Mail className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-base">Tu correo profesional aparecerá aquí</p>
                    <p className="text-sm mt-2">Ingresa tus pensamientos y selecciona un tono para comenzar</p>
                  </div>
                )}
              </div>

              {/* Consejos */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">✨ Consejos Pro</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Sé específico sobre lo que quieres lograr</li>
                  <li>• Incluye detalles clave aunque estén mal escritos</li>
                  <li>• Prueba diferentes tonos para ver qué funciona mejor</li>
                  <li>• Agrega contexto para respuestas más personalizadas</li>
                  <li>• Para presupuestos, menciona valores y beneficios específicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsistenteCorreosModal;

