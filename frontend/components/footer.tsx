export default function Footer() {
  return (
    <footer className="border-t border-border py-8 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
          <p>Copyright © 2025 EDUHUB. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
