/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useCallback, useEffect, SetStateAction } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CoinDisplay } from "@/components/gamification/CoinDisplay"
import { useReadingSession } from "@/hooks/useReadingSession"
import type { PDFBook, ReadingProgress } from "@/types"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Set up PDF.js worker (moved to dynamic load)
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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
    initialProgress?.currentPage || 1
  )
  const [scale, setScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pageInputValue, setPageInputValue] = useState(String(pageNumber))
  const [isLoading, setIsLoading] = useState(true)

  const { recordActivity, changePage } = useReadingSession({
    bookId: book.id,
    onCoinsEarned,
    onRecordReading,
  })

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


  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setIsLoading(false)

      // Update book with total pages if not set
      if (book.totalPages !== numPages) {
        onBookUpdate(book.id, { totalPages: numPages })
      }
    },
    [book.id, book.totalPages, onBookUpdate]
  )

  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, numPages))
      changePage(newPage, numPages)
      setPageNumber(newPage)
      setPageInputValue(String(newPage))
      onProgressUpdate(book.id, newPage, numPages)
    },
    [numPages, book.id, changePage, onProgressUpdate]
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
    [pageInputValue, goToPage]
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

  const progressPercent =
    numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0

  // Get sticker emojis for decoration
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
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pageNumber, numPages, isFullscreen, goToNextPage, goToPrevPage, toggleFullscreen, onClose])

  // Dynamic load react-pdf to avoid server-side evaluation (DOMMatrix error)
  const [PDFLib, setPDFLib] = useState<null | {
    Document: any
    Page: any
    pdfjs: any
  }>(null)

  useEffect(() => {
    let mounted = true
    import("react-pdf").then((mod) => {
      if (!mounted) return
      // set worker after loading pdfjs
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`
      setPDFLib({ Document: mod.Document, Page: mod.Page, pdfjs: mod.pdfjs })
    }).catch((err) => {
      console.error("Error loading react-pdf:", err)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col",
        isFullscreen && "bg-[hsl(var(--reader-bg))]"
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

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-1 rounded-none" />

      {/* PDF Content */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
        {/* Equipped sticker decorations */}
        {stickerEmojis.length > 0 && (
          <>
            {stickerEmojis[0] && (
              <motion.div
                className="absolute top-8 left-8 text-4xl opacity-30 pointer-events-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {stickerEmojis[0]}
              </motion.div>
            )}
            {stickerEmojis[1] && (
              <motion.div
                className="absolute top-8 right-8 text-4xl opacity-30 pointer-events-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                {stickerEmojis[1]}
              </motion.div>
            )}
            {stickerEmojis[2] && (
              <motion.div
                className="absolute bottom-24 left-8 text-4xl opacity-30 pointer-events-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                {stickerEmojis[2]}
              </motion.div>
            )}
            {stickerEmojis[3] && (
              <motion.div
                className="absolute bottom-24 right-8 text-4xl opacity-30 pointer-events-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                {stickerEmojis[3]}
              </motion.div>
            )}
          </>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="animate-pulse text-muted-foreground">
              Loading PDF...
            </div>
          </div>
        )}

        {PDFLib ? (
          <PDFLib.Document
            file={book.file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            className="shadow-2xl rounded-lg overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pageNumber}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <PDFLib.Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="reader-page"
                />
              </motion.div>
            </AnimatePresence>
          </PDFLib.Document>
        ) : (
          <div className="text-muted-foreground">Loading PDF renderer...</div>
        )}
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
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <form onSubmit={handlePageInput} className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={numPages}
            value={pageInputValue}
            onChange={(e: { target: { value: SetStateAction<string> } }) => setPageInputValue(e.target.value)}
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
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </footer>
    </motion.div>
  )
}
