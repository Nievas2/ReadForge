import { motion } from "framer-motion"
import type { Highlight } from "@/types"

interface PDFHighlightLayerProps {
  highlights: Highlight[]
  pageNumber: number
  scale: number
  onHighlightClick?: (highlight: Highlight) => void
}

export function PDFHighlightLayer({
  highlights,
  pageNumber,
  scale,
  onHighlightClick,
}: PDFHighlightLayerProps) {
  const pageHighlights = highlights.filter((h) => h.pageNumber === pageNumber)

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {pageHighlights.map((highlight) => (
        <div key={highlight.id}>
          {highlight.rects.map((rect, idx) => (
            <motion.div
              key={`${highlight.id}-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${rect.x * scale}px`,
                top: `${rect.y * scale}px`,
                width: `${rect.width * scale}px`,
                height: `${rect.height * scale}px`,
                backgroundColor: highlight.color,
                mixBlendMode: "multiply",
              }}
              onClick={() => onHighlightClick?.(highlight)}
              title={highlight.text}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
