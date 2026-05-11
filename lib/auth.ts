import { betterAuth } from "better-auth"
import { db } from "./db"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "REPRESENTATIVE",
        input: false, // users can't set their own role on sign-up
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true, // caches session in a cookie — proxy reads this
      maxAge: 60 * 5, // refreshes every 5 minutes
    },
  },
})
