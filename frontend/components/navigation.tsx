"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EH</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">EDUHUB</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="text-sm font-medium hover:text-primary transition">
              HOME
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition">
              DISCOVER
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition">
              CONTACT
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2 rounded-full border border-border hover:bg-muted transition text-sm font-medium">
              Login
            </button>
            <button className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition text-sm font-medium">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            <Link href="#home" className="block px-4 py-2 hover:bg-muted rounded">
              HOME
            </Link>
            <Link href="#about" className="block px-4 py-2 hover:bg-muted rounded">
              DISCOVER
            </Link>
            <Link href="#contact" className="block px-4 py-2 hover:bg-muted rounded">
              CONTACT
            </Link>
            <button className="w-full text-left px-4 py-2 hover:bg-muted rounded text-sm">Login</button>
            <button className="w-full px-4 py-2 bg-primary text-white rounded text-sm">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  )
}
