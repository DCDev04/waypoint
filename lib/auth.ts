import { betterAuth } from "better-auth"
import { db } from "./db"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
})
