"use client"

import { useEffect } from "react"
import { Sparkles, Trophy, X } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {
  ACHIEVEMENT_UNLOCKED_EVENT,
  type Achievement,
} from "@/lib/achievements"

function playAchievementSound() {
  try {
    const context = new window.AudioContext()
    void context.resume().then(() => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startAt = context.currentTime

      oscillator.type = "triangle"
      oscillator.frequency.setValueAtTime(659.25, startAt)
      oscillator.frequency.setValueAtTime(783.99, startAt + 0.13)
      oscillator.frequency.setValueAtTime(987.77, startAt + 0.27)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.11, startAt + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.7)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + 0.72)
      oscillator.onended = () => void context.close()
    }).catch(() => void context.close())
  } catch {
    // Audio is optional; the achievement notification should still appear.
  }
}

export function AchievementNotifier() {
  useEffect(() => {
    const handleAchievements = (event: Event) => {
      const achievements = (event as CustomEvent<Achievement[]>).detail
      if (!achievements?.length) return

      playAchievementSound()
      achievements.forEach((achievement) => {
        toast.custom(
          (id) => (
            <div className="flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 rounded-lg border border-amber-500/40 bg-background p-3 text-foreground shadow-xl">
              <div className="grid size-11 shrink-0 place-items-center rounded-md bg-amber-500/15 text-amber-500">
                <Trophy className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-amber-500">
                  <Sparkles className="size-3" /> Logro desbloqueado
                </div>
                <p className="mt-0.5 truncate text-sm font-semibold">
                  {achievement.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              <button
                type="button"
                className="grid size-7 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Cerrar notificación"
                onClick={() => toast.dismiss(id)}
              >
                <X className="size-4" />
              </button>
            </div>
          ),
          { duration: 6000, position: "top-right" },
        )
      })
    }

    window.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleAchievements)
    return () => window.removeEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleAchievements)
  }, [])

  return <Toaster position="top-right" />
}