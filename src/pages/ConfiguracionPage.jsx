import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  Settings,
  Save,
  Edit,
  Eye,
  Globe
} from 'lucide-react'
import { db } from '../lib/supabase'

const ConfiguracionPage = () => {
  const [datosEmpresa, setDatosEmpresa] = useState({
    razon_social: '',
    nif_cif: '',
    direccion: '',
    codigo_postal: '',
    poblacion: '',
    provincia: '',
    telefono: '',
    email: '',
    web: '',
    iban: '',
    regimen_fiscal: 'general',
    iva_defecto: 21,
    prefijo_facturas: 'FACT',
    siguiente_numero_factura: 1,
    prefijo_presupuestos: 'PRES',
    siguiente_numero_presupuesto: 1,
    terminos_pago: 30,
    notas_facturas: '',
    logo_empresa: ''
  })
  
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    cargarDatosEmpresa()
  }, [])

  const cargarDatosEmpresa = async () => {
    try {
      const { data, error } = await db.getDatosEmpresa()
      if (error) {
        console.error('Error al cargar datos de empresa:', error)
      } else if (data) {
        setDatosEmpresa(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatosEmpresa(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await db.updateDatosEmpresa(datosEmpresa)
      if (error) {
        console.error('Error al guardar datos:', error)
        alert('Error al guardar los datos')
      } else {
        setGuardado(true)
        setEditando(false)
        setTimeout(() => setGuardado(false), 3000)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar los datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Empresa</h1>
          <p className="text-gray-600">Gestiona los datos fiscales y configuración de facturación</p>
        </div>
        
        <div className="flex gap-2">
          {!editando ? (
            <Button 
              onClick={() => setEditando(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Datos
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={() => setEditando(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {guardado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Save className="h-5 w-5" />
            <span className="font-medium">Datos guardados correctamente</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Fiscales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Datos Fiscales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social *
              </label>
              <Input
                name="razon_social"
                value={datosEmpresa.razon_social}
                onChange={handleChange}
                placeholder="Merchandising Corporativo S.L."
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIF/CIF *
              </label>
              <Input
                name="nif_cif"
                value={datosEmpresa.nif_cif}
                onChange={handleChange}
                placeholder="B12345678"
                disabled={!editando}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <Input
                name="direccion"
                value={datosEmpresa.direccion}
                onChange={handleChange}
                placeholder="Calle Principal, 123, 1º A"
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal *
              </label>
              <Input
                name="codigo_postal"
                value={datosEmpresa.codigo_postal}
                onChange={handleChange}
                placeholder="28001"
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Población *
              </label>
              <Input
                name="poblacion"
                value={datosEmpresa.poblacion}
                onChange={handleChange}
                placeholder="Madrid"
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <Input
                name="provincia"
                value={datosEmpresa.provincia}
                onChange={handleChange}
                placeholder="Madrid"
                disabled={!editando}
                required
              />
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Datos de Contacto</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Teléfono *
              </label>
              <Input
                name="telefono"
                value={datosEmpresa.telefono}
                onChange={handleChange}
                placeholder="+34 912 345 678"
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={datosEmpresa.email}
                onChange={handleChange}
                placeholder="info@empresa.com"
                disabled={!editando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Página Web
              </label>
              <Input
                name="web"
                value={datosEmpresa.web}
                onChange={handleChange}
                placeholder="https://www.empresa.com"
                disabled={!editando}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="h-4 w-4 inline mr-1" />
                IBAN
              </label>
              <Input
                name="iban"
                value={datosEmpresa.iban}
                onChange={handleChange}
                placeholder="ES12 1234 5678 9012 3456 7890"
                disabled={!editando}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Facturación */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Configuración de Facturación</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Régimen Fiscal
              </label>
              <select
                name="regimen_fiscal"
                value={datosEmpresa.regimen_fiscal}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="general">Régimen General</option>
                <option value="simplificado">Régimen Simplificado</option>
                <option value="recargo">Recargo de Equivalencia</option>
                <option value="exento">Exento de IVA</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA por Defecto (%)
              </label>
              <Input
                type="number"
                name="iva_defecto"
                value={datosEmpresa.iva_defecto}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={!editando}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Términos de Pago (días)
              </label>
              <Input
                type="number"
                name="terminos_pago"
                value={datosEmpresa.terminos_pago}
                onChange={handleChange}
                min="1"
                disabled={!editando}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefijo Facturas
              </label>
              <Input
                name="prefijo_facturas"
                value={datosEmpresa.prefijo_facturas}
                onChange={handleChange}
                placeholder="FACT"
                disabled={!editando}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Siguiente Nº Factura
              </label>
              <Input
                type="number"
                name="siguiente_numero_factura"
                value={datosEmpresa.siguiente_numero_factura}
                onChange={handleChange}
                min="1"
                disabled={!editando}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefijo Presupuestos
              </label>
              <Input
                name="prefijo_presupuestos"
                value={datosEmpresa.prefijo_presupuestos}
                onChange={handleChange}
                placeholder="PRES"
                disabled={!editando}
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas por Defecto en Facturas
              </label>
              <textarea
                name="notas_facturas"
                value={datosEmpresa.notas_facturas}
                onChange={handleChange}
                placeholder="Gracias por confiar en nosotros. Forma de pago: transferencia bancaria."
                disabled={!editando}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        {!editando && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Vista Previa en Documentos</h2>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{datosEmpresa.razon_social || 'Nombre de la Empresa'}</h3>
                <p className="text-sm text-gray-600">NIF/CIF: {datosEmpresa.nif_cif || 'B12345678'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Dirección:</p>
                  <p className="text-gray-600">
                    {datosEmpresa.direccion || 'Dirección no configurada'}<br />
                    {datosEmpresa.codigo_postal} {datosEmpresa.poblacion}<br />
                    {datosEmpresa.provincia}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Contacto:</p>
                  <p className="text-gray-600">
                    Tel: {datosEmpresa.telefono || 'No configurado'}<br />
                    Email: {datosEmpresa.email || 'No configurado'}<br />
                    Web: {datosEmpresa.web || 'No configurado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default ConfiguracionPage

