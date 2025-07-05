import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utilidades para formateo
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Utilidades para validación
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone) {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/
  return phoneRegex.test(phone)
}

// Utilidades para estados de factura
export function getFacturaStatusColor(status) {
  const colors = {
    'enviada': 'bg-red-100 text-red-800',
    'en_espera': 'bg-yellow-100 text-yellow-800',
    'aprobada': 'bg-green-100 text-green-800',
    'pagada': 'bg-blue-100 text-blue-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getFacturaStatusText(status) {
  const texts = {
    'enviada': 'Enviada',
    'en_espera': 'En Espera',
    'aprobada': 'Aprobada',
    'pagada': 'Pagada'
  }
  return texts[status] || 'Desconocido'
}

