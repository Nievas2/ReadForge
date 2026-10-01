"use client"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, Trophy, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useUserStats } from "@/hooks/useUserStats"
import { STAT_STICKER_TARGETS, useStickers } from "@/hooks/useStickers"
import { PlacedSticker } from "@/components/gamification/PlacedSticker"
import { StickerPlacementTarget } from "@/components/gamification/StickerPlacementTarget"
import type { Sticker, StickerCorner } from "@/types"

function CardSticker({
  sticker,
  corner,
  onMoveRequest,
}: {
  sticker: Sticker
  corner: StickerCorner
  onMoveRequest: (stickerId: string) => void
}) {
  return (
    <PlacedSticker sticker={sticker} corner={corner} onMoveRequest={onMoveRequest} />
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function StatsCards() {
  const { stats } = useUserStats()
  const {
    userStickers,
    allStickers,
    movingStickerId,
    beginStickerMove,
    cancelStickerMove,
    placeSticker,
  } = useStickers()
  const placements = userStickers.placements ?? {}
  const movingSticker = allStickers.find((sticker) => sticker.id === movingStickerId)
  const getStickerAt = (targetId: string) => {
    const placement = Object.entries(placements).find(([, item]) => item.targetId === targetId)
    if (!placement) return null
    const sticker = allStickers.find((item) => item.id === placement[0])
    return sticker ? { sticker, corner: placement[1].corner } : null
  }
  const placeAt = (stickerId: string, targetId: string, corner: StickerCorner) => {
    placeSticker(stickerId, targetId, corner)
    cancelStickerMove()
  }
  const dailyGoalPercent = Math.min(
    100,
    Math.round((stats.todayReadingTime / 60 / stats.dailyGoalMinutes) * 100),
  )

  return (
    <>
      {movingStickerId && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm">
          <span className="min-w-0 truncate">
            {movingSticker?.emoji} Elige una tarjeta y una esquina para colocar el sticker.
          </span>
          <Button size="sm" variant="ghost" onClick={cancelStickerMove}>
            Cancelar
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Daily Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card className="relative overflow-hidden">
          {getStickerAt(STAT_STICKER_TARGETS[0]) && (
            <CardSticker
              {...getStickerAt(STAT_STICKER_TARGETS[0])!}
              onMoveRequest={beginStickerMove}
            />
          )}
          <CardHeader className="pb-2 pr-8">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivo Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatTime(stats.todayReadingTime)}
              <span className="text-sm font-normal text-muted-foreground">
                / {stats.dailyGoalMinutes}m
              </span>
            </div>
            <Progress value={dailyGoalPercent} className="h-2" />
          </CardContent>
          {movingStickerId && (
            <StickerPlacementTarget
              targetId={STAT_STICKER_TARGETS[0]}
              label="Objetivo diario"
              movingStickerId={movingStickerId}
              placements={placements}
              onPlace={placeAt}
            />
          )}
        </Card>
      </motion.div>

      {/* Total Reading Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          {getStickerAt(STAT_STICKER_TARGETS[1]) && (
            <CardSticker
              {...getStickerAt(STAT_STICKER_TARGETS[1])!}
              onMoveRequest={beginStickerMove}
            />
          )}
          <CardHeader className="pb-2 pr-8">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tiempo de lectura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalReadingTime)}
            </div>
          </CardContent>
          {movingStickerId && (
            <StickerPlacementTarget
              targetId={STAT_STICKER_TARGETS[1]}
              label="Tiempo de lectura"
              movingStickerId={movingStickerId}
              placements={placements}
              onPlace={placeAt}
            />
          )}
        </Card>
      </motion.div>

      {/* Pages Read */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden">
          {getStickerAt(STAT_STICKER_TARGETS[2]) && (
            <CardSticker
              {...getStickerAt(STAT_STICKER_TARGETS[2])!}
              onMoveRequest={beginStickerMove}
            />
          )}
          <CardHeader className="pb-2 pr-8">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Páginas leídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPagesRead.toLocaleString()}
            </div>
          </CardContent>
          {movingStickerId && (
            <StickerPlacementTarget
              targetId={STAT_STICKER_TARGETS[2]}
              label="Páginas leídas"
              movingStickerId={movingStickerId}
              placements={placements}
              onPlace={placeAt}
            />
          )}
        </Card>
      </motion.div>

      {/* Books Completed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="relative overflow-hidden">
          {getStickerAt(STAT_STICKER_TARGETS[3]) && (
            <CardSticker
              {...getStickerAt(STAT_STICKER_TARGETS[3])!}
              onMoveRequest={beginStickerMove}
            />
          )}
          <CardHeader className="pb-2 pr-8">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Libros completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBooksCompleted}
            </div>
          </CardContent>
          {movingStickerId && (
            <StickerPlacementTarget
              targetId={STAT_STICKER_TARGETS[3]}
              label="Libros completados"
              movingStickerId={movingStickerId}
              placements={placements}
              onPlace={placeAt}
            />
          )}
        </Card>
      </motion.div>
      </div>
    </>
  )
}
