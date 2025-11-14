"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Briefcase, BookOpen, User, LayoutDashboard, LogOut, Sparkles, Target, Bot, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ThemeToggle from "@/components/ThemeToggle"
import { logout, isAuthenticated } from "@/lib/api"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on the demo page
  const isDemoPage = pathname === "/demo"

  useEffect(() => {
    // Don't check authentication on demo page
    if (!isDemoPage) {
      setIsAuth(isAuthenticated())
    } else {
      setIsAuth(false)
    }
  }, [pathname, isDemoPage])

  const handleLogout = () => {
    logout()
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/skill-gap", label: "Skill Gap", icon: Target },
    { href: "/roadmap", label: "AI Roadmap", icon: Route },
    { href: "/mentor", label: "Career Mentor", icon: Bot },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-white/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between ${isDemoPage ? 'h-20' : 'h-16'}`}>
          {/* Logo and Demo Badge */}
          <div className="flex items-center space-x-3">
            <Link href={isAuth ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                CareerBridge
              </span>
            </Link>
            
            {/* Demo Mode Badge - Integrated into navbar */}
            {isDemoPage && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-200/50 dark:border-blue-500/30">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-foreground leading-tight">Demo Mode</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Preview with sample data</p>
                </div>
                <div className="sm:hidden">
                  <p className="text-xs font-semibold text-foreground leading-tight">Demo</p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation - Hide on demo page */}
          {isAuth && !isDemoPage && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 group relative ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                        : "text-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    }`} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isDemoPage ? (
              // On demo page, show "Get Started" button instead
              <Button
                asChild
                className="hidden md:flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              >
                <Link href="/register">
                  <span>Get Started</span>
                </Link>
              </Button>
            ) : isAuth ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="hidden md:flex items-center space-x-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="hidden md:flex items-center space-x-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
              >
                <Link href="/login">
                  <span>Login</span>
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-lg hover:bg-white/5"
                >
                  {isOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-effect border-l border-white/10 w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Demo Mode Badge in Mobile Menu */}
                  {isDemoPage && (
                    <div className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-200/50 dark:border-blue-500/30 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">Demo Mode</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Preview with sample data</p>
                      </div>
                    </div>
                  )}
                  
                  {isAuth && !isDemoPage && navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-semibold"
                            : "text-foreground/80 hover:text-foreground hover:bg-white/5 font-medium"
                        }`}
                      >
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "group-hover:text-blue-400"
                        }`} />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                  {isDemoPage ? (
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200"
                    >
                      <span className="font-medium">Get Started</span>
                    </Link>
                  ) : isAuth ? (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-200 text-left w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-all duration-200"
                    >
                      <span className="font-medium">Login</span>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}