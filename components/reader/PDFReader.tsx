/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useCallback, useEffect, SetStateAction, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  X,
  Home,
  Loader2,
  Highlighter,
  Download,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CoinDisplay } from "@/components/gamification/CoinDisplay"
import { useReadingSession } from "@/hooks/useReadingSession"
import { useAnnotations } from "@/hooks/useAnnotations"
import type { PDFBook, ReadingProgress, HighlightRect } from "@/types"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { PDFHighlightLayer } from "@/components/PDFHighlighhtLayer"
import { exportAnnotatedPDF } from "@/lib/exportAnnotatedPDF"

interface PDFReaderProps {
  book: PDFBook
  initialProgress?: ReadingProgress
  coins: number
  equippedStickers: string[]
  onClose: () => void
  onProgressUpdate: (bookId: string, page: number, total: number) => void
  onCoinsEarned: (amount: number) => void
  onRecordReading: (time: number, pages: number) => void
  onBookUpdate: (bookId: string, updates: Partial<PDFBook>) => void
}

const HIGHLIGHT_COLORS = [
  { name: "Amarillo", value: "#ffeb3b" },
  { name: "Verde", value: "#4caf50" },
  { name: "Azul", value: "#2196f3" },
  { name: "Rosa", value: "#e91e63" },
  { name: "Naranja", value: "#ff9800" },
]

export function PDFReader({
  book,
  initialProgress,
  coins,
  equippedStickers,
  onClose,
  onProgressUpdate,
  onCoinsEarned,
  onRecordReading,
  onBookUpdate,
}: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(
    initialProgress?.currentPage || 1,
  )
  const [scale, setScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pageInputValue, setPageInputValue] = useState(String(pageNumber))
  const [isLoading, setIsLoading] = useState(true)
  const [showHighlightTools, setShowHighlightTools] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const { recordActivity, changePage } = useReadingSession({
    bookId: book.id,
    onCoinsEarned,
    onRecordReading,
  })

  const {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
  } = useAnnotations(book.id)

  // Track activity
  useEffect(() => {
    const handleActivity = () => recordActivity()

    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("scroll", handleActivity)
    window.addEventListener("click", handleActivity)

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("click", handleActivity)
    }
  }, [recordActivity])

  // Handle text selection for highlighting
  useEffect(() => {
    const handleSelection = () => {
      if (!showHighlightTools) return

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) return

      const range = selection.getRangeAt(0)
      const selectedText = selection.toString().trim()

      if (selectedText.length < 3) return

      // Get bounding rectangles
      const rects = Array.from(range.getClientRects())
      const pageElement = pageRef.current

      if (!pageElement || rects.length === 0) return

      const pageRect = pageElement.getBoundingClientRect()

      // Encontrar el canvas del PDF para obtener dimensiones reales
      const canvas = pageElement.querySelector("canvas")
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()

      // Normalizar coordenadas: convertir a porcentajes del canvas real
      const highlightRects: HighlightRect[] = rects.map((rect) => ({
        x: ((rect.left - canvasRect.left) / canvasRect.width) * 100,
        y: ((rect.top - canvasRect.top) / canvasRect.height) * 100,
        width: (rect.width / canvasRect.width) * 100,
        height: (rect.height / canvasRect.height) * 100,
      }))

      addHighlight(pageNumber, highlightRects, selectedText)
      selection.removeAllRanges()
    }

    document.addEventListener("mouseup", handleSelection)
    return () => document.removeEventListener("mouseup", handleSelection)
  }, [showHighlightTools, pageNumber, addHighlight])

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setIsLoading(false)

      if (book.totalPages !== numPages) {
        onBookUpdate(book.id, { totalPages: numPages })
      }
    },
    [book.id, book.totalPages, onBookUpdate],
  )

  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, numPages))
      changePage(newPage, numPages)
      setPageNumber(newPage)
      setPageInputValue(String(newPage))
      onProgressUpdate(book.id, newPage, numPages)
    },
    [numPages, book.id, changePage, onProgressUpdate],
  )

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      goToPage(pageNumber + 1)
    }
  }, [pageNumber, numPages, goToPage])

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      goToPage(pageNumber - 1)
    }
  }, [pageNumber, goToPage])

  const handlePageInput = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const page = parseInt(pageInputValue)
      if (!isNaN(page)) {
        goToPage(page)
      }
    },
    [pageInputValue, goToPage],
  )

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Si book.file está muerto, intentamos recuperarlo de la DB antes de fallar
      let bufferToUse = book.file
      if (bufferToUse.byteLength === 0) {
        const { getBook } = await import("@/lib/db")
        const freshBook = await getBook(book.id)
        if (freshBook) bufferToUse = freshBook.file
      }

      await exportAnnotatedPDF(bufferToUse, highlights, book.name)
    } catch (error) {
      console.error(error)
      alert(
        "Error al exportar: El archivo está en uso por el lector. Intenta recargar.",
      )
    } finally {
      setIsExporting(false)
    }
  }

  const progressPercent =
    numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0

  const stickerEmojis = equippedStickers.slice(0, 4)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goToPrevPage()
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          toggleFullscreen()
        } else {
          onClose()
        }
      } else if (e.key === "h" || e.key === "H") {
        setShowHighlightTools((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    pageNumber,
    numPages,
    isFullscreen,
    goToNextPage,
    goToPrevPage,
    toggleFullscreen,
    onClose,
  ])

  // Ctrl + wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          setScale((s) => Math.min(2, s + 0.1))
        } else {
          setScale((s) => Math.max(0.5, s - 0.1))
        }
      }
    }

    const mainElement = mainRef.current
    if (mainElement) {
      mainElement.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  // Dynamic load react-pdf
  const [PDFLib, setPDFLib] = useState<null | {
    Document: any
    Page: any
    pdfjs: any
  }>(null)

  useEffect(() => {
    let mounted = true
    import("react-pdf")
      .then((mod) => {
        if (!mounted) return
        mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`
        setPDFLib({ Document: mod.Document, Page: mod.Page, pdfjs: mod.pdfjs })
      })
      .catch((err) => {
        console.error("Error loading react-pdf:", err)
      })
    return () => {
      mounted = false
    }
  }, [])

  const memorizedFile = useMemo(() => {
    try {
      if (book.file && book.file.byteLength > 0) {
        return book.file.slice(0); // Creamos la copia aquí
      }
      return book.file;
    } catch (e) {
      console.error("Error al copiar el buffer para el visor", e);
      return book.file;
    }
  }, [book.file, book.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col",
        isFullscreen && "bg-[hsl(var(--reader-bg))]",
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Home className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-medium line-clamp-1">
              {book.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CoinDisplay coins={coins} showAnimation={false} />

          {/* Highlight tools */}
          <Button
            variant={showHighlightTools ? "default" : "ghost"}
            size="icon"
            onClick={() => setShowHighlightTools(!showHighlightTools)}
            title="Herramientas de subrayado (H)"
          >
            <Highlighter className="w-4 h-4" />
          </Button>

          {/* Export button */}
          {highlights.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              disabled={isExporting}
              title="Descargar PDF subrayado"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          )}

          <div className="hidden sm:flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Highlight toolbar */}
      <AnimatePresence>
        {showHighlightTools && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-card/80 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center gap-4">
              <span className="text-sm font-medium">Colores:</span>
              <div className="flex gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      selectedColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {highlights.length} subrayados
              </span>
              {highlights.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHighlights}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar todo
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-1 rounded-none" />

      {/* PDF Content */}
      <main
        ref={mainRef}
        className="flex-1 flex justify-center items-start overflow-auto p-4 relative"
      >
        {/* Stickers */}
        {stickerEmojis.length > 0 && (
          <>
            {stickerEmojis[0] && (
              <motion.div
                className="absolute top-8 left-8 text-4xl opacity-30 pointer-events-none z-10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {stickerEmojis[0]}
              </motion.div>
            )}
            {stickerEmojis[1] && (
              <motion.div
                className="absolute top-8 right-8 text-4xl opacity-30 pointer-events-none z-10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                {stickerEmojis[1]}
              </motion.div>
            )}
            {stickerEmojis[2] && (
              <motion.div
                className="absolute bottom-24 left-8 text-4xl opacity-30 pointer-events-none z-10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                {stickerEmojis[2]}
              </motion.div>
            )}
            {stickerEmojis[3] && (
              <motion.div
                className="absolute bottom-24 right-8 text-4xl opacity-30 pointer-events-none z-10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                {stickerEmojis[3]}
              </motion.div>
            )}
          </>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="flex gap-2 items-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Cargando PDF...</span>
            </div>
          </div>
        )}

        <div
          className="w-full max-w-full flex justify-center"
          style={{ userSelect: showHighlightTools ? "text" : "none" }}
        >
          {PDFLib && (
            <PDFLib.Document
              file={memorizedFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
              className="shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageNumber}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="w-full flex justify-center relative"
                  ref={pageRef}
                >
                  <div className="relative">
                    <PDFLib.Page
                      pageNumber={pageNumber}
                      renderAnnotationLayer={false}
                      scale={scale}
                      renderTextLayer={true}
                      className="reader-page text-black max-w-full"
                      width={
                        typeof window !== "undefined"
                          ? Math.min(window.innerWidth - 32, 800 * scale)
                          : undefined
                      }
                    />
                    {/* Highlight overlay */}
                    <PDFHighlightLayer
                      highlights={highlights}
                      pageNumber={pageNumber}
                      scale={scale}
                      onHighlightClick={(h) => {
                        if (window.confirm("¿Eliminar este subrayado?")) {
                          removeHighlight(h.id)
                        }
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </PDFLib.Document>
          )}
        </div>
      </main>

      {/* Navigation */}
      <footer className="flex items-center justify-between px-4 py-3 border-t bg-card/80 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <form onSubmit={handlePageInput} className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={numPages}
            value={pageInputValue}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setPageInputValue(e.target.value)
            }
            className="w-16 text-center"
          />
          <span className="text-muted-foreground">/ {numPages}</span>
        </form>

        <Button
          variant="outline"
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="gap-2"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </footer>
    </motion.div>
  )
}
