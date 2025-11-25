'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

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
      localStorage.setItem('authToken', token);
      fetchUser(token);
    } else {
      router.push('/connexion');
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
