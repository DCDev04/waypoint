"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { SessionUser } from "@/lib/auth/session"

import { buttonVariants } from "./button"
import { JSX } from "react"
import { SignOutButton } from "@/features/auth/components/sign-out"

export function NavLinks({
  user,
  navItems,
}: {
  user: SessionUser
  navItems: {
    label: string
    href: string
    roles: string[]
    icon: JSX.Element
  }[]
}) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${buttonVariants({ variant: pathname === item.href ? "secondary" : "ghost" })} w-full justify-start rounded-2xl`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
      <div>
        <SignOutButton />
      </div>
    </nav>
  )
}
