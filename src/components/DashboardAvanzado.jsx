import React, { useState, useEffect } from 'react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  FunnelChart, Funnel, LabelList
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Target, Calendar, Globe, Award, ArrowUp, ArrowDown
} from 'lucide-react'
import { db } from '../lib/supabase'

const DashboardAvanzado = () => {
  const [datos, setDatos] = useState({
    ventas: [],
    embudo: [],
    sitiosWeb: [],
    topClientes: [],
    predicciones: {}
  })
  const [loading, setLoading] = useState(true)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('6meses')

  useEffect(() => {
    cargarDatosAnalisis()
  }, [periodoSeleccionado])

  const cargarDatosAnalisis = async () => {
    setLoading(true)
    try {
      // Cargar datos de todas las fuentes
      const [clientesRes, leadsRes, presupuestosRes, facturasRes, sitiosRes] = await Promise.all([
        db.getClientes(),
        db.getLeads(),
        db.getPresupuestos(),
        db.getFacturas(),
        db.getSitiosWeb()
      ])

      const clientes = clientesRes.data || []
      const leads = leadsRes.data || []
      const presupuestos = presupuestosRes.data || []
      const facturas = facturasRes.data || []
      const sitiosWeb = sitiosRes.data || []

      // Generar datos de ventas por mes (últimos 6 meses)
      const ventasPorMes = generarDatosVentas(facturas, presupuestos)
      
      // Generar embudo de conversión
      const embudoConversion = generarEmbudo(leads, clientes, facturas)
      
      // Análisis por sitio web
      const analisisSitios = generarAnalisisSitios(leads, presupuestos, facturas, sitiosWeb)
      
      // Top clientes por rentabilidad
      const topClientesRentables = generarTopClientes(clientes, facturas, presupuestos)
      
      // Predicciones de ingresos
      const prediccionesIngresos = generarPredicciones(leads, presupuestos)

      setDatos({
        ventas: ventasPorMes,
        embudo: embudoConversion,
        sitiosWeb: analisisSitios,
        topClientes: topClientesRentables,
        predicciones: prediccionesIngresos
      })
    } catch (error) {
      console.error('Error cargando datos de análisis:', error)
    } finally {
      setLoading(false)
    }
  }

  const generarDatosVentas = (facturas, presupuestos) => {
    const meses = []
    const fechaActual = new Date()
    
    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1)
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      
      // Calcular ventas del mes (facturas pagadas)
      const ventasMes = facturas
        .filter(f => {
          const fechaFactura = new Date(f.created_at)
          return fechaFactura.getMonth() === fecha.getMonth() && 
                 fechaFactura.getFullYear() === fecha.getFullYear() &&
                 f.estado === 'pagada'
        })
        .reduce((sum, f) => sum + (f.total || 0), 0)

      // Calcular presupuestos aprobados del mes
      const presupuestosMes = presupuestos
        .filter(p => {
          const fechaPresupuesto = new Date(p.created_at)
          return fechaPresupuesto.getMonth() === fecha.getMonth() && 
                 fechaPresupuesto.getFullYear() === fecha.getFullYear() &&
                 p.estado === 'aprobado'
        })
        .reduce((sum, p) => sum + (p.total || 0), 0)

      meses.push({
        mes: nombreMes,
        ventas: Math.round(ventasMes),
        presupuestos: Math.round(presupuestosMes),
        total: Math.round(ventasMes + presupuestosMes)
      })
    }

    return meses
  }

  const generarEmbudo = (leads, clientes, facturas) => {
    const totalLeads = leads.length
    const leadsCalificados = leads.filter(l => l.estado === 'calificado' || l.estado === 'propuesta_enviada').length
    const clientesConvertidos = clientes.length
    const facturasGeneradas = facturas.filter(f => f.estado === 'pagada').length

    return [
      { etapa: 'Leads Totales', cantidad: totalLeads, porcentaje: 100, color: '#3B82F6' },
      { etapa: 'Leads Calificados', cantidad: leadsCalificados, porcentaje: Math.round((leadsCalificados / totalLeads) * 100), color: '#10B981' },
      { etapa: 'Clientes Convertidos', cantidad: clientesConvertidos, porcentaje: Math.round((clientesConvertidos / totalLeads) * 100), color: '#F59E0B' },
      { etapa: 'Ventas Cerradas', cantidad: facturasGeneradas, porcentaje: Math.round((facturasGeneradas / totalLeads) * 100), color: '#EF4444' }
    ]
  }

  const generarAnalisisSitios = (leads, presupuestos, facturas, sitiosWeb) => {
    return sitiosWeb.map(sitio => {
      const leadsDelSitio = leads.filter(l => l.origen === sitio.sitio_id.toLowerCase().replace('sw', 'sitio_web_'))
      const presupuestosDelSitio = presupuestos.filter(p => p.sitio_web === sitio.sitio_id)
      const facturasDelSitio = facturas.filter(f => 
        presupuestosDelSitio.some(p => p.cliente_id === f.cliente_id)
      )

      const ingresos = facturasDelSitio
        .filter(f => f.estado === 'pagada')
        .reduce((sum, f) => sum + (f.total || 0), 0)

      return {
        sitio: sitio.nombre,
        leads: leadsDelSitio.length,
        presupuestos: presupuestosDelSitio.length,
        ventas: facturasDelSitio.length,
        ingresos: Math.round(ingresos),
        conversion: leadsDelSitio.length > 0 ? Math.round((facturasDelSitio.length / leadsDelSitio.length) * 100) : 0
      }
    })
  }

  const generarTopClientes = (clientes, facturas, presupuestos) => {
    return clientes.map(cliente => {
      const facturasCliente = facturas.filter(f => f.cliente_id === cliente.id)
      const presupuestosCliente = presupuestos.filter(p => p.cliente_id === cliente.id)
      
      const totalFacturado = facturasCliente
        .filter(f => f.estado === 'pagada')
        .reduce((sum, f) => sum + (f.total || 0), 0)
      
      const totalPresupuestado = presupuestosCliente
        .reduce((sum, p) => sum + (p.total || 0), 0)

      return {
        nombre: cliente.nombre,
        empresa: cliente.empresa,
        facturado: Math.round(totalFacturado),
        presupuestado: Math.round(totalPresupuestado),
        facturas: facturasCliente.length,
        presupuestos: presupuestosCliente.length,
        valorPromedio: facturasCliente.length > 0 ? Math.round(totalFacturado / facturasCliente.length) : 0
      }
    })
    .filter(c => c.facturado > 0)
    .sort((a, b) => b.facturado - a.facturado)
    .slice(0, 5)
  }

  const generarPredicciones = (leads, presupuestos) => {
    const leadsActivos = leads.filter(l => l.estado !== 'perdido' && l.estado !== 'convertido')
    
    const ingresosPotenciales = leadsActivos.reduce((sum, lead) => {
      const probabilidad = lead.probabilidad || 50
      return sum + ((lead.valor_estimado || 0) * (probabilidad / 100))
    }, 0)

    const presupuestosPendientes = presupuestos
      .filter(p => p.estado === 'enviado' || p.estado === 'borrador')
      .reduce((sum, p) => sum + (p.total || 0), 0)

    return {
      ingresosPotenciales: Math.round(ingresosPotenciales),
      presupuestosPendientes: Math.round(presupuestosPendientes),
      totalProyectado: Math.round(ingresosPotenciales + presupuestosPendientes),
      leadsActivos: leadsActivos.length,
      probabilidadPromedio: leadsActivos.length > 0 ? 
        Math.round(leadsActivos.reduce((sum, l) => sum + (l.probabilidad || 50), 0) / leadsActivos.length) : 0
    }
  }

  const COLORES_SITIOS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando análisis...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Avanzado</h2>
          <p className="text-gray-600">Análisis detallado de rendimiento y predicciones</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="3meses">Últimos 3 meses</option>
            <option value="6meses">Últimos 6 meses</option>
            <option value="12meses">Último año</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Proyectados</p>
              <p className="text-2xl font-bold text-green-600">
                €{datos.predicciones.totalProyectado?.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Basado en {datos.predicciones.leadsActivos} leads activos
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
              <p className="text-2xl font-bold text-blue-600">
                {datos.embudo[3]?.porcentaje || 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Leads a ventas cerradas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mejor Sitio Web</p>
              <p className="text-2xl font-bold text-purple-600">
                {datos.sitiosWeb.sort((a, b) => b.ingresos - a.ingresos)[0]?.sitio?.split(' ')[0] || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Por ingresos generados
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Cliente</p>
              <p className="text-2xl font-bold text-orange-600">
                €{datos.topClientes[0]?.facturado?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {datos.topClientes[0]?.nombre || 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ventas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolución de Ventas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos.ventas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Facturas Pagadas"
              />
              <Line 
                type="monotone" 
                dataKey="presupuestos" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Presupuestos Aprobados"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Embudo de conversión */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Embudo de Conversión
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.embudo} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="etapa" type="category" width={120} />
              <Tooltip formatter={(value, name) => [value, name === 'cantidad' ? 'Cantidad' : 'Porcentaje']} />
              <Bar dataKey="cantidad" fill="#3B82F6">
                {datos.embudo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis por sitio web */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Sitio Web
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.sitiosWeb}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sitio" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#3B82F6" name="Leads" />
              <Bar dataKey="ventas" fill="#10B981" name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datos.sitiosWeb}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sitio, ingresos }) => `${sitio}: €${ingresos.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="ingresos"
              >
                {datos.sitiosWeb.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_SITIOS[index % COLORES_SITIOS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Ingresos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top clientes y predicciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top clientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Clientes por Facturación
          </h3>
          <div className="space-y-4">
            {datos.topClientes.map((cliente, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cliente.nombre}</p>
                  <p className="text-sm text-gray-600">{cliente.empresa}</p>
                  <p className="text-xs text-gray-500">
                    {cliente.facturas} facturas • Promedio: €{cliente.valorPromedio.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    €{cliente.facturado.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predicciones */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Predicciones de Ingresos
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Ingresos Potenciales</p>
                  <p className="text-2xl font-bold text-blue-900">
                    €{datos.predicciones.ingresosPotenciales?.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Basado en {datos.predicciones.leadsActivos} leads activos
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Presupuestos Pendientes</p>
                  <p className="text-2xl font-bold text-green-900">
                    €{datos.predicciones.presupuestosPendientes?.toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mt-2">
                Esperando respuesta del cliente
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Probabilidad Promedio</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {datos.predicciones.probabilidadPromedio}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-purple-700 mt-2">
                De cierre de leads activos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAvanzado

