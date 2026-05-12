"use client"

import { useTransition } from "react"
import { submitForApproval } from "../actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SubmitButton({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = useTransition()
  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitForApproval(workflowId)
      if (result.success) {
        toast.success("Workflow submitted for approval.")
      } else {
        toast.error(result.error)
      }
    })
  }
  return (
    <Button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Submitting..." : "Submit for Approval"}
    </Button>
  )
}
