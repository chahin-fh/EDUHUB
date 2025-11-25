"use client";


import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';


function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    const fetchUser = async (authToken: string) => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData = await res.json();
        localStorage.setItem('user', JSON.stringify(userData));
        router.push('/dashboard');
      } catch (error) {
        console.error(error);
        router.push('/connexion');
      }
    };

    if (token) {
<<<<<<< HEAD
      localStorage.setItem("authToken", token);
      // You might want to fetch user data here and store it as well
      router.push("/dashboard");
    } else {
      // Handle error or redirect to login
      router.push("/connexion");
=======
      localStorage.setItem('authToken', token);
      fetchUser(token);
    } else {
      router.push('/connexion');
>>>>>>> 30fbff93f9fe6dd7e7bd59b2c37c0b91a77335b2
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg">Authentification en cours...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
