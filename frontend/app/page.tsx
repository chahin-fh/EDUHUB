"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import SubjectsFilter from "@/components/subjects-filter"
import MentorGrid from "@/components/mentor-grid"
import AuthSection from "@/components/auth-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <SubjectsFilter onSubjectSelect={setSelectedSubject} onSearch={setSearchQuery} />
      <MentorGrid subject={selectedSubject} search={searchQuery} />
      <AuthSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
