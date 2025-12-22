"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";

interface SubjectsFilterProps {
  onSubjectSelect: (subject: string) => void;
  onSearch: (query: string) => void;
}

interface Subject {
  _id: string;
  name: string;
}

export default function SubjectsFilter({
  onSubjectSelect,
  onSearch,
}: SubjectsFilterProps) {
  const [showMore, setShowMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

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

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set loading state immediately if there's text
    if (value.trim()) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
      // Immediately search with empty string
      onSearch("");
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      onSearch(value);
      setSearchLoading(false);
    }, 300); // 300ms debounce

    setSearchTimeout(newTimeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const displayedSubjects = showMore ? subjects : subjects.slice(0, 8);

  if (loading) {
    return (
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Choose a Subject</h2>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Subject Buttons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold animate-fadeInUp">
              Choose a Subject
            </h2>
            <div className="flex flex-wrap gap-3">
              {displayedSubjects.map((subject, idx) => (
                <button
                  key={subject._id}
                  onClick={() => onSubjectSelect(subject.name)}
                  className={`px-4 py-2 bg-background border border-border rounded-full hover:bg-primary hover:text-white hover:border-primary transition text-sm font-medium animate-fadeInUp opacity-0`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {subject.name}
                </button>
              ))}
            </div>
            {subjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune matière disponible pour le moment
              </p>
            ) : (
              !showMore &&
              subjects.length > 8 && (
                <button
                  onClick={() => setShowMore(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-medium text-sm"
                >
                  <ChevronDown size={16} />
                  Show More
                </button>
              )
            )}
          </div>

          {/* Search Bar */}
          <div
            className="flex animate-fadeInUp opacity-0"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex-1 flex items-center bg-background border border-border rounded-l-full px-4 focus-within:border-primary transition">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentors or subjects..."
                value={searchInput}
                onChange={handleSearchChange}
                className="flex-1 ml-3 py-3 bg-transparent outline-none placeholder-muted-foreground"
              />
              {searchLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
              )}
            </div>
            <button className="px-6 bg-primary text-white rounded-r-full hover:bg-primary/90 transition font-medium">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
