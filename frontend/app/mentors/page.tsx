"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import MentorGrid from "@/components/mentor-grid"

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Trouver un Mentor</h1>
          <p className="text-muted-foreground">Connectez-vous avec des experts pour vous guider dans votre parcours</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un mentor par nom, compétence ou entreprise..."
            className="pl-10 py-6 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mentors Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Nos mentors disponibles</h2>
          <MentorGrid subject="" search={searchQuery} />
        </div>
      </div>
    </div>
  )
}
