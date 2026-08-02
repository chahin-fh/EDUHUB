"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Loader2, Search, GraduationCap, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subject {
  _id: string;
  name: string;
}

interface SubjectsDisplayProps {
  onSubjectClick?: (subject: string) => void;
  selectedSubject?: string;
}

export default function SubjectsDisplay({
  onSubjectClick,
  selectedSubject,
}: SubjectsDisplayProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/subjects");
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Matières disponibles</h3>
            <p className="text-xs text-gray-500">
              Cliquez sur une matière pour filtrer les mentors
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une matière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 border-gray-200 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {searchQuery
              ? "Aucune matière ne correspond à votre recherche"
              : "Aucune matière disponible pour le moment"}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredSubjects.map((subject) => {
              const isActive = selectedSubject === subject.name;
              return (
                <motion.button
                  key={subject._id}
                  type="button"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSubjectClick?.(subject.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/25"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
                  )}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  {subject.name}
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
