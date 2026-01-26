"use client"
import { AnimatePresence, motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { BookCard } from "./BookCard"
import { PDFDropZone } from "./PDFDropZone"
import type { PDFBook } from "@/types"
import { useBooks } from "@/hooks/useBooks"
import { useCallback, useMemo } from "react"
import { useProgress } from "@/hooks/useProgress"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function BookLibrary() {
  const { books, addBook, deleteBook } = useBooks()
  const { allProgress } = useProgress()
  const { toast } = useToast()
  const router = useRouter()

  // Create progress map for library
  const progressMap = useMemo(() => {
    const map = new Map()
    allProgress.forEach((p) => map.set(p.bookId, p))
    return map
  }, [allProgress])

  const handleAddBook = useCallback(
    async (file: File) => {
      const book = await addBook(file)
      if (book) {
        toast({
          title: "Libro Agregado",
          description: `"${book.name}" fue agregado a tu libreria.`,
        })
      }
    },
    [addBook, toast],
  )

  const handleReadBook = useCallback(
    (book: PDFBook) => {
      router.push(`/reader/${book.id}`)
    },
    [router],
  )

  const handleDeleteBook = useCallback(
    (bookId: string) => {
      deleteBook(bookId)
      toast({
        title: "Book Removed",
        description: "The book has been removed from your library.",
      })
    },
    [deleteBook, toast],
  )

  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="p-6 rounded-full bg-secondary mb-6">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">
          Tú libreria está vacía
        </h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Agrega libros en formato PDF para comenzar a leer y realizar un
          seguimiento de tu progreso.
        </p>
        <PDFDropZone onFileAccepted={handleAddBook} className="max-w-md w-full" />
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Add new book */}
      <PDFDropZone onFileAccepted={handleAddBook} className="max-w-2xl mx-auto" />

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3  xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              progress={progressMap.get(book.id)}
              onRead={handleReadBook}
              onDelete={handleDeleteBook}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
