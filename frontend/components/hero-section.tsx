"use client"

import { useEffect, useRef } from "react"

export default function HeroSection() {
  const contentRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fadeInUp")
        }
      })
    })

    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="home" className="relative overflow-hidden pt-20 pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef} className="space-y-6 opacity-0">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Your Learning, Your Community</p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
              Find a Mentor,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Be a Mentor</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg text-pretty">
              Connect with industry experts and transform your learning journey through meaningful mentorship
              relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition font-medium hover:shadow-lg hover:shadow-primary/30 active:scale-95">
                Find a Mentor
              </button>
              <button className="px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary/5 transition font-medium">
                Learn More
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 aspect-square flex items-center justify-center animate-pulse-glow">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">👨‍🎓</div>
                <p className="text-muted-foreground">Student learning with mentor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
