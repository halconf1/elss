import type { ReporteDatos } from './stats'
import { formatearFecha } from './fechas'
import type { jsPDF as JsPdfType } from 'jspdf'

function linea(doc: JsPdfType, etiqueta: string, valor: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.text(etiqueta, 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(valor, 76, y)
  return y + 8
}

export async function descargarReportePdf(datos: ReporteDatos, periodo: string, desde?: string, hasta?: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const tituloPeriodo = desde && hasta ? `${formatearFecha(desde)} - ${formatearFecha(hasta)}` : periodo
  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Elss', 16, y)
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Reporte: ${tituloPeriodo}`, 16, y)
  y += 12

  y = linea(doc, 'Días con dato', `${datos.total}`, y)
  y = linea(doc, 'Días bien', `${datos.bien} de ${datos.total}`, y)
  y = linea(doc, 'Días con molestia', `${datos.conMolestia} de ${datos.total}`, y)
  y = linea(doc, 'Dolor promedio', datos.dolorPromedio === null ? 'Sin dato' : `${datos.dolorPromedio} de 10`, y)
  y = linea(doc, 'Dolor máximo', datos.dolorMaximo === null ? 'Sin dato' : `${datos.dolorMaximo} de 10`, y)
  y = linea(doc, 'Rigidez > 30 min', `${datos.rigidezMas30} de ${datos.total}`, y)
  y = linea(doc, 'Rigidez > 1 hora', `${datos.rigidezMas60} de ${datos.total}`, y)
  y = linea(doc, 'Inflamación visible', `${datos.inflamacionVisible} de ${datos.total}`, y)
  y = linea(doc, 'Calor/enrojecimiento', `${datos.calorEnrojecimiento} de ${datos.total}`, y)
  y = linea(doc, 'Mejora al moverse', `${datos.mejoraMovimiento} de ${datos.total}`, y)
  y = linea(doc, 'Empeora al moverse', `${datos.empeoraMovimiento} de ${datos.total}`, y)

  y += 4
  doc.setFont('helvetica', 'bold')
  doc.text('Zonas frecuentes', 16, y)
  doc.setFont('helvetica', 'normal')
  y += 7
  doc.text(datos.zonasFrecuentes.slice(0, 6).map((item) => `${item.nombre} (${item.total})`).join(', ') || 'Sin dato', 16, y, { maxWidth: 180 })

  y += 14
  doc.setFont('helvetica', 'bold')
  doc.text('Factores recurrentes', 16, y)
  doc.setFont('helvetica', 'normal')
  y += 7
  doc.text(datos.factoresFrecuentes.slice(0, 6).map((item) => `${item.nombre} (${item.total})`).join(', ') || 'Sin dato', 16, y, { maxWidth: 180 })

  y += 14
  doc.setFont('helvetica', 'bold')
  doc.text('Notas de días con molestia', 16, y)
  y += 7
  doc.setFont('helvetica', 'normal')

  const notas = datos.notasMolestia.length
    ? datos.notasMolestia.map((nota) => `${formatearFecha(nota.fecha)}: ${nota.nota}`)
    : ['Sin notas registradas.']

  for (const nota of notas.slice(0, 8)) {
    const lineas = doc.splitTextToSize(nota, 180) as string[]
    doc.text(lineas, 16, y)
    y += lineas.length * 5 + 3
    if (y > 250) break
  }

  doc.save(`elss-reporte-${new Date().toISOString().slice(0, 10)}.pdf`)
}
