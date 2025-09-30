import { BookOpen } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-foreground-muted">Loading course request form...</p>
      </div>
    </div>
  )
}
