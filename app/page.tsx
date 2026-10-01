import { Header } from "@/components/layout/Header"
import { BookLibrary } from "@/components/library/BookLibrary"
import { StatsCards } from "@/components/gamification/StatsCards"

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950 text-zinc-950 dark:text-gray-100">
      <Header />

      <main className="w-full px-4 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <StatsCards />
        </section>

        {/* Library */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-6">
            Tu libreria
          </h2>
          <BookLibrary />
        </section>
      </main>
    </div>
  )
}
