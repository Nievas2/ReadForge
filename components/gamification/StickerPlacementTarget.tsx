"use client"

import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight } from "lucide-react"
import type { StickerCorner, StickerPlacement } from "@/types"

const corners: {
  value: StickerCorner
  label: string
  position: string
  Icon: typeof ArrowUpLeft
}[] = [
  { value: "top-left", label: "Esquina superior izquierda", position: "left-2 top-2", Icon: ArrowUpLeft },
  { value: "top-right", label: "Esquina superior derecha", position: "right-2 top-2", Icon: ArrowUpRight },
  { value: "bottom-left", label: "Esquina inferior izquierda", position: "bottom-2 left-2", Icon: ArrowDownLeft },
  { value: "bottom-right", label: "Esquina inferior derecha", position: "bottom-2 right-2", Icon: ArrowDownRight },
]

interface StickerPlacementTargetProps {
  targetId: string
  label: string
  movingStickerId: string
  placements: Record<string, StickerPlacement>
  onPlace: (stickerId: string, targetId: string, corner: StickerCorner) => void
}

export function StickerPlacementTarget({
  targetId,
  label,
  movingStickerId,
  placements,
  onPlace,
}: StickerPlacementTargetProps) {
  const occupied = Object.entries(placements).some(
    ([stickerId, placement]) =>
      stickerId !== movingStickerId && placement.targetId === targetId,
  )

  return (
    <div
      className="absolute inset-0 z-20 rounded-[inherit] bg-background/70 backdrop-blur-[2px]"
      onClick={(event) => event.stopPropagation()}
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-background/90 px-2 py-1 text-center text-xs font-medium shadow-sm">
        {occupied ? "Este lugar ya está ocupado" : `Colocar en ${label}`}
      </span>
      {corners.map(({ value, label: cornerLabel, position, Icon }) => (
        <button
          key={value}
          type="button"
          className={`absolute ${position} grid size-9 place-items-center rounded-md border bg-background text-foreground shadow-md transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40`}
          disabled={occupied}
          aria-label={`${label}: ${cornerLabel}`}
          title={`${label}: ${cornerLabel}`}
          onClick={(event) => {
            event.stopPropagation()
            onPlace(movingStickerId, targetId, value)
          }}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}