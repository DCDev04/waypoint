// lib/auth/session.ts

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm/"

export type UserRole = "ADMIN" | "DEVELOPER" | "REPRESENTATIVE"
export type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId: string | null
}

// Call this in any Server Component or Server Action
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.email) return null
  // Fetch our extended user record (role, departmentId)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    departmentId: user.departmentId,
  }
}

// Convenience helpers
export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) throw new Error("UNAUTHENTICATED")
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) throw new Error("FORBIDDEN")
  return user
}

export async function requireAdminOrDeveloper() {
  const user = await requireAuth()
  if (user.role === "REPRESENTATIVE") throw new Error("FORBIDDEN")
  return user
}
