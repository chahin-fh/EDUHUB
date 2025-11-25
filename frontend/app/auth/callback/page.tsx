'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      // You might want to fetch user data here and store it as well
      router.push('/dashboard');
    } else {
      // Handle error or redirect to login
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
