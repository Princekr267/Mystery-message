'use client'
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const user: User = session?.user as User

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
          Mystery Message
        </Link>
        <div className="flex items-center gap-4">
          {
            session ? (
              <>
                <span className="mr-4">
                  Welcome, {user?.email}
                </span>
                <Button className="w-full md:w-auto" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Link href={'/sign-in'}>
                <Button className="w-full md:w-auto">Login</Button>
              </Link>
            )
          }
        </div>
      </div>
    </nav>
  );
}

