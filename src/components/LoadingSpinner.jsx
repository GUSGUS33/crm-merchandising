import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'default', text = 'Cargando...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-4`} />
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  )
}

export default LoadingSpinner

