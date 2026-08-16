"use client";

import { useCallback, useEffect, useState } from "react";
import MentorCard from "./mentor-card";
import { Users as UsersIcon } from "lucide-react";
import { getExpertiseLabel, type ExpertiseItem } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  monitorProfile?: {
    expertise: ExpertiseItem[];
    rating: number;
    verified: boolean;
  };
}

interface UserGridProps {
  subject: string;
  search: string;
}

export default function UserGrid({ subject, search }: UserGridProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:5000/api/usersList/public");
      const data = await res.json();

      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading users", error);
      setIsLoading(false);
    }
  }, []);

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    if (search.trim()) {
      const value = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(value) ||
          u.bio?.toLowerCase().includes(value) ||
          u.monitorProfile?.expertise?.some((e) =>
            getExpertiseLabel(e).toLowerCase().includes(value)
          )
      );
    }

    if (subject && subject !== "Tous") {
      const value = subject.toLowerCase();
      filtered = filtered.filter((u) =>
        u.monitorProfile?.expertise?.some((e) =>
          getExpertiseLabel(e).toLowerCase().includes(value)
        )
      );
    }

    setFilteredUsers(filtered);
  }, [users, search, subject]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [search, subject, users, filterUsers]);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2">Mentors</h2>
          <p className="text-muted-foreground">
            Discover all active mentors
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <MentorCard key={user._id} user={user} />
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <UsersIcon className="mx-auto w-10 h-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">No mentors found</h3>
            <p className="text-gray-500">
              Try changing your search or subject
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
