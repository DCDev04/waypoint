// lib/db/schema.ts

import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core"

// --- Enums ---
export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "DEVELOPER",
  "REPRESENTATIVE",
])

export const workflowStatusEnum = pgEnum("workflow_status", [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
])

// --- Tables ---
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("REPRESENTATIVE"),
  departmentId: uuid("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  status: workflowStatusEnum("status").notNull().default("DRAFT"),
  version: text("version").notNull().default("1"),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
