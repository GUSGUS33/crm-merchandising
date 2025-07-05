import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  CheckSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Globe,
  Shield,
  MessageCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const Layout = () => {
  const { user, signOut, getUserRole, hasPermission } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Funciones de uso diario
  const dailyMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      requiredRole: 'comercial'
    },
    {
      name: 'Clientes',
      icon: Users,
      path: '/clientes',
      requiredRole: 'comercial'
    },
    {
      name: 'Leads',
      icon: UserPlus,
      path: '/leads',
      requiredRole: 'comercial'
    },
    {
      name: 'Presupuestos',
      icon: FileText,
      path: '/presupuestos',
      requiredRole: 'comercial'
    },
    {
      name: 'Facturas',
      icon: FileText,
      path: '/facturas',
      requiredRole: 'facturacion'
    },
    {
      name: 'Tareas',
      icon: CheckSquare,
      path: '/tareas',
      requiredRole: 'comercial'
    }
  ]

  // Funciones administrativas
  const adminMenuItems = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      path: '/whatsapp',
      requiredRole: 'gerente'
    },
    {
      name: 'Sitios Web',
      icon: Globe,
      path: '/sitios-web',
      requiredRole: 'administrador'
    },
    {
      name: 'Seguridad',
      icon: Shield,
      path: '/seguridad',
      requiredRole: 'administrador'
    },
    {
      name: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      requiredRole: 'gerente'
    }
  ]

  const filteredDailyItems = dailyMenuItems.filter(item => 
    hasPermission(item.requiredRole)
  )

  const filteredAdminItems = adminMenuItems.filter(item => 
    hasPermission(item.requiredRole)
  )

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getUserInitials = () => {
    const email = user?.email || ''
    return email.substring(0, 2).toUpperCase()
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'comercial': 'Comercial',
      'marketing': 'Marketing',
      'facturacion': 'Facturación',
      'gerente': 'Gerente Comercial',
      'administrador': 'Administrador'
    }
    return roleNames[role] || 'Usuario'
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            CRM Merchandising
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {/* Funciones de uso diario */}
          <div className="space-y-1">
            {filteredDailyItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    w-full justify-start text-left
                    ${isActive 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </div>

          {/* Separador */}
          {filteredAdminItems.length > 0 && (
            <div className="my-6">
              <div className="border-t border-gray-200"></div>
              <p className="text-xs text-gray-500 mt-3 mb-3 px-2 font-medium uppercase tracking-wider">
                Administración
              </p>
            </div>
          )}

          {/* Funciones administrativas */}
          <div className="space-y-1">
            {filteredAdminItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    w-full justify-start text-left
                    ${isActive 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(getUserRole())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar clientes, facturas..."
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getRoleDisplayName(getUserRole())}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout

