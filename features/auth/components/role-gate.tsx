import { getSessionUser, type UserRole } from "@/lib/auth/session"

type Props = {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export async function RoleGate({ allowedRoles, children, fallback }: Props) {
  const user = await getSessionUser()

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
