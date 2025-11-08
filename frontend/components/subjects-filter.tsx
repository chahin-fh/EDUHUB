"use client"

import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Biology",
  "History",
  "Geography",
  "Philosophy",
  "English",
  "Spanish",
  "Economics",
  "Sociology",
]

interface SubjectsFilterProps {
  onSubjectSelect: (subject: string) => void
  onSearch: (query: string) => void
}

export default function SubjectsFilter({ onSubjectSelect, onSearch }: SubjectsFilterProps) {
  const [showMore, setShowMore] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const displayedSubjects = showMore ? SUBJECTS : SUBJECTS.slice(0, 8)

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Subject Buttons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold animate-fadeInUp">Choose a Subject</h2>
            <div className="flex flex-wrap gap-3">
              {displayedSubjects.map((subject, idx) => (
                <button
                  key={subject}
                  onClick={() => onSubjectSelect(subject)}
                  className={`px-4 py-2 bg-background border border-border rounded-full hover:bg-primary hover:text-white hover:border-primary transition text-sm font-medium animate-fadeInUp opacity-0`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {subject}
                </button>
              ))}
            </div>
            {!showMore && (
              <button
                onClick={() => setShowMore(true)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-medium text-sm"
              >
                <ChevronDown size={16} />
                Show More
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex animate-fadeInUp opacity-0" style={{ animationDelay: "200ms" }}>
            <div className="flex-1 flex items-center bg-background border border-border rounded-l-full px-4 focus-within:border-primary transition">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentors or subjects..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  onSearch(e.target.value)
                }}
                className="flex-1 ml-3 py-3 bg-transparent outline-none placeholder-muted-foreground"
              />
            </div>
            <button className="px-6 bg-primary text-white rounded-r-full hover:bg-primary/90 transition font-medium">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
