import Link from "next/link"
import { Zap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">404 Error</p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Page not found
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
          <Link
            href="/projects"
            className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
