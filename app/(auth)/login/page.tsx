import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"
import { getSessionUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect("/workflows")
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Waypoint account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Dont have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
