"use client"

import { useState, useEffect } from "react"
import MentorCard from "./mentor-card"

const MENTORS = [
  {
    id: 1,
    name: "John Doe",
    profession: "Frontend Developer",
    description: "Senior web developer with 8 years of experience in React and Vue.js",
    rating: 5,
    image: "👨‍💻",
  },
  {
    id: 2,
    name: "Sarah Smith",
    profession: "Fullstack Developer",
    description: "Full-stack expert with Node.js backend and modern frontend skills",
    rating: 5,
    image: "👩‍💻",
  },
  {
    id: 3,
    name: "Michael Johnson",
    profession: "UI/UX Designer",
    description: "Creative designer focused on accessibility and user experience",
    rating: 5,
    image: "🎨",
  },
  {
    id: 4,
    name: "Emily Davis",
    profession: "Mobile Developer",
    description: "Mobile app specialist in Flutter and React Native",
    rating: 5,
    image: "📱",
  },
  {
    id: 5,
    name: "David Wilson",
    profession: "Backend Developer",
    description: "Backend expert with database design and API development experience",
    rating: 5,
    image: "🖥️",
  },
  {
    id: 6,
    name: "Jessica Brown",
    profession: "Junior Developer",
    description: "Passionate junior developer learning new technologies daily",
    rating: 5,
    image: "👩‍🎓",
  },
]

interface MentorGridProps {
  subject: string
  search: string
}

export default function MentorGrid({ subject, search }: MentorGridProps) {
  const [filteredMentors, setFilteredMentors] = useState(MENTORS)
  const [visibleIndices, setVisibleIndices] = useState<number[]>([])

  useEffect(() => {
    let filtered = MENTORS

    if (search) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(search.toLowerCase()) ||
          mentor.profession.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredMentors(filtered)
    setVisibleIndices([])
  }, [search, subject])

  useEffect(() => {
    const timer = setTimeout(() => {
      const indices = filteredMentors.map((_, idx) => idx)
      setVisibleIndices(indices)
    }, 100)
    return () => clearTimeout(timer)
  }, [filteredMentors.length])

  return (
    <section id="profiles" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fadeInUp">
          <h2 className="text-4xl font-bold mb-2">Meet Our Experts</h2>
          <p className="text-lg text-muted-foreground">Connect with talented professionals ready to mentor you</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor, idx) => (
            <div
              key={mentor.id}
              className={`transition-all duration-500 ${
                visibleIndices.includes(idx) ? "animate-fadeInUp" : "opacity-0"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <MentorCard mentor={mentor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
