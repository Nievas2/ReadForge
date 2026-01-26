import { PDFDocument, rgb } from "pdf-lib"
import type { Highlight } from "@/types"

export async function exportAnnotatedPDF(
  originalPDF: ArrayBuffer,
  highlights: Highlight[],
  fileName: string,
): Promise<void> {
  // Verificación de seguridad inmediata
  if (originalPDF.byteLength === 0) {
    throw new Error("El buffer del PDF está vacío o desprendido.")
  }
  try {
    // Cargar el PDF original
    const pdfDoc = await PDFDocument.load(new Uint8Array(originalPDF))
    const pages = pdfDoc.getPages()

    // Aplicar highlights a cada página
    for (const highlight of highlights) {
      const page = pages[highlight.pageNumber - 1]
      if (!page) continue

      const { width: pageWidth, height: pageHeight } = page.getSize()

      // Convertir color hex a RGB
      const color = hexToRgb(highlight.color)

      // Dibujar cada rectángulo del highlight
      // Los rects están en porcentajes, convertir a coordenadas absolutas
      for (const rect of highlight.rects) {
        const x = (rect.x / 100) * pageWidth
        const y = (rect.y / 100) * pageHeight
        const width = (rect.width / 100) * pageWidth
        const height = (rect.height / 100) * pageHeight

        page.drawRectangle({
          x: x,
          y: pageHeight - y - height, // PDF usa coordenadas desde abajo
          width: width,
          height: height,
          color: rgb(color.r / 255, color.g / 255, color.b / 255),
          opacity: 0.3,
        })
      }
    }

    // Guardar y descargar
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}_ReadForge.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw error
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 235, b: 59 }
}
