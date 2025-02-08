// app/providers.js
"use client"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { ReactNode } from "react"
import SuspendedPostHogPageView from "./page-view"

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  })
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PostHogProvider>
  )
}
