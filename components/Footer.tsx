import { Button } from "@/components/ui/button"
import { GitBranch, Link, Mail, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl font-bold">Stride</span>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed">
                The project management tool that helps teams deliver exceptional results on time. 
                Streamline workflows, track progress, and collaborate seamlessly.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Link className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <GitBranch className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Timeline View
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Team Collaboration
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Partners
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Status Page
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-slate-800 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Stay updated with Stride
              </h3>
              <p className="text-slate-300">
                Get the latest product updates, tips, and best practices delivered to your inbox.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Button className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              &copy; 2024 Stride. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                GDPR
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
