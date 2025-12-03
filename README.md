# CRM Merchandising - Sistema de Gestión de Clientes

[![GitHub](https://img.shields.io/badge/GitHub-GUSGUS33%2Fcrm--merchandising-blue)](https://github.com/GUSGUS33/crm-merchandising)
[![License](https://img.shields.io/badge/License-MIT-green)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

## 📋 Descripción

CRM Merchandising es un sistema completo de gestión de clientes desarrollado con React y Vite, integrado con Supabase para base de datos y autenticación. Diseñado específicamente para empresas de merchandising.

## ✨ Características Principales

### 📊 Dashboard
- Resumen de actividad
- Estadísticas en tiempo real
- Gráficos interactivos

### 👥 Gestión de Clientes
- CRUD completo de clientes
- Contactos y notas
- Historial de interacciones
- Etiquetas y categorización

### 📋 Presupuestos
- Creación personalizada
- Numeración automática
- Estados visuales
- Envío por email
- Conversión a factura

### 🧾 Facturas
- Generación automática
- Descarga en PDF
- Historial completo
- Integración con presupuestos

### ✅ Tareas
- Gestión de tareas
- Fechas de vencimiento
- Asignación a usuarios
- Seguimiento de progreso

### 🔒 Seguridad
- Autenticación con Supabase
- Control de acceso por roles
- Cambio de contraseña seguro
- Invitación de usuarios
- Logs de seguridad

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o pnpm
- Cuenta de Supabase

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/GUSGUS33/crm-merchandising.git
cd crm-merchandising

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales de Supabase
nano .env

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📦 Estructura del Proyecto

```
crm-merchandising/
├── src/
│   ├── pages/              # Páginas principales
│   ├── components/         # Componentes React
│   ├── contexts/           # Contextos (Auth, etc)
│   ├── lib/               # Utilidades y configuración
│   ├── styles/            # Estilos CSS
│   └── main.jsx           # Punto de entrada
├── dist/                  # Compilación para producción
├── server.js              # Servidor Node.js
├── deploy.sh              # Script de despliegue
├── .env.example           # Plantilla de variables
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias
```

## 🔐 Configuración de Seguridad

### Variables de Entorno
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

**⚠️ IMPORTANTE:** Nunca subas el archivo `.env` a Git. Está incluido en `.gitignore`.

### Credenciales por Defecto
- Email: `info@impacto33.com`
- Contraseña: `Impacto33_2024`

**Cambiar contraseña después del primer login.**

## 📚 Documentación

- **[GUIA_DESPLIEGUE_PRODUCCION.md](./GUIA_DESPLIEGUE_PRODUCCION.md)** - Guía completa de despliegue
- **[SEGURIDAD_Y_MEJORES_PRACTICAS.md](./SEGURIDAD_Y_MEJORES_PRACTICAS.md)** - Información de seguridad
- **[INSTRUCCIONES_FINALES.md](./INSTRUCCIONES_FINALES.md)** - Instrucciones rápidas

## 🚀 Despliegue

### Despliegue Automatizado
```bash
./deploy.sh usuario@servidor.com /ruta/destino
```

### Despliegue Manual
```bash
# Compilar
npm run build

# Transferir archivos
scp -r dist/ usuario@servidor.com:/ruta/destino/

# En el servidor
npm install --production
pm2 start server.js --name crm-app
```

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build
npm run lint     # Linter (si está configurado)
```

### Tecnologías
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Despliegue:** PM2

## 📊 Estadísticas del Proyecto

- **Archivos:** 122+
- **Líneas de Código:** 36,000+
- **Componentes:** 50+
- **Páginas:** 10+
- **Funcionalidades:** 20+

## 🐛 Reporte de Bugs

Si encuentras un bug:

1. Verifica que no esté reportado en [Issues](https://github.com/GUSGUS33/crm-merchandising/issues)
2. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado
   - Capturas de pantalla (si aplica)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**GUSGUS33** - [GitHub](https://github.com/GUSGUS33)

## 🙏 Agradecimientos

- Supabase por la base de datos y autenticación
- React y Vite por el framework
- Tailwind CSS por los estilos
- La comunidad open source

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0.0
**Estado:** ✅ Listo para Producción
