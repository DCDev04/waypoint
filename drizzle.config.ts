import { defineConfig } from "drizzle-kit"

import * as dotenv from "dotenv"
dotenv.config()

console.log(process.env.DATABASE_URL)

export default defineConfig({
  schema: ["./lib/db/schema.ts", "./lib/db/auth-schema.ts"],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
