"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface ExpertiseItem {
  subject: string | { _id: string; name: string; slug: string };
  level: string;
  verified?: boolean;
}

interface LearningGoal {
  subject: string | { _id: string; name: string; slug: string };
  level: string;
}

interface MonitorProfile {
  expertise: ExpertiseItem[];
  verified: boolean;
  rating: number;
  ratingsCount: number;
  coursesCreated: number;
}

interface User {
  _id?: string;
  id: string;
  email: string;
  username: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  city?: string;
  country?: string;
  github?: string;
  linkedin?: string;
  about?: string;
  bio?: string;
  emailVerified?: boolean;
  expertise?: string[];
  role?: string;
  isMonitor?: boolean;
  monitorProfile?: MonitorProfile;
  learningGoals?: LearningGoal[];
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Vérification de la validité du token (simple validation)
const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    const parts = token.split(".");
    return parts.length === 3;
  } catch {
    return false;
  }
};

// Vérification si le token est expiré (pour JWT)
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (
          storedUser &&
          token &&
          isTokenValid(token) &&
          !isTokenExpired(token)
        ) {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    if (isTokenValid(token)) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      console.error("Invalid token provided");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    if (window.location.pathname !== "/connexion") {
      router.push("/connexion");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
