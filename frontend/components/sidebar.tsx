"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  MessageSquare,
  GraduationCap,
  LayoutDashboard,
  User,
  LogOut,
  Bell,
  Menu,
  X,

  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Build nav links based on auth status
  const mainLinks = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Cours", href: "/cours", icon: BookOpen },
    { name: "Apprendre", href: "/apprendre", icon: GraduationCap },
    { name: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const authLinks = isAuthenticated
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Demandes", href: "/demandes", icon: Bell },
        { name: "Profil", href: "/profile", icon: User },
      ]
    : [];

  const adminLinks =
    isAuthenticated && user?.role === "admin"
      ? [
          { name: "Admin", href: "/admin", icon: Settings },
          { name: "Utilisateurs", href: "/users", icon: Users },
        ]
      : [];

  const allNavLinks = [...mainLinks, ...authLinks, ...adminLinks];

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: -320, opacity: 0, transition: { duration: 0.2 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.3 },
    }),
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile hamburger button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 lg:hidden flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 hidden lg:flex flex-col w-64",
          "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
          "shadow-lg shadow-black/5"
        )}
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Logo */}
        <div className="flex items-center h-16 md:h-20 px-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                duHub
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {allNavLinks.map((link, i) => {
            const isActive = isActiveLink(link.href);
            const Icon = link.icon;
            return (
              <motion.div
                key={link.name}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className={cn(
                      "h-5 w-5 transition-transform",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-dot"
                        className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="truncate">{link.name}</span>

                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom section - User & Theme */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <ThemeToggle />
          </div>

          {isAuthenticated && user ? (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="focus:outline-none relative w-full"
                  >
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9 ring-2 ring-blue-100 dark:ring-blue-900 hover:ring-blue-300 transition-all">
                          <AvatarImage src={user.avatar} alt={user.username || "User"} />
                          <AvatarFallback className="font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                            {(user.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {user.username || "User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email || ""}
                          </p>
                        </div>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  className="w-56 border-gray-100 dark:border-gray-800 shadow-xl ml-2"
                >
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {(user.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user.username || "User"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email || ""}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/demandes" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Mes demandes</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/connexion"
                className="block w-full text-center px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar (overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-2xl lg:hidden"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  duHub
                </span>
              </Link>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {allNavLinks.map((link, i) => {
                const isActive = isActiveLink(link.href);
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    custom={i}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-indicator"
                          className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile bottom section */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thème</span>
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {(user?.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/connexion"
                    onClick={() => setIsMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setIsMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
