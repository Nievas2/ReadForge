import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Highlight } from "@/types";

interface PDFHighlightLayerProps {
  highlights: Highlight[];
  pageNumber: number;
  scale: number;
  onHighlightClick?: (highlight: Highlight) => void;
}

export function PDFHighlightLayer({
  highlights,
  pageNumber,
  scale,
  onHighlightClick,
}: PDFHighlightLayerProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber);

  // Obtener el tamaño real del canvas para calcular posiciones
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    // Actualizar inmediatamente y cuando cambie el escalado
    updateCanvasSize();
    
    // Pequeño delay para asegurar que el canvas esté renderizado
    const timer = setTimeout(updateCanvasSize, 100);
    
    return () => clearTimeout(timer);
  }, [scale, pageNumber]);

  if (canvasSize.width === 0 || canvasSize.height === 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
      }}
    >
      {pageHighlights.map((highlight) => (
        <div key={highlight.id}>
          {highlight.rects.map((rect, idx) => (
            <motion.div
              key={`${highlight.id}-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute pointer-events-auto cursor-pointer hover:opacity-50 transition-opacity"
              style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                backgroundColor: highlight.color,
                mixBlendMode: 'multiply',
              }}
              onClick={() => onHighlightClick?.(highlight)}
              title={highlight.text}
            />
          ))}
        </div>
      ))}
    </div>
  );
}