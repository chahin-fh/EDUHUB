// components/navigation.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  BookOpen,
  Users,
  MessageSquare,
  Home,
  LogOut,
  LayoutDashboard,
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


export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Cours", href: "/cours", icon: BookOpen },
    { name: "Trouver un Mentor", href: "/mentors", icon: Users },
    { name: "Contact", href: "/contact", icon: MessageSquare },
  ];

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                EduHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-gray-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.username || 'User'} />
                      <AvatarFallback className="font-semibold bg-blue-500 text-white">
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.username || 'User'} />
                      <AvatarFallback className="font-semibold text-xs bg-blue-500 text-white">
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.username || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email || ''}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 pb-2 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.username || ''} />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                     <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary" onClick={() => setIsOpen(false)}><LayoutDashboard className="h-5 w-5" /><span>Tableau de bord</span></Link>
                     {user?.role === 'admin' && (
                       <Link href="/admin" className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary" onClick={() => setIsOpen(false)}><LayoutDashboard className="h-5 w-5" /><span>Admin Dashboard</span></Link>
                     )}
                     <Link href="#" className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary" onClick={() => setIsOpen(false)}><User className="h-5 w-5" /><span>Mon Profil</span></Link>
                     <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary"><LogOut className="h-5 w-5" /><span>Déconnexion</span></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 px-4">
                  <Link
                    href="/connexion"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="block w-full text-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
