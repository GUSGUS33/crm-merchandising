import { createClient } from '@supabase/supabase-js'
import { mockAuth } from './mockAuth'
import { securityUtils, SecurityLogger } from './security'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar si estamos en modo demo
const isDemoMode = supabaseUrl === 'https://your-project.supabase.co' || 
                   supabaseAnonKey === 'your-anon-key' ||
                   supabaseUrl === 'https://demo-project.supabase.co' || 
                   supabaseAnonKey === 'demo-key' ||
                   !supabaseUrl ||
                   !supabaseAnonKey

console.log('Demo mode:', isDemoMode, 'URL:', supabaseUrl, 'Key:', supabaseAnonKey)

let supabase = null

if (!isDemoMode) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Funciones de autenticación con fallback a mock
export const auth = {
  signIn: async (email, password) => {
    if (isDemoMode) {
      console.log('Using mock auth for sign in')
      return await mockAuth.signIn(email, password)
    }
    
    console.log('Using real Supabase for sign in')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signUp: async (email, password, metadata = {}) => {
    if (isDemoMode) {
      return await mockAuth.signUp(email, password, metadata)
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signOut: async () => {
    if (isDemoMode) {
      return await mockAuth.signOut()
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    if (isDemoMode) {
      return await mockAuth.getCurrentUser()
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    if (isDemoMode) {
      return mockAuth.onAuthStateChange(callback)
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Datos mock con persistencia en localStorage
const STORAGE_KEYS = {
  CLIENTES: 'crm_mock_clientes',
  LEADS: 'crm_mock_leads', 
  PRESUPUESTOS: 'crm_mock_presupuestos',
  TAREAS: 'crm_mock_tareas',
  FACTURAS: 'crm_mock_facturas',
  SITIOS_WEB: 'crm_mock_sitios_web',
  DATOS_EMPRESA: 'crm_mock_datos_empresa'
}

// Función para cargar datos desde localStorage
const loadFromStorage = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultData
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultData
  }
}

// Función para guardar datos en localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

// Datos mock iniciales
const INITIAL_MOCK_DATA = {
  clientes: [
    {
      id: '1',
      nombre: 'Juan Pérez',
      empresa: 'Empresa ABC S.L.',
      email: 'juan@empresaabc.com',
      telefono: '+34 600 123 456',
      direccion: 'Calle Mayor 123, Madrid',
      origen: 'sitio_web_1',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    },
    {
      id: '2',
      nombre: 'María García',
      empresa: 'Corporación XYZ',
      email: 'maria@corpxyz.com',
      telefono: '+34 600 789 012',
      direccion: 'Avenida Principal 456, Barcelona',
      origen: 'sitio_web_2',
      created_at: '2025-01-02T11:00:00Z',
      updated_at: '2025-01-02T11:00:00Z'
    },
    {
      id: '3',
      nombre: 'Carlos López',
      empresa: 'Startup DEF',
      email: 'carlos@startupdef.com',
      telefono: '+34 600 345 678',
      direccion: 'Plaza Central 789, Valencia',
      origen: 'sitio_web_3',
      created_at: '2025-01-03T12:00:00Z',
      updated_at: '2025-01-03T12:00:00Z'
    }
  ],
  leads: [
    {
      id: '1',
      nombre: 'Ana Martín',
      empresa: 'Tech Solutions',
      email: 'ana@techsolutions.com',
      telefono: '+34 600 111 222',
      origen: 'sitio_web_1',
      probabilidad: 75,
      valor_estimado: 5000,
      estado: 'calificado',
      notas: 'Interesada en productos personalizados para eventos corporativos',
      created_at: '2025-01-04T09:00:00Z',
      updated_at: '2025-01-04T09:00:00Z'
    },
    {
      id: '2',
      nombre: 'Roberto Silva',
      empresa: 'Marketing Pro',
      email: 'roberto@marketingpro.com',
      telefono: '+34 600 333 444',
      origen: 'sitio_web_2',
      probabilidad: 50,
      valor_estimado: 3500,
      estado: 'contactado',
      notas: 'Solicita presupuesto para merchandising de marca',
      created_at: '2025-01-05T10:00:00Z',
      updated_at: '2025-01-05T10:00:00Z'
    },
    {
      id: '3',
      nombre: 'Laura Fernández',
      empresa: 'Eventos Elite',
      email: 'laura@eventoselite.com',
      telefono: '+34 600 555 666',
      origen: 'sitio_web_3',
      probabilidad: 90,
      valor_estimado: 8000,
      estado: 'propuesta_enviada',
      notas: 'Evento corporativo de fin de año, necesita 500 productos personalizados',
      created_at: '2025-01-06T11:00:00Z',
      updated_at: '2025-01-06T11:00:00Z'
    }
  ],
  presupuestos: [
    {
      id: '1',
      numero: 'PRES-2025-001',
      cliente_id: '1',
      cliente: {
        nombre: 'Juan Pérez',
        empresa: 'Empresa ABC S.L.',
        email: 'juan@empresaabc.com'
      },
      sitio_web: 'sitio_web_1',
      fecha: '2025-01-02',
      fecha_validez: '2025-02-01',
      estado: 'enviado',
      items: [
        {
          descripcion: 'Bolígrafos personalizados con logo',
          cantidad: 500,
          precio_unitario: 2.50,
          total: 1250.00
        },
        {
          descripcion: 'Libretas corporativas A5',
          cantidad: 200,
          precio_unitario: 3.75,
          total: 750.00
        }
      ],
      subtotal: 2000.00,
      descuento: 5,
      impuestos: 399.00,
      total: 1996.50,
      notas: 'Entrega en oficina central de Madrid',
      created_at: '2025-01-02T12:00:00Z',
      updated_at: '2025-01-02T12:00:00Z'
    },
    {
      id: '2',
      numero: 'PRES-2025-002',
      cliente_id: '2',
      cliente: {
        nombre: 'María García',
        empresa: 'Corporación XYZ',
        email: 'maria@corpxyz.com'
      },
      sitio_web: 'sitio_web_2',
      fecha: '2025-01-01',
      fecha_validez: '2025-01-31',
      estado: 'aprobado',
      items: [
        {
          descripcion: 'Tazas personalizadas cerámica',
          cantidad: 300,
          precio_unitario: 4.20,
          total: 1260.00
        },
        {
          descripcion: 'Camisetas polo bordadas',
          cantidad: 100,
          precio_unitario: 15.50,
          total: 1550.00
        }
      ],
      subtotal: 2810.00,
      descuento: 0,
      impuestos: 590.10,
      total: 2964.50,
      notas: 'Colores corporativos: azul y blanco',
      created_at: '2025-01-01T14:00:00Z',
      updated_at: '2025-01-01T14:00:00Z'
    },
    {
      id: '3',
      numero: 'PRES-2025-003',
      cliente_id: '3',
      cliente: {
        nombre: 'Carlos López',
        empresa: 'Startup DEF',
        email: 'carlos@startupdef.com'
      },
      sitio_web: 'sitio_web_3',
      fecha: '2024-12-28',
      fecha_validez: '2025-01-28',
      estado: 'borrador',
      items: [
        {
          descripcion: 'USB personalizados 16GB',
          cantidad: 150,
          precio_unitario: 6.50,
          total: 975.00
        }
      ],
      subtotal: 975.00,
      descuento: 10,
      impuestos: 184.28,
      total: 907.50,
      notas: 'Diseño minimalista, colores startup',
      created_at: '2024-12-28T16:00:00Z',
      updated_at: '2024-12-28T16:00:00Z'
    }
  ],
  tareas: [
    {
      id: '1',
      titulo: 'Llamar a Juan Pérez',
      descripcion: 'Seguimiento del presupuesto PRES-2025-001',
      tipo: 'llamada',
      prioridad: 'alta',
      estado: 'pendiente',
      asignado_a: 'Comercial',
      fecha_vencimiento: '2025-01-07',
      cliente_relacionado: 'Juan Pérez - Empresa ABC S.L.',
      created_at: '2025-01-05T09:00:00Z',
      updated_at: '2025-01-05T09:00:00Z'
    },
    {
      id: '2',
      titulo: 'Enviar muestras a María García',
      descripcion: 'Enviar muestras de tazas personalizadas',
      tipo: 'administrativo',
      prioridad: 'media',
      estado: 'completada',
      asignado_a: 'Marketing',
      fecha_vencimiento: '2025-01-03',
      cliente_relacionado: 'María García - Corporación XYZ',
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-03T15:00:00Z'
    }
  ],
  facturas: [
    {
      id: '1',
      numero: 'FACT-2025-001',
      cliente_id: '2',
      cliente: {
        nombre: 'María García',
        empresa: 'Corporación XYZ',
        email: 'maria@corpxyz.com'
      },
      presupuesto_id: '2',
      fecha: '2025-01-02',
      fecha_vencimiento: '2025-02-01',
      estado: 'enviada',
      items: [
        {
          descripcion: 'Tazas personalizadas cerámica',
          cantidad: 300,
          precio_unitario: 4.20,
          total: 1260.00
        },
        {
          descripcion: 'Camisetas polo bordadas',
          cantidad: 100,
          precio_unitario: 15.50,
          total: 1550.00
        }
      ],
      subtotal: 2810.00,
      impuestos: 590.10,
      total: 2964.50,
      created_at: '2025-01-02T16:00:00Z',
      updated_at: '2025-01-02T16:00:00Z'
    }
  ],
  sitios_web: [
    {
      id: '1',
      sitio_id: 'SW001',
      nombre: 'Merchandising Corporativo',
      url: 'https://merchandising-corporativo.com',
      email: 'info@merchandising-corporativo.com',
      descripcion: 'Productos personalizados para empresas y eventos corporativos',
      logo: '/logo-sitio-1.png',
      estado: 'activo',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      sitio_id: 'SW002',
      nombre: 'Productos Personalizados',
      url: 'https://productos-personalizados.com',
      email: 'ventas@productos-personalizados.com',
      descripcion: 'Personalización de productos para particulares y pequeñas empresas',
      logo: '/logo-sitio-2.png',
      estado: 'activo',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      sitio_id: 'SW003',
      nombre: 'Regalos Empresariales',
      url: 'https://regalos-empresariales.com',
      email: 'contacto@regalos-empresariales.com',
      descripcion: 'Regalos corporativos y promocionales de alta calidad',
      logo: '/logo-sitio-3.png',
      estado: 'activo',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ],
  datos_empresa: {
    razon_social: 'Merchandising Corporativo S.L.',
    nif_cif: 'B12345678',
    direccion: 'Calle Principal, 123, 1º A',
    codigo_postal: '28001',
    poblacion: 'Madrid',
    provincia: 'Madrid',
    telefono: '+34 912 345 678',
    email: 'info@merchandising-corporativo.com',
    web: 'https://www.merchandising-corporativo.com',
    iban: 'ES12 1234 5678 9012 3456 7890',
    regimen_fiscal: 'general',
    iva_defecto: 21,
    prefijo_facturas: 'FACT',
    siguiente_numero_factura: 1,
    prefijo_presupuestos: 'PRES',
    siguiente_numero_presupuesto: 4,
    terminos_pago: 30,
    notas_facturas: 'Gracias por confiar en nosotros. Forma de pago: transferencia bancaria a la cuenta indicada.',
    logo_empresa: '',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
}

// Cargar datos mock con persistencia
const MOCK_DATA = {
  clientes: loadFromStorage(STORAGE_KEYS.CLIENTES, INITIAL_MOCK_DATA.clientes),
  leads: loadFromStorage(STORAGE_KEYS.LEADS, INITIAL_MOCK_DATA.leads),
  presupuestos: loadFromStorage(STORAGE_KEYS.PRESUPUESTOS, INITIAL_MOCK_DATA.presupuestos),
  tareas: loadFromStorage(STORAGE_KEYS.TAREAS, INITIAL_MOCK_DATA.tareas),
  facturas: loadFromStorage(STORAGE_KEYS.FACTURAS, INITIAL_MOCK_DATA.facturas),
  sitios_web: loadFromStorage(STORAGE_KEYS.SITIOS_WEB, INITIAL_MOCK_DATA.sitios_web),
  datos_empresa: loadFromStorage(STORAGE_KEYS.DATOS_EMPRESA, INITIAL_MOCK_DATA.datos_empresa)
}

// Funciones de base de datos con fallback a datos simulados
export const db = {
  // Clientes
  getClientes: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.clientes, error: null }
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createCliente: async (cliente) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newCliente = {
        ...cliente,
        id: String(MOCK_DATA.clientes.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.clientes.unshift(newCliente)
      saveToStorage(STORAGE_KEYS.CLIENTES, MOCK_DATA.clientes)
      return { data: [newCliente], error: null }
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
    return { data, error }
  },

  updateCliente: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.clientes.findIndex(c => c.id === id)
      if (index !== -1) {
        MOCK_DATA.clientes[index] = { 
          ...MOCK_DATA.clientes[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.CLIENTES, MOCK_DATA.clientes)
        return { data: [MOCK_DATA.clientes[index]], error: null }
      }
      return { data: null, error: { message: 'Cliente no encontrado' } }
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Leads
  getLeads: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.leads, error: null }
    }
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createLead: async (lead) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newLead = {
        ...lead,
        id: String(MOCK_DATA.leads.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.leads.unshift(newLead)
      saveToStorage(STORAGE_KEYS.LEADS, MOCK_DATA.leads)
      return { data: [newLead], error: null }
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
    return { data, error }
  },

  updateLead: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.leads.findIndex(l => l.id === id)
      if (index !== -1) {
        MOCK_DATA.leads[index] = { 
          ...MOCK_DATA.leads[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.LEADS, MOCK_DATA.leads)
        return { data: [MOCK_DATA.leads[index]], error: null }
      }
      return { data: null, error: { message: 'Lead no encontrado' } }
    }
    
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Presupuestos
  getPresupuestos: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.presupuestos, error: null }
    }
    
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`
        *,
        clientes (
          nombre,
          email,
          empresa
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createPresupuesto: async (presupuesto) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newPresupuesto = {
        ...presupuesto,
        id: String(MOCK_DATA.presupuestos.length + 1),
        numero: `PRES-2025-${String(MOCK_DATA.presupuestos.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.presupuestos.unshift(newPresupuesto)
      saveToStorage(STORAGE_KEYS.PRESUPUESTOS, MOCK_DATA.presupuestos)
      return { data: [newPresupuesto], error: null }
    }
    
    const { data, error } = await supabase
      .from('presupuestos')
      .insert([presupuesto])
      .select()
    return { data, error }
  },

  updatePresupuesto: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.presupuestos.findIndex(p => p.id === id)
      if (index !== -1) {
        MOCK_DATA.presupuestos[index] = { 
          ...MOCK_DATA.presupuestos[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.PRESUPUESTOS, MOCK_DATA.presupuestos)
        return { data: [MOCK_DATA.presupuestos[index]], error: null }
      }
      return { data: null, error: { message: 'Presupuesto no encontrado' } }
    }
    
    const { data, error } = await supabase
      .from('presupuestos')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
    return { data, error }
  },

  duplicatePresupuesto: async (id) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const original = MOCK_DATA.presupuestos.find(p => p.id === id)
      if (original) {
        const duplicated = {
          ...original,
          id: String(MOCK_DATA.presupuestos.length + 1),
          numero: `PRES-2025-${String(MOCK_DATA.presupuestos.length + 1).padStart(3, '0')}`,
          estado: 'borrador',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        MOCK_DATA.presupuestos.unshift(duplicated)
        saveToStorage(STORAGE_KEYS.PRESUPUESTOS, MOCK_DATA.presupuestos)
        return { data: [duplicated], error: null }
      }
      return { data: null, error: { message: 'Presupuesto no encontrado' } }
    }
    
    // Implementación real para Supabase
    return { data: null, error: { message: 'No implementado' } }
  },

  // Tareas
  getTareas: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.tareas, error: null }
    }
    
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createTarea: async (tarea) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newTarea = {
        ...tarea,
        id: String(MOCK_DATA.tareas.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.tareas.unshift(newTarea)
      saveToStorage(STORAGE_KEYS.TAREAS, MOCK_DATA.tareas)
      return { data: [newTarea], error: null }
    }
    
    const { data, error } = await supabase
      .from('tareas')
      .insert([tarea])
      .select()
    return { data, error }
  },

  updateTarea: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.tareas.findIndex(t => t.id === id)
      if (index !== -1) {
        MOCK_DATA.tareas[index] = { 
          ...MOCK_DATA.tareas[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.TAREAS, MOCK_DATA.tareas)
        return { data: [MOCK_DATA.tareas[index]], error: null }
      }
      return { data: null, error: { message: 'Tarea no encontrada' } }
    }
    
    const { data, error } = await supabase
      .from('tareas')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Facturas
  getFacturas: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.facturas, error: null }
    }
    
    const { data, error } = await supabase
      .from('facturas')
      .select(`
        *,
        clientes (
          nombre,
          email,
          empresa
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createFactura: async (factura) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newFactura = {
        ...factura,
        id: String(MOCK_DATA.facturas.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.facturas.unshift(newFactura)
      saveToStorage(STORAGE_KEYS.FACTURAS, MOCK_DATA.facturas)
      return { data: [newFactura], error: null }
    }
    
    const { data, error } = await supabase
      .from('facturas')
      .insert([factura])
      .select()
    return { data, error }
  },

  updateFactura: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.facturas.findIndex(f => f.id === id)
      if (index !== -1) {
        MOCK_DATA.facturas[index] = { 
          ...MOCK_DATA.facturas[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.FACTURAS, MOCK_DATA.facturas)
        return { data: [MOCK_DATA.facturas[index]], error: null }
      }
      return { data: null, error: { message: 'Factura no encontrada' } }
    }
    
    const { data, error } = await supabase
      .from('facturas')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Sitios Web
  getSitiosWeb: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: MOCK_DATA.sitios_web, error: null }
    }
    
    const { data, error } = await supabase
      .from('sitios_web')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createSitioWeb: async (sitio) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newSitio = {
        ...sitio,
        id: String(MOCK_DATA.sitios_web.length + 1),
        sitio_id: sitio.sitio_id || `SW${String(MOCK_DATA.sitios_web.length + 1).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      MOCK_DATA.sitios_web.unshift(newSitio)
      saveToStorage(STORAGE_KEYS.SITIOS_WEB, MOCK_DATA.sitios_web)
      return { data: [newSitio], error: null }
    }
    
    const { data, error } = await supabase
      .from('sitios_web')
      .insert([sitio])
      .select()
    return { data, error }
  },

  updateSitioWeb: async (id, updates) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.sitios_web.findIndex(s => s.id === id)
      if (index !== -1) {
        MOCK_DATA.sitios_web[index] = { 
          ...MOCK_DATA.sitios_web[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.SITIOS_WEB, MOCK_DATA.sitios_web)
        return { data: [MOCK_DATA.sitios_web[index]], error: null }
      }
      return { data: null, error: { message: 'Sitio web no encontrado' } }
    }
    
    const { data, error } = await supabase
      .from('sitios_web')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteSitioWeb: async (id) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DATA.sitios_web.findIndex(s => s.id === id)
      if (index !== -1) {
        MOCK_DATA.sitios_web.splice(index, 1)
        saveToStorage(STORAGE_KEYS.SITIOS_WEB, MOCK_DATA.sitios_web)
        return { data: null, error: null }
      }
      return { data: null, error: { message: 'Sitio web no encontrado' } }
    }
    
    const { data, error } = await supabase
      .from('sitios_web')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Datos de Empresa
  getDatosEmpresa: async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: MOCK_DATA.datos_empresa, error: null }
    }
    
    const { data, error } = await supabase
      .from('datos_empresa')
      .select('*')
      .single()
    return { data, error }
  },

  updateDatosEmpresa: async (datos) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500))
      MOCK_DATA.datos_empresa = {
        ...MOCK_DATA.datos_empresa,
        ...datos,
        updated_at: new Date().toISOString()
      }
      saveToStorage(STORAGE_KEYS.DATOS_EMPRESA, MOCK_DATA.datos_empresa)
      return { data: MOCK_DATA.datos_empresa, error: null }
    }
    
    const { data, error } = await supabase
      .from('datos_empresa')
      .upsert(datos)
      .select()
      .single()
    return { data, error }
  }
}

// Inicializar sistema de seguridad
securityUtils.init()

// Registrar inicio del sistema
SecurityLogger.log('system_initialized', { 
  mode: isDemoMode ? 'demo' : 'production',
  timestamp: new Date().toISOString()
}, null, 'info')

export { supabase }
export default supabase

