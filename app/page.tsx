"use client"

import { Button } from "@/components/ui/button"
import { Check, Lock, Play, ArrowUp } from "lucide-react"
import Link from "next/link"
import FeaturesTestimonials from "@/components/features-testimonials"
import Pricing from "@/components/Pricing"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"
import UserMenu from "@/components/UserMenu"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)


  useEffect(() => {
    setIsLoaded(true)
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Stride</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">Features</a>
              <a href="#features" className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">Solutions</a>
              <a href="#pricing" className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">Pricing</a>
              <a href="#faq" className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">Resources</a>
              <a href="#about" className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">About</a>
            </div>

            <div className="flex items-center space-x-3">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="font-display text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Master chaos.{" "}
                <span className="text-indigo-500">Deliver on time.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                The project management tool that adapts to your team&apos;s workflow.
                Track progress, manage deadlines, and deliver exceptional results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 hover:border-purple-700 shadow-xl hover:shadow-2xl font-bold text-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                <Link href="/register">
                <span className="relative z-10">Start Free Trial</span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center space-x-2 border-2 border-indigo-500 hover:border-indigo-600 hover:text-indigo-600 font-semibold text-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column - Illustration Placeholder */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-3xl p-12 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-16 h-16 bg-indigo-500 rounded-2xl animate-bounce" style={{ animationDuration: '3s' }}></div>
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.2s' }}></div>
                    <div className="w-16 h-16 bg-pink-500 rounded-2xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.4s' }}></div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Streamline Your Workflow
                    </div>
                    <div className="text-slate-600">Collaborate, Track, Deliver</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              </div>
            </span>
          </div>
        </div>
      </div>

      {/* Features and Testimonials */}
      <section id="features">
        <FeaturesTestimonials />
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              </div>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing">
        <Pricing />
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-dashed border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section id="faq">
        <FAQ />
      </section>

      {/* Divider before Footer */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4">
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <section id="about">
        <Footer />
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>


  )
}
