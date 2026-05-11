// lib/db/schema.ts

import { sql } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"

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

export const workflows = pgTable(
  "workflows",
  {
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

    // Generated FTS column — Postgres keeps this in sync automatically
    searchVector: text("search_vector")
      .generatedAlwaysAs(
        sql`to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))`
      )
      .notNull(),
  },
  (table) => [
    // GIN index makes FTS queries fast even on large tables
    index("workflows_search_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${table.title}, '') || ' ' || coalesce(${table.content}, ''))`
    ),
  ]
)
export const workflowVersions = pgTable("workflow_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  versionNumber: text("version_number").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
