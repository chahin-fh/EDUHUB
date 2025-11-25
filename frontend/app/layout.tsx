import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduHub - Find Your Perfect Mentor",
  description:
    "Connect with industry experts and accelerate your learning journey on EduHub",
  generator: "EduHub",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navigation />
          <main className="flex-1 pt-16 md:pt-20">{children}</main>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
