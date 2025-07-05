# 🏢 CRM Merchandising Corporativo

Sistema CRM completo desarrollado en React con integración de WhatsApp Business API, gestión de leads, clientes, facturas y tareas.

## 🚀 Características Principales

### 📊 **Dashboard Avanzado**
- Vista básica y avanzada con gráficos interactivos
- Métricas en tiempo real de clientes, leads y facturas
- Actividad reciente y próximas tareas
- Notas rápidas tipo Post-it

### 👥 **Gestión de Clientes y Leads**
- Sistema Kanban para leads (Nuevo → Contactado → Calificado → Propuesta → Cerrado)
- Gestión completa de clientes con información detallada
- Seguimiento de conversiones de leads a clientes

### 💰 **Facturación y Presupuestos**
- Creación y gestión de presupuestos
- Sistema de facturación integrado
- Seguimiento de pagos y estados

### ✅ **Gestión de Tareas**
- Sistema Kanban para tareas (Pendiente → En Progreso → Completada)
- Asignación de prioridades y fechas límite
- Seguimiento de productividad

### 📱 **Integración WhatsApp Business**
- Interfaz tipo WhatsApp Web
- Envío y recepción de mensajes
- Gestión de conversaciones con clientes y leads
- Soporte para archivos adjuntos

### 🔒 **Sistema de Seguridad**
- Autenticación por roles (Administrador, Gerente, Comercial)
- Logs de seguridad y auditoría
- Control de acceso granular

### 🌐 **Gestión de Sitios Web**
- Administración de múltiples sitios web
- Seguimiento de leads por origen
- Análisis de conversión por sitio

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, Vite, Tailwind CSS
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Base de Datos:** Supabase
- **Autenticación:** Sistema personalizado con roles
- **Despliegue:** Compatible con cualquier hosting estático

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- WhatsApp Business API (opcional)

## 🚀 Instalación y Configuración

### 1. **Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/crm-merchandising.git
cd crm-merchandising
```

### 2. **Instalar Dependencias**
```bash
npm install
```

### 3. **Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# WhatsApp Business API (Opcional)
VITE_WHATSAPP_API_URL=tu_url_de_whatsapp_api
VITE_WHATSAPP_API_TOKEN=tu_token_de_whatsapp

# Configuración de la Aplicación
VITE_APP_NAME="CRM Merchandising"
VITE_APP_VERSION="1.0.0"
```

### 4. **Configurar Supabase**

#### Crear las siguientes tablas en tu base de datos Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  nombre VARCHAR NOT NULL,
  rol VARCHAR NOT NULL CHECK (rol IN ('admin', 'gerente', 'comercial')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  email VARCHAR,
  telefono VARCHAR,
  empresa VARCHAR,
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  email VARCHAR,
  telefono VARCHAR,
  empresa VARCHAR,
  estado VARCHAR DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'calificado', 'propuesta', 'cerrado')),
  origen VARCHAR,
  valor_estimado DECIMAL,
  probabilidad INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  fecha DATE NOT NULL,
  vencimiento DATE,
  subtotal DECIMAL NOT NULL,
  impuestos DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  estado VARCHAR DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'cancelada')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descripcion TEXT,
  estado VARCHAR DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  prioridad VARCHAR DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
  fecha_limite DATE,
  asignado_a UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de sitios web
CREATE TABLE sitios_web (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de mensajes WhatsApp
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono VARCHAR NOT NULL,
  mensaje TEXT NOT NULL,
  direccion VARCHAR CHECK (direccion IN ('inbound', 'outbound')),
  estado VARCHAR DEFAULT 'enviado',
  timestamp TIMESTAMP DEFAULT NOW(),
  cliente_id UUID REFERENCES clientes(id)
);
```

### 5. **Ejecutar en Desarrollo**
```bash
npm run dev
```

### 6. **Compilar para Producción**
```bash
npm run build
```

## 🌐 Despliegue en Hosting

### **Opción 1: Hosting Tradicional (cPanel, etc.)**

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

2. **Subir archivos:**
   - Sube todo el contenido de la carpeta `dist/` a tu hosting
   - Asegúrate de que el archivo `index.html` esté en la raíz

3. **Configurar servidor web:**
   - Para Apache, crea un archivo `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### **Opción 2: Vercel (Recomendado)**

1. **Conectar con GitHub:**
   - Sube tu código a GitHub
   - Conecta tu repositorio con Vercel
   - Configura las variables de entorno en Vercel

2. **Configuración automática:**
   - Vercel detectará automáticamente que es un proyecto Vite
   - El despliegue será automático en cada push

### **Opción 3: Netlify**

1. **Conectar repositorio:**
   - Conecta tu repositorio de GitHub con Netlify
   - Configura el comando de build: `npm run build`
   - Directorio de publicación: `dist`

2. **Configurar redirects:**
   Crea un archivo `_redirects` en la carpeta `public/`:
   ```
   /*    /index.html   200
   ```

## 👥 Usuarios de Demostración

El sistema incluye usuarios de prueba:

- **Administrador:** admin@crm.com / admin123
- **Gerente:** gerente@crm.com / gerente123  
- **Comercial:** comercial@crm.com / comercial123

## 🔧 Configuración Adicional

### **WhatsApp Business API**
Para habilitar la funcionalidad de WhatsApp:

1. Obtén acceso a WhatsApp Business API
2. Configura las variables de entorno correspondientes
3. Implementa los webhooks necesarios

### **Personalización**
- Modifica los colores en `tailwind.config.js`
- Personaliza el logo en `src/assets/`
- Ajusta la configuración en `src/lib/config.js`

## 📁 Estructura del Proyecto

```
crm-merchandising/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   ├── lib/                # Utilidades y servicios
│   ├── assets/             # Recursos estáticos
│   └── App.jsx             # Componente principal
├── public/                 # Archivos públicos
├── dist/                   # Build de producción
└── package.json           # Dependencias y scripts
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas con la instalación o configuración:

1. Revisa la documentación de Supabase
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las tablas de la base de datos estén creadas correctamente

## 🔄 Actualizaciones

Para mantener tu instalación actualizada:

```bash
git pull origin main
npm install
npm run build
```

---

**Desarrollado con ❤️ para empresas de merchandising**

