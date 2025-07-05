import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const LoginPage = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast.error('Error al iniciar sesión', {
          description: error.message
        })
      } else {
        toast.success('¡Bienvenido!', {
          description: 'Has iniciado sesión correctamente'
        })
        // Redirigir inmediatamente al dashboard
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor, inténtalo de nuevo'
      })
    } finally {
      setLoading(false)
    }
  }

  // Datos de demostración para testing
  const demoAccounts = [
    { email: 'admin@crm.com', password: 'admin123', role: 'Administrador' },
    { email: 'gerente@crm.com', password: 'gerente123', role: 'Gerente' },
    { email: 'comercial@crm.com', password: 'comercial123', role: 'Comercial' },
    { email: 'marketing@crm.com', password: 'marketing123', role: 'Marketing' },
    { email: 'facturacion@crm.com', password: 'facturacion123', role: 'Facturación' }
  ]

  const fillDemoAccount = (account) => {
    setFormData({
      email: account.email,
      password: account.password
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">CRM</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            CRM Merchandising Corporativo
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="tu@empresa.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cuentas de Demostración
          </h3>
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => fillDemoAccount(account)}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {account.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.role}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600">
                    Usar cuenta
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Haz clic en cualquier cuenta para rellenar automáticamente los campos de login.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

