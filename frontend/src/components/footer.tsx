'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EduHub</h3>
            <p className="text-muted-foreground text-sm">
              Plateforme d&apos;apprentissage en ligne offrant des cours de qualité avec des mentors expérimentés.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-sm font-semibold mb-4">LIENS RAPIDES</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cours" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tous les cours
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Nos mentors
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="text-sm font-semibold mb-4">CATÉGORIES</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cours/developpement" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Développement Web
                </Link>
              </li>
              <li>
                <Link href="/cours/design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/cours/marketing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Marketing Digital
                </Link>
              </li>
              <li>
                <Link href="/cours/business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">NEWSLETTER</h4>
            <p className="text-sm text-muted-foreground">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités et offres spéciales.
            </p>
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Votre email"
                className="flex-1"
                required
              />
              <Button type="submit" size="sm" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                S&apos;abonner
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EduHub. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/cgu" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
