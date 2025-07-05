import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const PresupuestoPDF = ({ presupuesto, onGenerate }) => {
  const getLogoPath = (sitioWeb) => {
    const logos = {
      'sitio_web_1': '/logo-sitio-1.png',
      'sitio_web_2': '/logo-sitio-2.png', 
      'sitio_web_3': '/logo-sitio-3.png'
    }
    return logos[sitioWeb] || '/logo-sitio-1.png'
  }

  const getSitioWebName = (sitioWeb) => {
    const nombres = {
      'sitio_web_1': 'Sitio Web 1 - Merchandising Corporativo',
      'sitio_web_2': 'Sitio Web 2 - Productos Personalizados',
      'sitio_web_3': 'Sitio Web 3 - Regalos Empresariales'
    }
    return nombres[sitioWeb] || 'CRM Merchandising'
  }

  const generatePDF = async () => {
    try {
      // Crear el contenido HTML del presupuesto
      const pdfContent = document.createElement('div')
      pdfContent.innerHTML = `
        <div style="padding: 30px; font-family: Arial, sans-serif; max-width: 800px; font-size: 16px; line-height: 1.4;">
          <!-- Header con logo específico -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
            <img src="${getLogoPath(presupuesto.sitio_web)}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;" />
            <h1 style="color: #374151; margin: 0; font-size: 20px; font-weight: 600;">${getSitioWebName(presupuesto.sitio_web)}</h1>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Presupuesto de Productos Personalizados</p>
          </div>

          <!-- Información del presupuesto -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
            <div>
              <h2 style="color: #374151; margin-bottom: 12px; font-size: 18px; font-weight: 600;">Presupuesto ${presupuesto.numero}</h2>
              <p style="margin: 4px 0; font-size: 16px;"><strong>Fecha:</strong> ${new Date(presupuesto.fecha).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 16px;"><strong>Válido hasta:</strong> ${new Date(presupuesto.fecha_validez).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 16px;"><strong>Estado:</strong> <span style="color: ${getEstadoColor(presupuesto.estado)}">${getEstadoLabel(presupuesto.estado)}</span></p>
            </div>
            <div style="text-align: right;">
              <h3 style="color: #374151; margin-bottom: 12px; font-size: 18px; font-weight: 600;">Datos del Cliente</h3>
              <p style="margin: 4px 0; font-size: 16px;"><strong>${presupuesto.cliente.nombre}</strong></p>
              <p style="margin: 4px 0; font-size: 16px;">${presupuesto.cliente.empresa}</p>
              <p style="margin: 4px 0; font-size: 16px;">${presupuesto.cliente.email}</p>
            </div>
          </div>

          <!-- Tabla de items -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 16px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 16px; font-weight: 600;">Descripción</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-size: 16px; font-weight: 600;">Cantidad</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: right; font-size: 16px; font-weight: 600;">Precio Unit.</th>
                <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: right; font-size: 16px; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${presupuesto.items.map(item => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 10px; font-size: 16px;">${item.descripcion}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: center; font-size: 16px;">${item.cantidad}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right; font-size: 16px;">${formatCurrency(item.precio_unitario)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right; font-size: 16px;">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totales -->
          <div style="margin-left: auto; width: 280px;">
            <div style="border: 1px solid #e5e7eb; padding: 15px; background-color: #f9fafb;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
                <span>Subtotal:</span>
                <span>${formatCurrency(presupuesto.subtotal)}</span>
              </div>
              ${presupuesto.descuento > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626; font-size: 16px;">
                  <span>Descuento:</span>
                  <span>-${formatCurrency(presupuesto.descuento)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
                <span>IVA (21%):</span>
                <span>${formatCurrency(presupuesto.impuestos)}</span>
              </div>
              <hr style="margin: 12px 0; border: none; border-top: 1px solid #374151;">
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600; color: #374151;">
                <span>TOTAL:</span>
                <span>${formatCurrency(presupuesto.total)}</span>
              </div>
            </div>
          </div>

          <!-- Notas -->
          ${presupuesto.notas ? `
            <div style="margin-top: 30px;">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Notas:</h3>
              <p style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 0;">
                ${presupuesto.notas}
              </p>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #d1d5db; padding-top: 20px;">
            <p>Gracias por confiar en nosotros para sus productos personalizados</p>
            <p>Este presupuesto es válido hasta la fecha indicada</p>
          </div>
        </div>
      `

      // Agregar el contenido al DOM temporalmente
      pdfContent.style.position = 'absolute'
      pdfContent.style.left = '-9999px'
      document.body.appendChild(pdfContent)

      // Generar el canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      // Remover el contenido temporal
      document.body.removeChild(pdfContent)

      // Crear el PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Descargar el PDF
      pdf.save(`Presupuesto_${presupuesto.numero}.pdf`)
      
      if (onGenerate) {
        onGenerate(true)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      if (onGenerate) {
        onGenerate(false)
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'borrador': return '#6b7280'
      case 'enviado': return '#dc2626'
      case 'en_espera': return '#d97706'
      case 'aprobado': return '#059669'
      case 'rechazado': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'borrador': return 'Borrador'
      case 'enviado': return 'Enviado'
      case 'en_espera': return 'En Espera'
      case 'aprobado': return 'Aprobado'
      case 'rechazado': return 'Rechazado'
      default: return estado
    }
  }

  return { generatePDF }
}

export default PresupuestoPDF

