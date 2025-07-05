// Sistema de autenticación simulado para demostración
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@crm.com',
    password: 'admin123',
    role: 'administrador',
    name: 'Administrador Sistema',
    user_metadata: { role: 'administrador' }
  },
  {
    id: '2',
    email: 'gerente@crm.com',
    password: 'gerente123',
    role: 'gerente',
    name: 'Gerente Comercial',
    user_metadata: { role: 'gerente' }
  },
  {
    id: '3',
    email: 'comercial@crm.com',
    password: 'comercial123',
    role: 'comercial',
    name: 'Comercial',
    user_metadata: { role: 'comercial' }
  },
  {
    id: '4',
    email: 'marketing@crm.com',
    password: 'marketing123',
    role: 'marketing',
    name: 'Marketing',
    user_metadata: { role: 'marketing' }
  },
  {
    id: '5',
    email: 'facturacion@crm.com',
    password: 'facturacion123',
    role: 'facturacion',
    name: 'Facturación',
    user_metadata: { role: 'facturacion' }
  }
]

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAuth = {
  signIn: async (email, password) => {
    await delay(1000) // Simular delay de red
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    
    if (user) {
      // Guardar sesión en localStorage
      const session = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        },
        access_token: 'mock-token-' + user.id,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }
      
      localStorage.setItem('crm-session', JSON.stringify(session))
      
      return { 
        data: { user: session.user, session }, 
        error: null 
      }
    } else {
      return { 
        data: null, 
        error: { message: 'Credenciales inválidas' } 
      }
    }
  },

  signUp: async (email, password, metadata = {}) => {
    await delay(1000)
    
    // En un sistema real, aquí se crearía el usuario
    return { 
      data: null, 
      error: { message: 'Registro no disponible en modo demostración' } 
    }
  },

  signOut: async () => {
    await delay(500)
    localStorage.removeItem('crm-session')
    return { error: null }
  },

  getCurrentUser: async () => {
    const sessionData = localStorage.getItem('crm-session')
    
    if (sessionData) {
      const session = JSON.parse(sessionData)
      
      // Verificar si la sesión no ha expirado
      if (session.expires_at > Date.now()) {
        return { 
          data: { user: session.user }, 
          error: null 
        }
      } else {
        localStorage.removeItem('crm-session')
      }
    }
    
    return { 
      data: { user: null }, 
      error: null 
    }
  },

  onAuthStateChange: (callback) => {
    // Simular listener de cambios de autenticación
    const checkSession = () => {
      const sessionData = localStorage.getItem('crm-session')
      
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (session.expires_at > Date.now()) {
          callback('SIGNED_IN', session)
        } else {
          localStorage.removeItem('crm-session')
          callback('SIGNED_OUT', null)
        }
      } else {
        callback('SIGNED_OUT', null)
      }
    }

    // Verificar inmediatamente
    checkSession()

    // Simular subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // Cleanup si fuera necesario
          }
        }
      }
    }
  }
}

