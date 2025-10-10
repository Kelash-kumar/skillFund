"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  CreditCard,
  Menu,
  LogOut,
  User,
} from "lucide-react"

const studentNavItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: Home },
  { href: "/student/courses", label: "Browse Courses", icon: BookOpen },
  { href: "/student/applications", label: "My Applications", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
]

const donorNavItems = [
  { href: "/donor/dashboard", label: "Dashboard", icon: Home },
  { href: "/payment", label: "Make Donation", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
]

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/applications", label: "Applications", icon: BookOpen },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/donation-bank", label: "Donation Bank", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (!session) return null

  const getNavItems = () => {
    switch (session.user.userType) {
      case "student":
        return studentNavItems
      case "donor":
        return donorNavItems
      case "admin":
        return adminNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const NavContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-background border-r">
      {/* Logo Section */}
      <div className="p-6 border-b bg-card/60 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-foreground">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          SkillFund
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground-muted hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{session.user.name}</p>
            <p className="text-xs text-foreground-muted capitalize">{session.user.userType}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <NavContent />
      </div>

      {/* Mobile Header & Sheet */}
      <div className="lg:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 border-b bg-card/90 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            SkillFund
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
