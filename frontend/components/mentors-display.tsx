"use client";

import { API_BASE } from "@/lib/api-config";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Loader2,
  Star,
  Award,
  ArrowRight,
  Mail,
} from "lucide-react";
import { getExpertiseLabel, type ExpertiseItem } from "@/lib/utils";

interface SubjectRef {
  _id: string;
  name: string;
  slug?: string;
}

interface Mentor {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  monitorProfile?: {
    expertise?: ExpertiseItem[];
    verified?: boolean;
    rating?: number;
    ratingsCount?: number;
    coursesCreated?: number;
  };
}

interface MentorsDisplayProps {
  selectedSubject?: string;
}

function getInitial(mentor: Mentor) {
  return (mentor.name || mentor.username || "U").charAt(0).toUpperCase();
}

export default function MentorsDisplay({
  selectedSubject,
}: MentorsDisplayProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/mentors`);
        if (response.ok) {
          const data = await response.json();
          setMentors(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return mentors.filter((mentor) => {
      const labels = (mentor.monitorProfile?.expertise || []).map((e) =>
        getExpertiseLabel(e).toLowerCase()
      );

      const matchesSearch =
        !query ||
        mentor.name?.toLowerCase().includes(query) ||
        mentor.username?.toLowerCase().includes(query) ||
        labels.some((label) => label.includes(query));

      const matchesSubject =
        !selectedSubject ||
        labels.some((label) => label === selectedSubject.toLowerCase());

      return matchesSearch && matchesSubject;
    });
  }, [mentors, searchTerm, selectedSubject]);

  const renderStars = (rating = 0) =>
    [1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i <= Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200"
        }`}
      />
    ));

  const expertise = (mentor: Mentor) => mentor.monitorProfile?.expertise || [];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Mentors disponibles</h3>
            <p className="text-xs text-gray-500">
              {filteredMentors.length} mentor
              {filteredMentors.length > 1 ? "s" : ""}
              {selectedSubject ? ` · ${selectedSubject}` : ""}
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un mentor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/50 border-gray-200 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedSubject
                ? "Aucun mentor ne correspond à vos critères"
                : "Aucun mentor disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {filteredMentors.map((mentor) => (
              <Link
                key={mentor._id}
                href={`/users/${mentor._id}`}
                className="block group"
              >
                <div className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-blue-50/40 group-hover:from-blue-50 group-hover:to-purple-50">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                      <AvatarImage src={mentor.avatar} alt={mentor.name || mentor.username} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                        {getInitial(mentor)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {mentor.name || mentor.username}
                        </h4>
                        {mentor.monitorProfile?.verified && (
                          <Award className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {renderStars(mentor.monitorProfile?.rating)}
                        <span className="text-xs text-gray-400 ml-1">
                          ({mentor.monitorProfile?.ratingsCount || 0})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {expertise(mentor).slice(0, 2).map((exp, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[11px] bg-blue-50 text-blue-700 border-blue-100"
                          >
                            {getExpertiseLabel(exp)}
                          </Badge>
                        ))}
                        {expertise(mentor).length > 2 && (
                          <Badge variant="secondary" className="text-[11px] bg-gray-50">
                            +{expertise(mentor).length - 2}
                          </Badge>
                        )}
                      </div>
                      {mentor.bio && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {mentor.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 truncate">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{mentor.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
