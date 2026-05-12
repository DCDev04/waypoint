"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ActionResult } from "../types"
import { Loader2 } from "lucide-react"

type ActionButtonProps = {
  action: () => Promise<ActionResult>

  idleText: string
  pendingText: string
  successMessage: string

  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"

  disabled?: boolean
}

export function ActionButton({
  action,
  idleText,
  pendingText,
  successMessage,
  disabled,
  variant,
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const handleClick = () => {
    startTransition(async () => {
      const result = await action()

      if (result.success) {
        toast.success(successMessage)
      } else {
        toast.error(result.error)
      }
    })
  }
  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      variant={variant}
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}

      {isPending ? pendingText : idleText}
    </Button>
  )
}
