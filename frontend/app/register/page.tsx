"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!formData.terms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      // Ici, vous pourriez ajouter un appel à votre API d'inscription
      console.log("Tentative d'inscription avec:", { 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName 
      });
      
      // Simulation de délai pour l'inscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection vers la page de connexion après inscription réussie
      router.push("/login?registered=true");
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      console.error("Erreur d'inscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Entrez vos informations pour créer un compte</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="first-name">
                  Prénom
                </label>
                <Input 
                  id="first-name" 
                  name="firstName"
                  placeholder="Jean" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="last-name">
                  Nom
                </label>
                <Input 
                  id="last-name" 
                  name="lastName"
                  placeholder="Dupont" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input 
                id="email" 
                name="email"
                placeholder="m@example.com" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Mot de passe
              </label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirm-password">
                Confirmer le mot de passe
              </label>
              <Input 
                id="confirm-password" 
                name="confirmPassword"
                type="password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                id="terms" 
                name="terms"
                type="checkbox" 
                className="rounded border-gray-300" 
                checked={formData.terms}
                onChange={handleChange}
                required 
              />
              <label className="text-sm" htmlFor="terms">
                J'accepte les conditions d'utilisation
              </label>
            </div>
            <Button 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Inscription en cours...' : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <Link className="underline" href="/login">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
