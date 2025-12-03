import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { supabase } from '../lib/supabase'
import { SecurityLogger } from '../lib/security'
import { 
  X, 
  UserPlus, 
  Mail, 
  User, 
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

const InvitarUsuarioModal = ({ isOpen, onClose, currentUser, onUserCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'comercial',
    generatePassword: true,
    customPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  const roles = [
    { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'gerente', label: 'Gerente', description: 'Gestión de equipos y supervisión' },
    { value: 'comercial', label: 'Comercial', description: 'Enfoque en ventas y clientes' }
  ]

  const generateSecurePassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // Asegurar que tenga al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        setErrors({ nombre: 'El nombre es requerido' })
        setLoading(false)
        return
      }

      if (!validateEmail(formData.email)) {
        setErrors({ email: 'Ingresa un email válido' })
        setLoading(false)
        return
      }

      // Verificar si el email ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', formData.email.toLowerCase())
        .single()

      if (existingUser) {
        setErrors({ email: 'Este email ya está registrado' })
        setLoading(false)
        return
      }

      // Generar o usar contraseña personalizada
      const password = formData.generatePassword 
        ? generateSecurePassword() 
        : formData.customPassword

      if (!formData.generatePassword && password.length < 8) {
        setErrors({ customPassword: 'La contraseña debe tener al menos 8 caracteres' })
        setLoading(false)
        return
      }

      // Crear usuario
      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert([
          {
            nombre: formData.nombre.trim(),
            email: formData.email.toLowerCase(),
            password: password, // En producción, esto debería ser un hash
            rol: formData.rol,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        throw new Error('Error al crear el usuario: ' + createError.message)
      }

      // Log de seguridad
      SecurityLogger.log(
        'user_invited',
        { 
          invitedUserId: newUser.id,
          invitedUserEmail: formData.email,
          invitedUserRole: formData.rol,
          invitedBy: currentUser.id,
          timestamp: new Date().toISOString()
        },
        currentUser.id,
        'info'
      )

      setGeneratedPassword(password)
      setSuccess(true)

      // Notificar al componente padre
      if (onUserCreated) {
        onUserCreated(newUser)
      }

    } catch (error) {
      console.error('Error invitando usuario:', error)
      setErrors({ general: error.message })
      
      // Log de error de seguridad
      SecurityLogger.log(
        'user_invitation_failed',
        { 
          email: formData.email,
          error: error.message,
          invitedBy: currentUser.id,
          timestamp: new Date().toISOString()
        },
        currentUser.id,
        'warning'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch (error) {
      console.error('Error copiando contraseña:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: '',
      email: '',
      rol: 'comercial',
      generatePassword: true,
      customPassword: ''
    })
    setErrors({})
    setSuccess(false)
    setGeneratedPassword('')
    setPasswordCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Invitar Usuario</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              ¡Usuario Creado Exitosamente!
            </h3>
            <p className="text-gray-600 mb-4">
              El usuario <strong>{formData.email}</strong> ha sido creado con el rol de <strong>{roles.find(r => r.value === formData.rol)?.label}</strong>.
            </p>
            
            {generatedPassword && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Contraseña Temporal:</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassword}
                    readOnly
                    className="text-center font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyPassword}
                    className={passwordCopied ? 'bg-green-100 text-green-600' : ''}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Guarda esta contraseña de forma segura. El usuario deberá cambiarla en su primer acceso.
                </p>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nombre: e.target.value
                  }))}
                  className="pl-10"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              {errors.nombre && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  className="pl-10"
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol del Usuario
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rol: e.target.value
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roles.map(rol => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label} - {rol.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configuración de Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuración de Contraseña
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passwordOption"
                    checked={formData.generatePassword}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      generatePassword: true,
                      customPassword: ''
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Generar contraseña automáticamente (Recomendado)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passwordOption"
                    checked={!formData.generatePassword}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      generatePassword: false
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Establecer contraseña personalizada</span>
                </label>
              </div>

              {!formData.generatePassword && (
                <div className="mt-3">
                  <Input
                    type="password"
                    value={formData.customPassword}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customPassword: e.target.value
                    }))}
                    placeholder="Contraseña personalizada"
                    required={!formData.generatePassword}
                  />
                  {errors.customPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.customPassword}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default InvitarUsuarioModal
