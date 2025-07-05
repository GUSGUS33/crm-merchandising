import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from 'sonner'

// Componentes de páginas
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/ClientesPage'
import LeadsPage from './pages/LeadsPage'
import PresupuestosPage from './pages/PresupuestosPage'
import TareasPage from './pages/TareasPage'
import FacturasPage from './pages/FacturasPage'
import SitiosWebPage from './pages/SitiosWebPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import SeguridadPage from './pages/SeguridadPage'
import WhatsAppWebPage from './pages/WhatsAppWebPage'

// Componentes de layout
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = 'comercial' }) => {
  const { user, loading, hasPermission } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    )
  }

  return children
}

// Componente para rutas públicas (solo accesibles si no está autenticado)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="presupuestos" element={<PresupuestosPage />} />
          <Route 
            path="facturas" 
            element={
              <ProtectedRoute requiredRole="facturacion">
                <FacturasPage />
              </ProtectedRoute>
            } 
          />
          <Route path="tareas" element={<TareasPage />} />
          <Route 
            path="whatsapp" 
            element={
              <ProtectedRoute requiredRole="gerente">
                <WhatsAppWebPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="sitios-web" 
            element={
              <ProtectedRoute requiredRole="administrador">
                <SitiosWebPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="seguridad" 
            element={
              <ProtectedRoute requiredRole="administrador">
                <SeguridadPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="configuracion" 
            element={
              <ProtectedRoute requiredRole="gerente">
                <ConfiguracionPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App

