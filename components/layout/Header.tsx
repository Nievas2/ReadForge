import { Moon, Sun, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoinDisplay } from "@/components/gamification/CoinDisplay"
import { StreakDisplay } from "@/components/gamification/StreakDisplay"
import { motion } from "framer-motion"

interface HeaderProps {
  coins: number
  streak: number
  theme: "light" | "dark" | "system"
  onToggleTheme: () => void
  onOpenShop: () => void
}

export function Header({
  coins,
  streak,
  theme,
  onToggleTheme,
  onOpenShop,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              ReadQuest
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Read. Earn. Collect.
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          <StreakDisplay streak={streak} className="hidden sm:flex" />
          <CoinDisplay coins={coins} />

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenShop}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Shop</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={onToggleTheme}>
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
