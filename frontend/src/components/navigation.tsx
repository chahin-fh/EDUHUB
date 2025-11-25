'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, MessageSquare, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Cours', href: '/cours', icon: BookOpen },
  { name: 'Mentors', href: '/mentors', icon: User },
  { name: 'Contact', href: '/contact', icon: MessageSquare },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Gestion du défilement pour l'effet de rétrécissement
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduHub</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Button
                  key={link.name}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'flex items-center space-x-2',
                    isActive ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Boutons d'authentification desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/connexion" className="flex items-center">
                <LogIn className="h-4 w-4 mr-2" />
                Connexion
              </Link>
            </Button>
            <Button asChild>
              <Link href="/inscription">
                S&apos;inscrire
              </Link>
            </Button>
          </div>

          {/* Bouton menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-1 py-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Button
                    key={link.name}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive ? 'font-medium' : 'text-muted-foreground'
                    )}
                  >
                    <Link href={link.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>

            <div className="py-2 border-t space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/connexion" className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/inscription">
                  Créer un compte
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
