// Servicio de WhatsApp Business API
import { SecurityLogger } from './security'

// Configuración por defecto
const DEFAULT_CONFIG = {
  accessToken: '',
  phoneNumberId: '',
  businessAccountId: '',
  webhookVerifyToken: '',
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com'
}

// Estados de configuración
const CONFIG_STATUS = {
  NOT_CONFIGURED: 'not_configured',
  CONFIGURED: 'configured',
  TESTING: 'testing',
  ACTIVE: 'active',
  ERROR: 'error'
}

// Tipos de mensajes
const MESSAGE_TYPES = {
  TEXT: 'text',
  TEMPLATE: 'template',
  INTERACTIVE: 'interactive',
  DOCUMENT: 'document',
  IMAGE: 'image'
}

// Templates predefinidos
const MESSAGE_TEMPLATES = {
  presupuesto_enviado: {
    name: 'presupuesto_enviado',
    language: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{cliente_nombre}}' },
          { type: 'text', text: '{{presupuesto_numero}}' },
          { type: 'text', text: '{{empresa_nombre}}' }
        ]
      }
    ]
  },
  recordatorio_reunion: {
    name: 'recordatorio_reunion',
    language: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{cliente_nombre}}' },
          { type: 'text', text: '{{fecha_reunion}}' },
          { type: 'text', text: '{{hora_reunion}}' }
        ]
      }
    ]
  },
  seguimiento_lead: {
    name: 'seguimiento_lead',
    language: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{lead_nombre}}' },
          { type: 'text', text: '{{empresa_nombre}}' }
        ]
      }
    ]
  }
}

/**
 * Servicio principal de WhatsApp Business API
 */
export class WhatsAppService {
  
  constructor() {
    this.config = this.loadConfig()
    this.isSimulationMode = !this.config.accessToken
  }

  /**
   * Carga la configuración desde localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem('whatsapp_config')
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG
    } catch (error) {
      console.error('Error cargando configuración de WhatsApp:', error)
      return DEFAULT_CONFIG
    }
  }

  /**
   * Guarda la configuración en localStorage
   */
  saveConfig(config) {
    try {
      this.config = { ...this.config, ...config }
      localStorage.setItem('whatsapp_config', JSON.stringify(this.config))
      
      // Log de seguridad
      SecurityLogger.log('whatsapp_config_updated', {
        hasToken: !!config.accessToken,
        hasPhoneId: !!config.phoneNumberId
      }, null, 'info')
      
      return true
    } catch (error) {
      console.error('Error guardando configuración de WhatsApp:', error)
      return false
    }
  }

  /**
   * Actualiza la configuración de WhatsApp
   */
  updateConfig(newConfig) {
    try {
      // Mapear los campos del modal a la configuración interna
      const mappedConfig = {
        accessToken: newConfig.access_token,
        phoneNumberId: newConfig.phone_number_id,
        businessAccountId: newConfig.waba_id,
        webhookVerifyToken: newConfig.webhook_verify_token,
        webhookUrl: newConfig.webhook_url,
        appId: newConfig.app_id,
        appSecret: newConfig.app_secret
      }

      // Guardar la configuración
      const success = this.saveConfig(mappedConfig)
      
      if (success) {
        // Actualizar el modo de simulación
        this.isSimulationMode = !mappedConfig.accessToken
        
        // Log de seguridad
        SecurityLogger.log('whatsapp_config_updated', {
          configured: this.isConfigured(),
          simulationMode: this.isSimulationMode
        }, null, 'info')
      }
      
      return success
    } catch (error) {
      console.error('Error actualizando configuración de WhatsApp:', error)
      SecurityLogger.log('whatsapp_config_update_error', {
        error: error.message
      }, null, 'error')
      return false
    }
  }

  /**
   * Verifica si WhatsApp está configurado
   */
  isConfigured() {
    return !!(this.config.accessToken && this.config.phoneNumberId)
  }

  /**
   * Obtiene el estado de la configuración
   */
  getConfigStatus() {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      return CONFIG_STATUS.NOT_CONFIGURED
    }
    
    // En modo simulación, siempre devolver configurado
    if (this.isSimulationMode) {
      return CONFIG_STATUS.CONFIGURED
    }
    
    return CONFIG_STATUS.CONFIGURED
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(to, message, context = {}) {
    try {
      // Log de la acción
      SecurityLogger.log('whatsapp_message_sent', {
        to: to.substring(0, 5) + '***', // Ocultar número completo
        type: 'text',
        length: message.length,
        context
      }, context.userId, 'info')

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateMessageSend(to, message, MESSAGE_TYPES.TEXT)
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial
      this.saveMessageToHistory(to, message, 'outbound', MESSAGE_TYPES.TEXT, context)
      
      return response
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error)
      SecurityLogger.log('whatsapp_message_error', {
        error: error.message,
        to: to.substring(0, 5) + '***'
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Envía un mensaje usando template
   */
  async sendTemplateMessage(to, templateName, parameters = [], context = {}) {
    try {
      SecurityLogger.log('whatsapp_template_sent', {
        to: to.substring(0, 5) + '***',
        template: templateName,
        parameters: parameters.length
      }, context.userId, 'info')

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateMessageSend(to, `Template: ${templateName}`, MESSAGE_TYPES.TEMPLATE)
      }

      const template = MESSAGE_TEMPLATES[templateName]
      if (!template) {
        throw new Error(`Template ${templateName} no encontrado`)
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: template.components.map(component => ({
            ...component,
            parameters: parameters
          }))
        }
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial
      this.saveMessageToHistory(to, `Template: ${templateName}`, 'outbound', MESSAGE_TYPES.TEMPLATE, context)
      
      return response
    } catch (error) {
      console.error('Error enviando template de WhatsApp:', error)
      SecurityLogger.log('whatsapp_template_error', {
        error: error.message,
        template: templateName
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Envía un documento
   */
  async sendDocument(to, documentUrl, filename, caption = '', context = {}) {
    try {
      SecurityLogger.log('whatsapp_document_sent', {
        to: to.substring(0, 5) + '***',
        filename,
        hasCaption: !!caption
      }, context.userId, 'info')

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateMessageSend(to, `Documento: ${filename}`, MESSAGE_TYPES.DOCUMENT)
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'document',
        document: {
          link: documentUrl,
          filename: filename,
          caption: caption
        }
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial
      this.saveMessageToHistory(to, `Documento: ${filename}`, 'outbound', MESSAGE_TYPES.DOCUMENT, context)
      
      return response
    } catch (error) {
      console.error('Error enviando documento de WhatsApp:', error)
      SecurityLogger.log('whatsapp_document_error', {
        error: error.message,
        filename
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Envía una imagen
   */
  async sendImage(to, imageUrl, caption = '', context = {}) {
    try {
      SecurityLogger.log('whatsapp_image_sent', {
        to: to.substring(0, 5) + '***',
        hasCaption: !!caption
      }, context.userId, 'info')

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateMessageSend(to, `Imagen: ${caption || 'Sin descripción'}`, MESSAGE_TYPES.IMAGE)
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption
        }
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial
      this.saveMessageToHistory(to, `Imagen: ${caption || 'Sin descripción'}`, 'outbound', MESSAGE_TYPES.IMAGE, context)
      
      return response
    } catch (error) {
      console.error('Error enviando imagen de WhatsApp:', error)
      SecurityLogger.log('whatsapp_image_error', {
        error: error.message
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Envía un archivo de audio
   */
  async sendAudio(to, audioUrl, context = {}) {
    try {
      SecurityLogger.log('whatsapp_audio_sent', {
        to: to.substring(0, 5) + '***'
      }, context.userId, 'info')

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateMessageSend(to, 'Audio', 'audio')
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'audio',
        audio: {
          link: audioUrl
        }
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial
      this.saveMessageToHistory(to, 'Audio', 'outbound', 'audio', context)
      
      return response
    } catch (error) {
      console.error('Error enviando audio de WhatsApp:', error)
      SecurityLogger.log('whatsapp_audio_error', {
        error: error.message
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Envía un archivo genérico (detecta el tipo automáticamente)
   */
  async sendFileMessage(to, fileData, message = '', context = {}) {
    try {
      const { name, size, type, url } = fileData
      
      SecurityLogger.log('whatsapp_file_sent', {
        to: to.substring(0, 5) + '***',
        fileName: name,
        fileType: type,
        fileSize: size
      }, context.userId, 'info')

      // Determinar el tipo de mensaje basado en el tipo de archivo
      let messageType = MESSAGE_TYPES.DOCUMENT
      let payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'document',
        document: {
          link: url,
          filename: name,
          caption: message
        }
      }

      // Ajustar payload según el tipo de archivo
      if (type.startsWith('image/')) {
        messageType = MESSAGE_TYPES.IMAGE
        payload = {
          messaging_product: 'whatsapp',
          to: to,
          type: 'image',
          image: {
            link: url,
            caption: message
          }
        }
      } else if (type.startsWith('audio/')) {
        messageType = 'audio'
        payload = {
          messaging_product: 'whatsapp',
          to: to,
          type: 'audio',
          audio: {
            link: url
          }
        }
      } else if (type.startsWith('video/')) {
        messageType = 'video'
        payload = {
          messaging_product: 'whatsapp',
          to: to,
          type: 'video',
          video: {
            link: url,
            caption: message
          }
        }
      }

      if (this.isSimulationMode || !this.isConfigured()) {
        return this.simulateFileMessageSend(to, fileData, message, messageType)
      }

      const response = await this.makeApiCall('messages', payload)
      
      // Guardar en historial con metadata del archivo
      this.saveMessageToHistory(to, message || `📎 ${name}`, 'outbound', messageType, {
        ...context,
        fileData: fileData
      })
      
      return response
    } catch (error) {
      console.error('Error enviando archivo de WhatsApp:', error)
      SecurityLogger.log('whatsapp_file_error', {
        error: error.message,
        fileName: fileData.name
      }, context.userId, 'error')
      throw error
    }
  }

  /**
   * Simula el envío de un archivo (para testing sin API)
   */
  simulateFileMessageSend(to, fileData, message, type) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          messaging_product: 'whatsapp',
          contacts: [{
            input: to,
            wa_id: to
          }],
          messages: [{
            id: `sim_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message_status: 'sent'
          }],
          simulation: true
        }
        
        // Guardar en historial con metadata del archivo
        this.saveMessageToHistory(to, message || `📎 ${fileData.name}`, 'outbound', type, { 
          simulation: true,
          fileData: fileData
        })
        
        resolve(response)
      }, 1000 + Math.random() * 2000) // Simular latencia variable
    })
  }

  /**
   * Simula el envío de un mensaje (para testing sin API)
   */
  simulateMessageSend(to, message, type) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          messaging_product: 'whatsapp',
          contacts: [{
            input: to,
            wa_id: to
          }],
          messages: [{
            id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message_status: 'sent'
          }],
          simulation: true
        }
        
        // Guardar en historial
        this.saveMessageToHistory(to, message, 'outbound', type, { simulation: true })
        
        resolve(response)
      }, 500) // Simular latencia de red
    })
  }

  /**
   * Realiza una llamada a la API de WhatsApp
   */
  async makeApiCall(endpoint, payload) {
    const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`WhatsApp API Error: ${error.error?.message || 'Unknown error'}`)
    }

    return await response.json()
  }

  /**
   * Guarda un mensaje en el historial
   */
  saveMessageToHistory(phoneNumber, message, direction, type, context = {}) {
    try {
      const historyKey = 'whatsapp_message_history'
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
      
      const messageEntry = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber,
        message,
        direction, // 'inbound' o 'outbound'
        type,
        timestamp: new Date().toISOString(),
        status: 'sent',
        context,
        simulation: this.isSimulationMode
      }
      
      history.push(messageEntry)
      
      // Mantener solo los últimos 1000 mensajes
      if (history.length > 1000) {
        history.splice(0, history.length - 1000)
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history))
      
      return messageEntry
    } catch (error) {
      console.error('Error guardando mensaje en historial:', error)
    }
  }

  /**
   * Obtiene el historial de mensajes
   */
  getMessageHistory(phoneNumber = null, limit = 50) {
    try {
      // Primero intentar con el nuevo formato (whatsapp_messages)
      const messagesData = JSON.parse(localStorage.getItem('whatsapp_messages') || '{}')
      
      if (phoneNumber && messagesData[phoneNumber]) {
        // Retornar mensajes específicos del número de teléfono
        return messagesData[phoneNumber]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-limit) // Últimos mensajes
      }
      
      // Si no hay número específico, retornar todos los mensajes
      if (!phoneNumber) {
        const allMessages = []
        Object.keys(messagesData).forEach(phone => {
          allMessages.push(...messagesData[phone])
        })
        return allMessages
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit)
      }
      
      // Fallback al formato anterior
      const history = JSON.parse(localStorage.getItem('whatsapp_message_history') || '[]')
      
      let filtered = history
      if (phoneNumber) {
        filtered = history.filter(msg => msg.phoneNumber === phoneNumber)
      }
      
      // Ordenar por timestamp descendente y limitar
      return filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
    } catch (error) {
      console.error('Error obteniendo historial de mensajes:', error)
      return []
    }
  }

  /**
   * Procesa un webhook entrante
   */
  processIncomingWebhook(webhookData) {
    try {
      SecurityLogger.log('whatsapp_webhook_received', {
        hasEntry: !!webhookData.entry,
        entryCount: webhookData.entry?.length || 0
      }, null, 'info')

      if (!webhookData.entry || !webhookData.entry.length) {
        return { success: false, error: 'No entry data' }
      }

      webhookData.entry.forEach(entry => {
        if (entry.changes) {
          entry.changes.forEach(change => {
            if (change.field === 'messages' && change.value.messages) {
              change.value.messages.forEach(message => {
                this.processIncomingMessage(message, change.value)
              })
            }
          })
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Error procesando webhook:', error)
      SecurityLogger.log('whatsapp_webhook_error', {
        error: error.message
      }, null, 'error')
      return { success: false, error: error.message }
    }
  }

  /**
   * Procesa un mensaje entrante
   */
  processIncomingMessage(message, value) {
    try {
      const phoneNumber = message.from
      const messageText = message.text?.body || '[Mensaje no de texto]'
      const messageType = message.type || 'unknown'
      
      // Guardar en historial
      this.saveMessageToHistory(phoneNumber, messageText, 'inbound', messageType, {
        messageId: message.id,
        timestamp: message.timestamp
      })

      // Aquí se pueden agregar reglas de respuesta automática
      this.handleAutoResponse(phoneNumber, messageText, message)

    } catch (error) {
      console.error('Error procesando mensaje entrante:', error)
    }
  }

  /**
   * Maneja respuestas automáticas
   */
  async handleAutoResponse(phoneNumber, messageText, originalMessage) {
    try {
      // Respuesta automática fuera de horario
      const currentHour = new Date().getHours()
      if (currentHour < 9 || currentHour > 18) {
        const autoResponse = `Gracias por tu mensaje. Nuestro horario de atención es de 9:00 a 18:00. Te responderemos lo antes posible.`
        
        // Esperar un poco antes de responder
        setTimeout(() => {
          this.sendTextMessage(phoneNumber, autoResponse, {
            autoResponse: true,
            originalMessageId: originalMessage.id
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Error en respuesta automática:', error)
    }
  }

  /**
   * Verifica el webhook
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge
    }
    return null
  }

  /**
   * Obtiene estadísticas de mensajes
   */
  getMessageStats() {
    try {
      const history = this.getMessageHistory()
      const today = new Date().toDateString()
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      return {
        total: history.length,
        today: history.filter(msg => new Date(msg.timestamp).toDateString() === today).length,
        thisWeek: history.filter(msg => new Date(msg.timestamp) >= thisWeek).length,
        outbound: history.filter(msg => msg.direction === 'outbound').length,
        inbound: history.filter(msg => msg.direction === 'inbound').length,
        byType: {
          text: history.filter(msg => msg.type === MESSAGE_TYPES.TEXT).length,
          template: history.filter(msg => msg.type === MESSAGE_TYPES.TEMPLATE).length,
          document: history.filter(msg => msg.type === MESSAGE_TYPES.DOCUMENT).length
        }
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        outbound: 0,
        inbound: 0,
        byType: { text: 0, template: 0, document: 0 }
      }
    }
  }
}

// Instancia singleton
export const whatsappService = new WhatsAppService()

// Funciones de utilidad para notificaciones automáticas
export const whatsappNotifications = {
  
  /**
   * Envía notificación de presupuesto
   */
  async notifyPresupuestoEnviado(cliente, presupuesto) {
    if (!cliente.telefono) return null
    
    const message = `Hola ${cliente.nombre}, te hemos enviado el presupuesto #${presupuesto.numero}. Puedes revisarlo y contactarnos para cualquier consulta. ¡Gracias!`
    
    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'presupuesto_notification',
        clienteId: cliente.id,
        presupuestoId: presupuesto.id,
        userId: 'system'
      }
    )
  },

  /**
   * Envía recordatorio de reunión
   */
  async notifyRecordatorioReunion(cliente, tarea) {
    if (!cliente.telefono) return null
    
    const fechaReunion = new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES')
    const horaReunion = new Date(tarea.fecha_vencimiento).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    const message = `Hola ${cliente.nombre}, te recordamos que tienes una reunión programada para el ${fechaReunion} a las ${horaReunion}. ¡Te esperamos!`
    
    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'reunion_reminder',
        clienteId: cliente.id,
        tareaId: tarea.id,
        userId: 'system'
      }
    )
  },

  /**
   * Envía seguimiento de lead
   */
  async notifySeguimientoLead(lead) {
    if (!lead.telefono) return null
    
    const message = `Hola ${lead.nombre}, queremos saber si has tenido oportunidad de revisar nuestra propuesta. Estamos aquí para resolver cualquier duda que puedas tener.`
    
    return await whatsappService.sendTextMessage(
      lead.telefono,
      message,
      {
        type: 'lead_followup',
        leadId: lead.id,
        userId: 'system'
      }
    )
  }
}

// Exports named
export { CONFIG_STATUS, MESSAGE_TYPES, MESSAGE_TEMPLATES }

export default {
  WhatsAppService,
  whatsappService,
  whatsappNotifications,
  MESSAGE_TYPES,
  CONFIG_STATUS,
  MESSAGE_TEMPLATES
}

