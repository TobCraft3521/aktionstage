import NextAuthProvider from "@/lib/providers/nextauthprovider"
import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/providers/theme-provider"
import { Inter, Istok_Web } from "next/font/google"
import { Toaster } from "react-hot-toast" // Import the 'Toaster' component from the appropriate module
import "./globals.css"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth/auth"
import { queryTutorialComplete } from "@/lib/actions/queries/tutorials"
import { Tutorial } from "@prisma/client"
import FeatureTutorial from "@/components/tutorials/features"

const inter = Inter({ subsets: ["latin"] })
const istokWeb = Istok_Web({ weight: "400", subsets: ["latin"] })
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
        <ThemeProvider defaultTheme="light" enableSystem attribute="class">
          <NextAuthProvider>
            <Toaster />
            {children}
            {/* requires page refresh for state update - can't be seen when changing login */}
            {user && <FeatureTutorial show={showFeaturesTutorial} />}
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
