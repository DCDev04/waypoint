"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { ArrowRightFromLineIcon, ArrowRightToLineIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="w-full justify-start hover:text-foreground"
      >
        <ArrowRightToLineIcon />
        Sign out
      </Button>
    </div>
  )
}
