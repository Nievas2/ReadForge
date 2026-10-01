"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, LockKeyhole, Trophy } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useUserStats } from "@/hooks/useUserStats"
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_UNLOCKED_EVENT,
  type Achievement,
} from "@/lib/achievements"
import { loadFromStorage } from "@/lib/storage"

const ACHIEVEMENTS_KEY = "unlocked_achievements"

type AchievementFilter = "all" | "unlocked" | "locked"

function getProgress(achievement: Achievement, stats: ReturnType<typeof useUserStats>["stats"]) {
  switch (achievement.metric) {
    case "pages":
      return {
        current: stats.totalPagesRead,
        target: achievement.target,
        label: `${stats.totalPagesRead.toLocaleString()} / ${achievement.target} páginas`,
      }
    case "books":
      return {
        current: stats.totalBooksCompleted,
        target: achievement.target,
        label: `${stats.totalBooksCompleted} / ${achievement.target} libros`,
      }
    case "streak":
      return {
        current: stats.currentStreak,
        target: achievement.target,
        label: `${stats.currentStreak} / ${achievement.target} días`,
      }
    case "dailyGoal":
      return {
        current: stats.todayReadingTime,
        target: stats.dailyGoalMinutes * 60,
        label: `${Math.floor(stats.todayReadingTime / 60)} / ${stats.dailyGoalMinutes} min`,
      }
    case "readingTime":
      return {
        current: stats.totalReadingTime,
        target: achievement.target,
        label: `${Math.floor(stats.totalReadingTime / 60)} / 60 min`,
      }
  }
}

export default function AchievementsPage() {
  const { stats } = useUserStats()
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [filter, setFilter] = useState<AchievementFilter>("all")

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setUnlockedIds(loadFromStorage<string[]>(ACHIEVEMENTS_KEY, []))
    })

    const handleUnlocked = (event: Event) => {
      const achievements = (event as CustomEvent<Achievement[]>).detail
      if (!achievements?.length) return
      setUnlockedIds((previous) => Array.from(new Set([
        ...previous,
        ...achievements.map((achievement) => achievement.id),
      ])))
    }

    window.addEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleUnlocked)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener(ACHIEVEMENT_UNLOCKED_EVENT, handleUnlocked)
    }
  }, [])

  const unlockedCount = ACHIEVEMENT_CATALOG.filter(({ achievement }) =>
    unlockedIds.includes(achievement.id),
  ).length
  const filteredAchievements = ACHIEVEMENT_CATALOG.filter(({ achievement }) => {
    const unlocked = unlockedIds.includes(achievement.id)
    return filter === "all" || (filter === "unlocked" ? unlocked : !unlocked)
  })

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-gray-100">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2 gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" /> Volver a la biblioteca
          </Link>
        </Button>

        <section className="mb-8 flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <Trophy className="size-4" /> Tu recorrido de lectura
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Logros</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {unlockedCount} de {ACHIEVEMENT_CATALOG.length} conseguidos
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Progreso total</span>
              <span>{Math.round((unlockedCount / ACHIEVEMENT_CATALOG.length) * 100)}%</span>
            </div>
            <Progress
              value={(unlockedCount / ACHIEVEMENT_CATALOG.length) * 100}
              className="h-2"
            />
          </div>
        </section>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as AchievementFilter)}>
          <TabsList className="mb-5">
            <TabsTrigger value="all">Todos ({ACHIEVEMENT_CATALOG.length})</TabsTrigger>
            <TabsTrigger value="unlocked">Conseguidos ({unlockedCount})</TabsTrigger>
            <TabsTrigger value="locked">
              Pendientes ({ACHIEVEMENT_CATALOG.length - unlockedCount})
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredAchievements.length === 0 && (
              <p className="col-span-full rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
                {filter === "unlocked"
                  ? "Todavía no conseguiste logros. Sigue leyendo para desbloquear el primero."
                  : "Ya desbloqueaste todos los logros disponibles."}
              </p>
            )}
            {filteredAchievements.map(({ achievement }) => {
              const unlocked = unlockedIds.includes(achievement.id)
              const progress = getProgress(achievement, stats)
              const percentage = unlocked
                ? 100
                : Math.min(100, Math.round((progress.current / progress.target) * 100))

              return (
                <Card
                  key={achievement.id}
                  className={unlocked ? "border-amber-500/30" : "opacity-85"}
                >
                  <CardContent className="flex gap-4 p-4 sm:p-5">
                    <div
                      className={`grid size-12 shrink-0 place-items-center rounded-md ${
                        unlocked
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {unlocked ? (
                        <Trophy className="size-5" />
                      ) : (
                        <LockKeyhole className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-semibold">{achievement.title}</h2>
                        <Badge variant={unlocked ? "default" : "secondary"}>
                          {unlocked ? <><Check /> Conseguido</> : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between gap-3 text-xs text-muted-foreground">
                          <span>Progreso</span>
                          <span className="text-right">{progress.label}</span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Tabs>
      </main>
    </div>
  )
}