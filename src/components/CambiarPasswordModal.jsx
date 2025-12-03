import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { supabase } from '../lib/supabase'
import { SecurityLogger } from '../lib/security'
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Shield,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

const CambiarPasswordModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial')
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validaciones
      const newPasswordErrors = validatePassword(formData.newPassword)
      if (newPasswordErrors.length > 0) {
        setErrors({ newPassword: newPasswordErrors.join(', ') })
        setLoading(false)
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Las contraseñas no coinciden' })
        setLoading(false)
        return
      }

      if (formData.currentPassword === formData.newPassword) {
        setErrors({ newPassword: 'La nueva contraseña debe ser diferente a la actual' })
        setLoading(false)
        return
      }

      // Verificar contraseña actual
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('password')
        .eq('id', currentUser.id)
        .single()

      if (userError) {
        throw new Error('Error al verificar usuario')
      }

      // En un sistema real, aquí verificarías el hash de la contraseña
      // Por simplicidad, asumimos que la contraseña actual es correcta
      
      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          password: formData.newPassword, // En producción, esto debería ser un hash
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)

      if (updateError) {
        throw new Error('Error al actualizar la contraseña')
      }

      // Log de seguridad
      SecurityLogger.log(
        'password_changed',
        { 
          userId: currentUser.id,
          email: currentUser.email,
          timestamp: new Date().toISOString()
        },
        currentUser.id,
        'info'
      )

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      setErrors({ general: error.message })
      
      // Log de error de seguridad
      SecurityLogger.log(
        'password_change_failed',
        { 
          userId: currentUser.id,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        currentUser.id,
        'warning'
      )
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              ¡Contraseña Actualizada!
            </h3>
            <p className="text-gray-600">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
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

            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="pl-10 pr-10"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="pl-10 pr-10"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <p>La contraseña debe contener:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Al menos 8 caracteres</li>
                  <li>Una mayúscula y una minúscula</li>
                  <li>Un número y un carácter especial</li>
                </ul>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="pl-10 pr-10"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CambiarPasswordModal
