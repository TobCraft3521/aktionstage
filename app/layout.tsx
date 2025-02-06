import FeatureTutorial from "@/components/tutorials/features"
import { queryTutorialComplete } from "@/lib/actions/queries/tutorials"
import { auth } from "@/lib/auth/auth"
import NextAuthProvider from "@/lib/providers/nextauthprovider"
import { ThemeProvider } from "@/lib/providers/theme-provider"
import { cn } from "@/lib/utils"
import { Tutorial } from "@prisma/client"
import { QueryClientProvider } from "@tanstack/react-query"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast" // Import the 'Toaster' component from the appropriate module
import "./globals.css"
import TanstackQueryProvider from "@/lib/providers/tanstack-query-provider"

const inter = Inter({ subsets: ["latin"] })
export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Aktionstage ASG",
  description: "Offizielle Website der Aktionstage am ASG",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = (await auth())?.user
  const showFeaturesTutorial = !(await queryTutorialComplete(Tutorial.FEATURES))

  return (
    <html suppressHydrationWarning lang="de">
      <body className={cn(inter.className, "")}>
        <TanstackQueryProvider>
          <ThemeProvider defaultTheme="light" enableSystem attribute="class">
            <NextAuthProvider>
              <Toaster />
              {children}
              {/* requires page refresh for state update - can't be seen when changing login */}
              {user && <FeatureTutorial show={showFeaturesTutorial} />}
            </NextAuthProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
