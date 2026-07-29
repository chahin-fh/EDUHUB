"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Loader2, Mail, Phone, MapPin } from "lucide-react";

interface Mentor {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
  verified: boolean;
  role: string;
}

interface MentorsDisplayProps {
  selectedSubject?: string;
}

export default function MentorsDisplay({
  selectedSubject,
}: MentorsDisplayProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedSubject, setLocalSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (selectedSubject) params.append("subject", selectedSubject);

        const response = await fetch(
          `http://localhost:5000/api/mentors?${params}`
        );
        if (response.ok) {
          const data = await response.json();
          setMentors(data);

          // Extract unique subjects from mentors
          const uniqueSubjects: string[] = Array.from(
            new Set(data.flatMap((mentor: Mentor) => mentor.expertise || []))
          );
          setSubjects(uniqueSubjects);
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [searchTerm, selectedSubject]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Moniteurs disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Moniteurs disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom de moniteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSubject || ""}
            onChange={(e) => setLocalSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les matières</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Mentors List */}
        {mentors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchTerm || selectedSubject
              ? "Aucun moniteur trouvé pour vos critères"
              : "Aucun moniteur disponible pour le moment"}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <Card
                key={mentor._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name?.charAt(0)?.toUpperCase() ||
                          mentor.username?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {mentor.name || mentor.username}
                        </h3>
                        {mentor.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      {mentor.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {mentor.bio}
                        </p>
                      )}

                      {/* Expertise */}
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {mentor.expertise.slice(0, 3).map((exp, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {exp}
                              </Badge>
                            ))}
                            {mentor.expertise.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{mentor.expertise.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {mentor.email}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          // Handle contact or profile view
                          console.log("Contact mentor:", mentor._id);
                        }}
                      >
                        Contacter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
