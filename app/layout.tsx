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
import { CSPostHogProvider } from "@/lib/providers/posthog-provider"
import { ModalsProvider } from "@/lib/providers/modal"

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
    <html lang="de">
      <body className={cn(inter.className, "")}>
        <TanstackQueryProvider>
          <CSPostHogProvider>
            <ThemeProvider defaultTheme="light" enableSystem attribute="class">
              <NextAuthProvider>
                <Toaster />
                <ModalsProvider />
                {children}
                {/* requires page refresh for state update - can't be seen when changing login */}
                {user && <FeatureTutorial show={showFeaturesTutorial} />}
              </NextAuthProvider>
            </ThemeProvider>
          </CSPostHogProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
