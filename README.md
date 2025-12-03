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

### 🔒 **Sistema de Seguridad Avanzado**
- Autenticación por roles (Administrador, Gerente, Comercial)
- Logs de seguridad y auditoría en tiempo real
- Control de acceso granular
- Encriptación end-to-end de datos sensibles
- Detección de amenazas y actividad sospechosa
- Sistema de alertas automáticas

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
- WhatsApp Business API (opcional)```

## 🔒 Sistema de Logs de Seguridad

El CRM incluye un sistema avanzado de logs de seguridad que monitorea y registra todas las actividades del sistema para detectar amenazas y garantizar la integridad de los datos.

### 📊 **¿Qué Monitorizan los Logs?**

#### **🚨 Amenazas de Seguridad**
- **Intentos de intrusión:** Múltiples intentos de login fallidos
- **Accesos anómalos:** Conexiones desde ubicaciones inusuales o fuera del horario laboral
- **Actividad sospechosa:** Eliminaciones masivas, actividad excesiva (>100 acciones/hora)
- **Manipulación de datos:** Cambios en campos críticos como IDs o fechas de creación

#### **🛡️ Integridad de Datos**
- **Verificación de integridad:** Detección de datos corruptos o inconsistentes
- **Campos críticos:** Protección de campos como ID, created_at, user_id
- **Operaciones masivas:** Monitoreo de operaciones bulk que podrían ser maliciosas

#### **🔧 Fallos del Sistema**
- **Errores técnicos:** Fallos de conexión a Supabase, problemas de WhatsApp
- **Fallos de encriptación:** Problemas con la seguridad de datos sensibles
- **Errores CRUD:** Problemas en operaciones de base de datos

### 🎯 **Niveles de Alerta**

| Nivel | Descripción | Ejemplos |
|-------|-------------|----------|
| 🔴 **CRÍTICO** | Amenazas graves que requieren acción inmediata | Violaciones de integridad, manipulación de datos críticos |
| 🟠 **ERROR** | Fallos importantes del sistema | Errores de conectividad, fallos de verificación |
| 🟡 **WARNING** | Actividad sospechosa que requiere atención | Actividad excesiva, accesos fuera de horario |
| 🔵 **INFO** | Actividades normales del sistema | Logins exitosos, operaciones rutinarias |

### 📱 **Cómo Acceder a los Logs**

1. **Inicia sesión** en el CRM con permisos de administrador
2. **Navega a la página de Seguridad** desde el menú principal
3. **Selecciona la pestaña "Logs"** para ver el historial completo
4. **Usa los filtros** para buscar eventos específicos por:
   - Nivel de alerta (Crítico, Error, Warning, Info)
   - Término de búsqueda (acción, usuario, detalles)
   - Rango de fechas

### 🔍 **Funcionalidades de los Logs**

#### **Visualización**
- **Lista cronológica** de todos los eventos (más recientes primero)
- **Códigos de color** para identificar rápidamente el nivel de gravedad
- **Detalles expandibles** con información completa del evento
- **Información de contexto:** Usuario, IP, timestamp, detalles técnicos

#### **Filtrado y Búsqueda**
- **Búsqueda por texto:** Encuentra eventos específicos por acción o usuario
- **Filtros por nivel:** Muestra solo alertas críticas, errores, etc.
- **Exportación:** Descarga logs en formato JSON para análisis externo

#### **Alertas en Tiempo Real**
- **Notificaciones del navegador** para alertas críticas
- **Alertas visuales** en la interfaz del CRM
- **Registro automático** de todas las actividades del sistema

### 🛠️ **Configuración de Seguridad**

#### **Encriptación de Datos**
Los siguientes campos se encriptan automáticamente:
- Email, teléfono, direcciones
- Notas y comentarios privados
- Descripciones sensibles
- Observaciones de clientes

#### **Detección de Amenazas**
El sistema detecta automáticamente:
- **Múltiples intentos de login** (>5 fallos en 10 minutos)
- **Actividad excesiva** (>100 acciones en 1 hora)
- **Accesos fuera de horario** (antes 6am o después 10pm)
- **Operaciones masivas** sospechosas

### 📋 **Ejemplo de Alerta**

```json
{
  "nivel": "CRÍTICO",
  "mensaje": "Actividad sospechosa detectada",
  "detalles": {
    "usuario": "comercial@empresa.com",
    "acción": "25 eliminaciones de clientes en 10 minutos",
    "ip": "192.168.1.100",
    "timestamp": "2025-12-03T10:30:00Z"
  },
  "recomendación": "Revisar actividad del usuario inmediatamente"
}
```

### 🔐 **Mejores Prácticas de Seguridad**

1. **Revisa los logs regularmente** para detectar patrones anómalos
2. **Configura notificaciones** para alertas críticas
3. **Exporta logs periódicamente** para análisis de seguridad
4. **Investiga inmediatamente** cualquier alerta crítica
5. **Mantén actualizadas** las credenciales de acceso
6. **Usa roles apropiados** para cada usuario del sistema

### ⚠️ **Limitaciones Importantes**

- **Almacenamiento local:** Los logs se guardan en el navegador (localStorage)
- **No detecta virus:** El sistema no incluye antivirus, solo monitorea actividad del CRM
- **Límite de logs:** Se mantienen los últimos 1000 logs por rendimiento
- **Dependiente del navegador:** Los logs son específicos de cada navegador/dispositivo

---

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

