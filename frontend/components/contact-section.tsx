"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">Have questions? We&apos;d love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Mail className="text-primary group-hover:text-white transition-colors" size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Email</h3>
                <p className="text-muted-foreground group-hover:text-primary transition-colors">hello@eduhub.com</p>
              </div>
            </div>

            <div className="flex gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Phone className="text-primary group-hover:text-white transition-colors" size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Phone</h3>
                <p className="text-muted-foreground group-hover:text-primary transition-colors">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MapPin className="text-primary group-hover:text-white transition-colors" size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Location</h3>
                <p className="text-muted-foreground group-hover:text-primary transition-colors">San Francisco, CA</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-background border border-border rounded-xl p-8 space-y-4">
            {isSubmitted && (
              <div className="p-3 bg-green-100/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle size={20} />
                <span className="text-sm">Message sent successfully!</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary transition"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary transition"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary transition"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary transition resize-none"
                required
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
