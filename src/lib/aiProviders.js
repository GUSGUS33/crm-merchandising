// Utilidades para múltiples proveedores de IA

export const getAIConfig = () => {
  try {
    const config = localStorage.getItem('ai_config');
    if (config) {
      return JSON.parse(config);
    }
    
    // Fallback a configuración antigua de OpenRouter
    const oldConfig = localStorage.getItem('openrouter_config');
    if (oldConfig) {
      const parsed = JSON.parse(oldConfig);
      return {
        proveedor: 'openrouter',
        config: {
          openrouter: parsed
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error leyendo configuración de IA:', error);
    return null;
  }
};

export const generateEmailWithAI = async (prompt, config) => {
  const { proveedor, config: providerConfigs } = config;
  const providerConfig = providerConfigs[proveedor];
  
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error('Configuración de IA no encontrada. Por favor, configura tu proveedor de IA en Seguridad.');
  }

  switch (proveedor) {
    case 'openrouter':
      return await generateWithOpenRouter(prompt, providerConfig);
    case 'deepseek':
      return await generateWithDeepSeek(prompt, providerConfig);
    case 'groq':
      return await generateWithGroq(prompt, providerConfig);
    case 'huggingface':
      return await generateWithHuggingFace(prompt, providerConfig);
    default:
      throw new Error(`Proveedor ${proveedor} no soportado`);
  }
};

const generateWithOpenRouter = async (prompt, config) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'CRM Email Assistant'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto redactor de correos electrónicos comerciales. Siempre respondes en español y generas correos profesionales y bien estructurados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error de OpenRouter: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generateWithDeepSeek = async (prompt, config) => {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto redactor de correos electrónicos comerciales. Siempre respondes en español y generas correos profesionales y bien estructurados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error de DeepSeek: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generateWithGroq = async (prompt, config) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto redactor de correos electrónicos comerciales. Siempre respondes en español y generas correos profesionales y bien estructurados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    let errorMessage = `Error de Groq: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorData);
      if (errorJson.error) {
        if (errorJson.error.code === 'model_decommissioned') {
          errorMessage = `El modelo ${config.model} ha sido descontinuado. Por favor, selecciona un modelo más reciente como Llama 4 Scout o Llama 3.3 70B en la configuración.`;
        } else if (errorJson.error.message.includes('Insufficient Balance')) {
          errorMessage = 'Balance insuficiente en tu cuenta de Groq. Verifica tu plan o espera a que se renueve tu límite gratuito.';
        } else if (errorJson.error.message.includes('rate_limit')) {
          errorMessage = 'Has alcanzado el límite de velocidad de Groq. Espera unos minutos antes de intentar nuevamente.';
        } else {
          errorMessage = `Error de Groq: ${errorJson.error.message}`;
        }
      }
    } catch (parseError) {
      // Si no se puede parsear el JSON, usar el mensaje genérico
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generateWithHuggingFace = async (prompt, config) => {
  // Para Hugging Face, usamos el endpoint de inference
  const modelUrl = `https://api-inference.huggingface.co/models/${config.model}`;
  
  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: `Sistema: Eres un experto redactor de correos electrónicos comerciales. Siempre respondes en español y generas correos profesionales y bien estructurados.\n\nUsuario: ${prompt}\n\nAsistente:`,
      parameters: {
        max_new_tokens: config.maxTokens || 1000,
        temperature: config.temperature || 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error de Hugging Face: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  // Hugging Face puede devolver diferentes formatos
  if (Array.isArray(data) && data[0]) {
    return data[0].generated_text || data[0].text || '';
  } else if (data.generated_text) {
    return data.generated_text;
  } else {
    throw new Error('Respuesta inesperada de Hugging Face');
  }
};

export const getProviderInfo = (providerId) => {
  const providers = {
    openrouter: {
      name: 'OpenRouter',
      description: 'Acceso a múltiples modelos de IA',
      website: 'https://openrouter.ai',
      type: 'Pago'
    },
    deepseek: {
      name: 'DeepSeek',
      description: 'Modelo avanzado con opciones económicas',
      website: 'https://platform.deepseek.com',
      type: 'Freemium'
    },
    groq: {
      name: 'Groq',
      description: 'Inferencia ultra-rápida',
      website: 'https://console.groq.com',
      type: 'Freemium'
    },
    huggingface: {
      name: 'Hugging Face',
      description: 'Plataforma open source',
      website: 'https://huggingface.co',
      type: 'Freemium'
    }
  };
  
  return providers[providerId] || null;
};

export const validateAIConfig = (config) => {
  if (!config) {
    return { valid: false, message: 'No hay configuración de IA' };
  }
  
  if (!config.proveedor) {
    return { valid: false, message: 'No se ha seleccionado un proveedor' };
  }
  
  const providerConfig = config.config?.[config.proveedor];
  if (!providerConfig) {
    return { valid: false, message: 'Configuración del proveedor no encontrada' };
  }
  
  if (!providerConfig.apiKey) {
    return { valid: false, message: 'API Key no configurada' };
  }
  
  if (!providerConfig.model) {
    return { valid: false, message: 'Modelo no seleccionado' };
  }
  
  return { valid: true, message: 'Configuración válida' };
};

