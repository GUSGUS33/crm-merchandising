// Sistema de notificaciones automáticas de WhatsApp
import { whatsappService, whatsappNotifications } from './whatsapp'
import { SecurityLogger } from './security'

/**
 * Configuración de notificaciones automáticas
 */
const NOTIFICATION_CONFIG = {
  presupuesto_enviado: {
    enabled: true,
    delay: 0, // Inmediato
    template: 'presupuesto_enviado'
  },
  presupuesto_aprobado: {
    enabled: true,
    delay: 0,
    template: null // Mensaje personalizado
  },
  recordatorio_reunion: {
    enabled: true,
    delay: 3600000, // 1 hora antes
    template: 'recordatorio_reunion'
  },
  seguimiento_lead: {
    enabled: true,
    delay: 86400000, // 24 horas después
    template: 'seguimiento_lead'
  },
  tarea_vencida: {
    enabled: true,
    delay: 0,
    template: null
  },
  factura_generada: {
    enabled: true,
    delay: 0,
    template: null
  }
}

/**
 * Clase para gestionar notificaciones automáticas
 */
export class WhatsAppNotificationManager {
  
  constructor() {
    this.pendingNotifications = new Map()
    this.loadPendingNotifications()
  }

  /**
   * Carga notificaciones pendientes desde localStorage
   */
  loadPendingNotifications() {
    try {
      const saved = localStorage.getItem('whatsapp_pending_notifications')
      if (saved) {
        const notifications = JSON.parse(saved)
        notifications.forEach(notification => {
          this.scheduleNotification(notification)
        })
      }
    } catch (error) {
      console.error('Error cargando notificaciones pendientes:', error)
    }
  }

  /**
   * Guarda notificaciones pendientes en localStorage
   */
  savePendingNotifications() {
    try {
      const notifications = Array.from(this.pendingNotifications.values())
      localStorage.setItem('whatsapp_pending_notifications', JSON.stringify(notifications))
    } catch (error) {
      console.error('Error guardando notificaciones pendientes:', error)
    }
  }

  /**
   * Programa una notificación
   */
  scheduleNotification(notification) {
    const { id, type, scheduledTime, data } = notification
    const now = Date.now()
    const delay = scheduledTime - now

    if (delay <= 0) {
      // Enviar inmediatamente
      this.sendNotification(type, data)
      this.pendingNotifications.delete(id)
    } else {
      // Programar para más tarde
      const timeoutId = setTimeout(() => {
        this.sendNotification(type, data)
        this.pendingNotifications.delete(id)
        this.savePendingNotifications()
      }, delay)

      this.pendingNotifications.set(id, {
        ...notification,
        timeoutId
      })
    }

    this.savePendingNotifications()
  }

  /**
   * Envía una notificación
   */
  async sendNotification(type, data) {
    try {
      const config = NOTIFICATION_CONFIG[type]
      if (!config || !config.enabled) {
        return
      }

      SecurityLogger.log('whatsapp_auto_notification', {
        type,
        hasPhone: !!data.telefono,
        dataKeys: Object.keys(data)
      }, 'system', 'info')

      switch (type) {
        case 'presupuesto_enviado':
          await this.notifyPresupuestoEnviado(data)
          break
        case 'presupuesto_aprobado':
          await this.notifyPresupuestoAprobado(data)
          break
        case 'recordatorio_reunion':
          await this.notifyRecordatorioReunion(data)
          break
        case 'seguimiento_lead':
          await this.notifySeguimientoLead(data)
          break
        case 'tarea_vencida':
          await this.notifyTareaVencida(data)
          break
        case 'factura_generada':
          await this.notifyFacturaGenerada(data)
          break
        default:
          console.warn('Tipo de notificación no reconocido:', type)
      }
    } catch (error) {
      console.error('Error enviando notificación automática:', error)
      SecurityLogger.log('whatsapp_auto_notification_error', {
        type,
        error: error.message
      }, 'system', 'error')
    }
  }

  /**
   * Notificación de presupuesto enviado
   */
  async notifyPresupuestoEnviado(data) {
    const { cliente, presupuesto } = data
    if (!cliente?.telefono) return

    const message = `¡Hola ${cliente.nombre}! 👋

Te hemos enviado el presupuesto #${presupuesto.numero} por valor de €${presupuesto.total}.

📋 Puedes revisarlo y contactarnos para cualquier consulta.

¡Esperamos trabajar contigo pronto! 🚀`

    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'presupuesto_enviado',
        clienteId: cliente.id,
        presupuestoId: presupuesto.id,
        userId: 'system'
      }
    )
  }

  /**
   * Notificación de presupuesto aprobado
   */
  async notifyPresupuestoAprobado(data) {
    const { cliente, presupuesto } = data
    if (!cliente?.telefono) return

    const message = `¡Excelente noticia ${cliente.nombre}! 🎉

Hemos recibido la aprobación del presupuesto #${presupuesto.numero}.

📞 Nos pondremos en contacto contigo pronto para coordinar los próximos pasos.

¡Gracias por confiar en nosotros! 💼`

    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'presupuesto_aprobado',
        clienteId: cliente.id,
        presupuestoId: presupuesto.id,
        userId: 'system'
      }
    )
  }

  /**
   * Recordatorio de reunión
   */
  async notifyRecordatorioReunion(data) {
    const { cliente, tarea } = data
    if (!cliente?.telefono) return

    const fechaReunion = new Date(tarea.fecha_vencimiento)
    const fecha = fechaReunion.toLocaleDateString('es-ES')
    const hora = fechaReunion.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const message = `¡Hola ${cliente.nombre}! ⏰

Te recordamos que tienes una reunión programada:

📅 Fecha: ${fecha}
🕐 Hora: ${hora}
📋 Tema: ${tarea.descripcion}

¡Te esperamos! Si necesitas reprogramar, contáctanos. 📞`

    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'recordatorio_reunion',
        clienteId: cliente.id,
        tareaId: tarea.id,
        userId: 'system'
      }
    )
  }

  /**
   * Seguimiento de lead
   */
  async notifySeguimientoLead(data) {
    const { lead } = data
    if (!lead?.telefono) return

    const message = `¡Hola ${lead.nombre}! 👋

Queremos saber si has tenido oportunidad de revisar nuestra propuesta.

💬 Estamos aquí para resolver cualquier duda que puedas tener.

📞 ¿Te gustaría que programemos una llamada para conversar?

¡Esperamos tu respuesta! 😊`

    return await whatsappService.sendTextMessage(
      lead.telefono,
      message,
      {
        type: 'seguimiento_lead',
        leadId: lead.id,
        userId: 'system'
      }
    )
  }

  /**
   * Notificación de tarea vencida
   */
  async notifyTareaVencida(data) {
    const { cliente, tarea, responsable } = data
    if (!responsable?.telefono) return

    const message = `⚠️ TAREA VENCIDA

Cliente: ${cliente?.nombre || 'N/A'}
Tarea: ${tarea.descripcion}
Vencimiento: ${new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES')}

Por favor, revisa y actualiza el estado de esta tarea. 📋`

    return await whatsappService.sendTextMessage(
      responsable.telefono,
      message,
      {
        type: 'tarea_vencida',
        clienteId: cliente?.id,
        tareaId: tarea.id,
        responsableId: responsable.id,
        userId: 'system'
      }
    )
  }

  /**
   * Notificación de factura generada
   */
  async notifyFacturaGenerada(data) {
    const { cliente, factura } = data
    if (!cliente?.telefono) return

    const message = `¡Hola ${cliente.nombre}! 📄

Te informamos que hemos generado la factura #${factura.numero} por €${factura.total}.

💳 Puedes proceder con el pago según los términos acordados.

📧 También la recibirás por email.

¡Gracias por tu confianza! 🙏`

    return await whatsappService.sendTextMessage(
      cliente.telefono,
      message,
      {
        type: 'factura_generada',
        clienteId: cliente.id,
        facturaId: factura.id,
        userId: 'system'
      }
    )
  }

  /**
   * Programa notificaciones para un evento
   */
  programNotifications(eventType, data) {
    const config = NOTIFICATION_CONFIG[eventType]
    if (!config || !config.enabled) {
      return
    }

    const notificationId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const scheduledTime = Date.now() + config.delay

    const notification = {
      id: notificationId,
      type: eventType,
      scheduledTime,
      data,
      created: new Date().toISOString()
    }

    this.scheduleNotification(notification)

    SecurityLogger.log('whatsapp_notification_scheduled', {
      type: eventType,
      delay: config.delay,
      scheduledTime: new Date(scheduledTime).toISOString()
    }, 'system', 'info')

    return notificationId
  }

  /**
   * Cancela una notificación programada
   */
  cancelNotification(notificationId) {
    const notification = this.pendingNotifications.get(notificationId)
    if (notification) {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId)
      }
      this.pendingNotifications.delete(notificationId)
      this.savePendingNotifications()

      SecurityLogger.log('whatsapp_notification_cancelled', {
        notificationId,
        type: notification.type
      }, 'system', 'info')

      return true
    }
    return false
  }

  /**
   * Obtiene notificaciones pendientes
   */
  getPendingNotifications() {
    return Array.from(this.pendingNotifications.values()).map(notification => ({
      id: notification.id,
      type: notification.type,
      scheduledTime: notification.scheduledTime,
      created: notification.created,
      data: {
        // Solo incluir datos no sensibles
        clienteNombre: notification.data.cliente?.nombre,
        leadNombre: notification.data.lead?.nombre,
        presupuestoNumero: notification.data.presupuesto?.numero,
        facturaNumero: notification.data.factura?.numero,
        tareaDescripcion: notification.data.tarea?.descripcion
      }
    }))
  }

  /**
   * Actualiza la configuración de notificaciones
   */
  updateConfig(newConfig) {
    Object.assign(NOTIFICATION_CONFIG, newConfig)
    localStorage.setItem('whatsapp_notification_config', JSON.stringify(NOTIFICATION_CONFIG))

    SecurityLogger.log('whatsapp_notification_config_updated', {
      configKeys: Object.keys(newConfig)
    }, 'system', 'info')
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig() {
    return { ...NOTIFICATION_CONFIG }
  }
}

// Instancia singleton
export const notificationManager = new WhatsAppNotificationManager()

/**
 * Funciones de integración con el CRM
 */
export const crmIntegration = {
  
  /**
   * Se llama cuando se envía un presupuesto
   */
  onPresupuestoEnviado(cliente, presupuesto) {
    return notificationManager.programNotifications('presupuesto_enviado', {
      cliente,
      presupuesto
    })
  },

  /**
   * Se llama cuando se aprueba un presupuesto
   */
  onPresupuestoAprobado(cliente, presupuesto) {
    return notificationManager.programNotifications('presupuesto_aprobado', {
      cliente,
      presupuesto
    })
  },

  /**
   * Se llama cuando se crea una tarea de reunión
   */
  onReunionProgramada(cliente, tarea) {
    // Programar recordatorio 1 hora antes
    const fechaReunion = new Date(tarea.fecha_vencimiento)
    const tiempoRecordatorio = fechaReunion.getTime() - Date.now() - 3600000 // 1 hora antes

    if (tiempoRecordatorio > 0) {
      return notificationManager.programNotifications('recordatorio_reunion', {
        cliente,
        tarea
      })
    }
  },

  /**
   * Se llama cuando un lead no responde por 24 horas
   */
  onLeadSinRespuesta(lead) {
    return notificationManager.programNotifications('seguimiento_lead', {
      lead
    })
  },

  /**
   * Se llama cuando una tarea está vencida
   */
  onTareaVencida(cliente, tarea, responsable) {
    return notificationManager.programNotifications('tarea_vencida', {
      cliente,
      tarea,
      responsable
    })
  },

  /**
   * Se llama cuando se genera una factura
   */
  onFacturaGenerada(cliente, factura) {
    return notificationManager.programNotifications('factura_generada', {
      cliente,
      factura
    })
  }
}

export default {
  WhatsAppNotificationManager,
  notificationManager,
  crmIntegration,
  NOTIFICATION_CONFIG
}

