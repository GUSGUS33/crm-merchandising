import CryptoJS from 'crypto-js'

// Clave de encriptación base (en producción debería venir de variables de entorno)
const ENCRYPTION_KEY = 'CRM-SECURITY-KEY-2025-ADVANCED-PROTECTION'

// Campos sensibles que requieren encriptación
const SENSITIVE_FIELDS = [
  'email',
  'telefono',
  'notas',
  'descripcion',
  'direccion',
  'observaciones',
  'comentarios'
]

/**
 * Sistema de Encriptación End-to-End
 */
export class EncryptionService {
  
  /**
   * Encripta un texto usando AES-256
   * @param {string} text - Texto a encriptar
   * @returns {string} - Texto encriptado
   */
  static encrypt(text) {
    if (!text || typeof text !== 'string') return text
    
    try {
      const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
      return `ENC:${encrypted}`
    } catch (error) {
      console.error('Error encriptando:', error)
      return text
    }
  }

  /**
   * Desencripta un texto
   * @param {string} encryptedText - Texto encriptado
   * @returns {string} - Texto desencriptado
   */
  static decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText
    
    // Verificar si el texto está encriptado
    if (!encryptedText.startsWith('ENC:')) return encryptedText
    
    try {
      const encrypted = encryptedText.substring(4) // Remover prefijo 'ENC:'
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Error desencriptando:', error)
      return encryptedText
    }
  }

  /**
   * Encripta campos sensibles de un objeto
   * @param {Object} data - Objeto con datos
   * @returns {Object} - Objeto con campos sensibles encriptados
   */
  static encryptSensitiveFields(data) {
    if (!data || typeof data !== 'object') return data
    
    const encryptedData = { ...data }
    
    SENSITIVE_FIELDS.forEach(field => {
      if (encryptedData[field] && typeof encryptedData[field] === 'string') {
        encryptedData[field] = this.encrypt(encryptedData[field])
      }
    })
    
    return encryptedData
  }

  /**
   * Desencripta campos sensibles de un objeto
   * @param {Object} data - Objeto con datos encriptados
   * @returns {Object} - Objeto con campos sensibles desencriptados
   */
  static decryptSensitiveFields(data) {
    if (!data || typeof data !== 'object') return data
    
    const decryptedData = { ...data }
    
    SENSITIVE_FIELDS.forEach(field => {
      if (decryptedData[field] && typeof decryptedData[field] === 'string') {
        decryptedData[field] = this.decrypt(decryptedData[field])
      }
    })
    
    return decryptedData
  }

  /**
   * Encripta un array de objetos
   * @param {Array} dataArray - Array de objetos
   * @returns {Array} - Array con objetos encriptados
   */
  static encryptArray(dataArray) {
    if (!Array.isArray(dataArray)) return dataArray
    
    return dataArray.map(item => this.encryptSensitiveFields(item))
  }

  /**
   * Desencripta un array de objetos
   * @param {Array} dataArray - Array de objetos encriptados
   * @returns {Array} - Array con objetos desencriptados
   */
  static decryptArray(dataArray) {
    if (!Array.isArray(dataArray)) return dataArray
    
    return dataArray.map(item => this.decryptSensitiveFields(item))
  }

  /**
   * Verifica si un texto está encriptado
   * @param {string} text - Texto a verificar
   * @returns {boolean} - True si está encriptado
   */
  static isEncrypted(text) {
    return typeof text === 'string' && text.startsWith('ENC:')
  }

  /**
   * Genera un hash seguro para contraseñas
   * @param {string} password - Contraseña
   * @returns {string} - Hash de la contraseña
   */
  static hashPassword(password) {
    return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString()
  }

  /**
   * Verifica una contraseña contra su hash
   * @param {string} password - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @returns {boolean} - True si coincide
   */
  static verifyPassword(password, hash) {
    return this.hashPassword(password) === hash
  }
}

/**
 * Sistema de Logs de Seguridad
 */
export class SecurityLogger {
  
  /**
   * Registra una acción de seguridad
   * @param {string} action - Acción realizada
   * @param {Object} details - Detalles de la acción
   * @param {string} userId - ID del usuario
   * @param {string} level - Nivel de seguridad (info, warning, error, critical)
   */
  static log(action, details = {}, userId = null, level = 'info') {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      action,
      details,
      userId,
      level,
      userAgent: navigator.userAgent,
      ip: 'CLIENT_IP', // En producción se obtendría del servidor
      sessionId: this.getSessionId(),
      location: this.getLocation()
    }
    
    // Guardar en localStorage (en producción iría a un servidor seguro)
    this.saveLog(logEntry)
    
    // Si es crítico, generar alerta
    if (level === 'critical' || level === 'error') {
      this.generateAlert(logEntry)
    }
    
    console.log(`[SECURITY LOG] ${level.toUpperCase()}: ${action}`, logEntry)
  }

  /**
   * Genera un ID único para el log
   * @returns {string} - ID único
   */
  static generateLogId() {
    return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtiene el ID de sesión actual
   * @returns {string} - ID de sesión
   */
  static getSessionId() {
    let sessionId = sessionStorage.getItem('security_session_id')
    if (!sessionId) {
      sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('security_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * Obtiene información de ubicación (simulada)
   * @returns {Object} - Información de ubicación
   */
  static getLocation() {
    // En producción se usaría geolocalización real
    return {
      country: 'España',
      city: 'Madrid',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  /**
   * Guarda el log en localStorage
   * @param {Object} logEntry - Entrada de log
   */
  static saveLog(logEntry) {
    try {
      const logs = this.getLogs()
      logs.push(logEntry)
      
      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000)
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Error guardando log de seguridad:', error)
    }
  }

  /**
   * Obtiene todos los logs de seguridad
   * @returns {Array} - Array de logs
   */
  static getLogs() {
    try {
      const logs = localStorage.getItem('security_logs')
      return logs ? JSON.parse(logs) : []
    } catch (error) {
      console.error('Error obteniendo logs de seguridad:', error)
      return []
    }
  }

  /**
   * Filtra logs por criterios
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array} - Logs filtrados
   */
  static filterLogs(filters = {}) {
    const logs = this.getLogs()
    
    return logs.filter(log => {
      if (filters.level && log.level !== filters.level) return false
      if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) return false
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) return false
      
      return true
    })
  }

  /**
   * Genera una alerta de seguridad
   * @param {Object} logEntry - Entrada de log que genera la alerta
   */
  static generateAlert(logEntry) {
    const alert = {
      id: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'security',
      severity: logEntry.level,
      message: `Actividad sospechosa detectada: ${logEntry.action}`,
      logId: logEntry.id,
      resolved: false,
      details: logEntry
    }
    
    this.saveAlert(alert)
    
    // Mostrar notificación en tiempo real
    this.showSecurityNotification(alert)
  }

  /**
   * Guarda una alerta de seguridad
   * @param {Object} alert - Alerta a guardar
   */
  static saveAlert(alert) {
    try {
      const alerts = this.getAlerts()
      alerts.push(alert)
      
      // Mantener solo las últimas 100 alertas
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100)
      }
      
      localStorage.setItem('security_alerts', JSON.stringify(alerts))
    } catch (error) {
      console.error('Error guardando alerta de seguridad:', error)
    }
  }

  /**
   * Obtiene todas las alertas de seguridad
   * @returns {Array} - Array de alertas
   */
  static getAlerts() {
    try {
      const alerts = localStorage.getItem('security_alerts')
      return alerts ? JSON.parse(alerts) : []
    } catch (error) {
      console.error('Error obteniendo alertas de seguridad:', error)
      return []
    }
  }

  /**
   * Muestra una notificación de seguridad
   * @param {Object} alert - Alerta a mostrar
   */
  static showSecurityNotification(alert) {
    // En una implementación real, esto podría usar un sistema de notificaciones
    console.warn(`🚨 ALERTA DE SEGURIDAD: ${alert.message}`)
    
    // Crear notificación visual
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alerta de Seguridad CRM', {
        body: alert.message,
        icon: '/favicon.ico'
      })
    }
  }

  /**
   * Marca una alerta como resuelta
   * @param {string} alertId - ID de la alerta
   */
  static resolveAlert(alertId) {
    try {
      const alerts = this.getAlerts()
      const alertIndex = alerts.findIndex(alert => alert.id === alertId)
      
      if (alertIndex !== -1) {
        alerts[alertIndex].resolved = true
        alerts[alertIndex].resolvedAt = new Date().toISOString()
        localStorage.setItem('security_alerts', JSON.stringify(alerts))
      }
    } catch (error) {
      console.error('Error resolviendo alerta:', error)
    }
  }
}

/**
 * Sistema de Detección de Actividad Sospechosa
 */
export class ThreatDetection {
  
  /**
   * Analiza patrones de acceso sospechosos
   * @param {string} action - Acción realizada
   * @param {string} userId - ID del usuario
   */
  static analyzeActivity(action, userId) {
    const recentLogs = SecurityLogger.filterLogs({
      userId,
      dateFrom: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Última hora
    })
    
    // Detectar múltiples intentos de login fallidos
    if (action === 'login_failed') {
      const failedAttempts = recentLogs.filter(log => log.action === 'login_failed').length
      if (failedAttempts >= 3) {
        SecurityLogger.log(
          'multiple_failed_logins',
          { attempts: failedAttempts, userId },
          userId,
          'critical'
        )
      }
    }
    
    // Detectar actividad fuera de horario
    const currentHour = new Date().getHours()
    if (currentHour < 6 || currentHour > 22) {
      SecurityLogger.log(
        'off_hours_activity',
        { hour: currentHour, action },
        userId,
        'warning'
      )
    }
    
    // Detectar actividad excesiva
    if (recentLogs.length > 100) {
      SecurityLogger.log(
        'excessive_activity',
        { actionsInLastHour: recentLogs.length },
        userId,
        'warning'
      )
    }
    
    // Detectar cambios masivos de datos
    if (action.includes('bulk_') || action.includes('mass_')) {
      SecurityLogger.log(
        'bulk_data_operation',
        { action },
        userId,
        'warning'
      )
    }
  }

  /**
   * Verifica la integridad de los datos
   * @param {Object} originalData - Datos originales
   * @param {Object} newData - Datos nuevos
   * @returns {boolean} - True si los datos son íntegros
   */
  static verifyDataIntegrity(originalData, newData) {
    try {
      // Verificar que los campos críticos no hayan sido manipulados
      const criticalFields = ['id', 'created_at', 'user_id']
      
      for (const field of criticalFields) {
        if (originalData[field] !== newData[field]) {
          SecurityLogger.log(
            'data_integrity_violation',
            { field, original: originalData[field], new: newData[field] },
            null,
            'critical'
          )
          return false
        }
      }
      
      return true
    } catch (error) {
      SecurityLogger.log(
        'data_integrity_check_failed',
        { error: error.message },
        null,
        'error'
      )
      return false
    }
  }

  /**
   * Detecta patrones de acceso anómalos
   * @param {string} userId - ID del usuario
   * @returns {Array} - Array de anomalías detectadas
   */
  static detectAnomalies(userId) {
    const logs = SecurityLogger.filterLogs({ userId })
    const anomalies = []
    
    // Analizar patrones de tiempo
    const accessTimes = logs.map(log => new Date(log.timestamp).getHours())
    const unusualTimes = accessTimes.filter(hour => hour < 6 || hour > 22)
    
    if (unusualTimes.length > 5) {
      anomalies.push({
        type: 'unusual_access_times',
        severity: 'medium',
        description: 'Acceso frecuente fuera del horario laboral'
      })
    }
    
    // Analizar frecuencia de acciones
    const actionCounts = {}
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })
    
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count > 50 && action.includes('delete')) {
        anomalies.push({
          type: 'excessive_deletions',
          severity: 'high',
          description: `Número excesivo de eliminaciones: ${count}`
        })
      }
    })
    
    return anomalies
  }
}

// Funciones de utilidad para integración
export const securityUtils = {
  
  /**
   * Inicializa el sistema de seguridad
   */
  init() {
    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Registrar inicio de sesión de seguridad
    SecurityLogger.log('security_system_initialized', {}, null, 'info')
  },
  
  /**
   * Wrapper para operaciones CRUD con logging automático
   * @param {string} operation - Operación (create, read, update, delete)
   * @param {string} entity - Entidad (cliente, lead, tarea, etc.)
   * @param {Object} data - Datos de la operación
   * @param {string} userId - ID del usuario
   */
  logCRUDOperation(operation, entity, data, userId) {
    const action = `${operation}_${entity}`
    
    SecurityLogger.log(action, {
      entity,
      operation,
      dataId: data?.id,
      timestamp: new Date().toISOString()
    }, userId, 'info')
    
    // Analizar actividad sospechosa
    ThreatDetection.analyzeActivity(action, userId)
  },
  
  /**
   * Procesa datos antes de guardar (encripta campos sensibles)
   * @param {Object} data - Datos a procesar
   * @returns {Object} - Datos procesados
   */
  processDataForStorage(data) {
    return EncryptionService.encryptSensitiveFields(data)
  },
  
  /**
   * Procesa datos después de cargar (desencripta campos sensibles)
   * @param {Object} data - Datos a procesar
   * @returns {Object} - Datos procesados
   */
  processDataFromStorage(data) {
    return EncryptionService.decryptSensitiveFields(data)
  }
}

export default {
  EncryptionService,
  SecurityLogger,
  ThreatDetection,
  securityUtils
}

