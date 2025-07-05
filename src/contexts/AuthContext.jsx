import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { user } } = await auth.getCurrentUser()
      setUser(user)
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      
      // Actualizar inmediatamente el estado del usuario
      if (data?.user) {
        setUser(data.user)
        setSession(data.session)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signUp(email, password, metadata)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el rol del usuario
  const getUserRole = () => {
    return user?.user_metadata?.role || 'comercial'
  }

  // Función para verificar permisos
  const hasPermission = (requiredRole) => {
    const userRole = getUserRole()
    const roleHierarchy = {
      'comercial': 1,
      'marketing': 2,
      'facturacion': 2,
      'gerente': 3,
      'administrador': 4
    }
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getUserRole,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

