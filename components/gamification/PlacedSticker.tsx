"use client"

import { useRef } from "react"
import type { Sticker, StickerCorner } from "@/types"
import { cn } from "@/lib/utils"

const cornerClasses: Record<StickerCorner, string> = {
  "top-left": "left-2 top-2",
  "top-right": "right-2 top-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
}

interface PlacedStickerProps {
  sticker: Sticker
  corner: StickerCorner
  onMoveRequest: (stickerId: string) => void
}

export function PlacedSticker({
  sticker,
  corner,
  onMoveRequest,
}: PlacedStickerProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)

  const clearTimer = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  return (
    <button
      type="button"
      className={cn(
        "absolute z-10 grid size-10 touch-none place-items-center rounded-[35%] border-[3px] border-white bg-white text-2xl leading-none shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-transform hover:scale-110 active:scale-95",
        cornerClasses[corner],
      )}
      style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 18%))" }}
      aria-label={`${sticker.name}. Pulsa o mantén presionado para mover`}
      title={`${sticker.name} · pulsa para mover`}
      onPointerDown={(event) => {
        event.stopPropagation()
        longPressTriggered.current = false
        clearTimer()
        longPressTimer.current = setTimeout(() => {
          longPressTriggered.current = true
          onMoveRequest(sticker.id)
        }, 500)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()
        clearTimer()
      }}
      onPointerCancel={clearTimer}
      onPointerLeave={clearTimer}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        clearTimer()
        longPressTriggered.current = true
        onMoveRequest(sticker.id)
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (longPressTriggered.current) {
          longPressTriggered.current = false
          return
        }
        onMoveRequest(sticker.id)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.stopPropagation()
          onMoveRequest(sticker.id)
        }
      }}
    >
      {sticker.emoji}
    </button>
  )
}