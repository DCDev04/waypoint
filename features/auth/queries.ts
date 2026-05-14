import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export const getDevelopers = async () => {
  const results = await db
    .select({ name: users.name, id: users.id })
    .from(users)
  return results
}
