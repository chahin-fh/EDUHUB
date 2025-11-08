"use client"

export default function AuthSection() {
  return (
    <section id="auth" className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Get Started Today</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners and mentors building meaningful relationships and growing together.
            </p>
            <div className="space-y-3">
              <button className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition font-medium">
                Create Account
              </button>
              <p className="text-sm text-muted-foreground">
                Already have an account? <span className="text-primary cursor-pointer hover:underline">Login here</span>
              </p>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl p-8 space-y-6">
            <h3 className="text-xl font-bold">Why Join EDUHUB?</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Connect with industry experts</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Accelerate your learning journey</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Build a strong professional network</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Share knowledge and grow together</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
