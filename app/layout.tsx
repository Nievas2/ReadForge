import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AchievementNotifier } from "@/components/gamification/AchievementNotifier"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ReadForge",
  description: "Una pagina para fomentar la lectura.",
  icons: {
    icon: "/logo.svg",
  },
  keywords: ["ReadForge", "Lectura", "Libros", "Libreria", "Biblioteca"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AchievementNotifier />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
