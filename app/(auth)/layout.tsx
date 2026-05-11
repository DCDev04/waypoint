export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md px-4">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Waypoint</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal workflow platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
