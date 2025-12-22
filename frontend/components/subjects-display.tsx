"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
}

interface SubjectsDisplayProps {
  onSubjectClick?: (subject: string) => void;
}

export default function SubjectsDisplay({
  onSubjectClick,
}: SubjectsDisplayProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Matières disponibles
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
          <BookOpen className="h-5 w-5" />
          Matières disponibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucune matière disponible pour le moment
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge
                key={subject._id}
                variant="secondary"
                className="px-3 py-1 text-sm cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                onClick={() => onSubjectClick?.(subject.name)}
              >
                {subject.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
