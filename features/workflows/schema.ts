// features/workflows/schema.ts

import { z } from "zod"

export const workflowSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  departmentId: z.string().min(1, "Please select a department"),
  content: z.string().min(1, "Content cannot be empty"),
})

export type WorkflowFormValues = z.infer<typeof workflowSchema>
