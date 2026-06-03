"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart3, Zap, Clock, Shield, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export default function FeaturesTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const featuresAnimation = useScrollAnimation()
  const testimonialAnimation = useScrollAnimation()
  const ctaAnimation = useScrollAnimation()

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Head of Operations",
      company: "TechFlow",
      initials: "SJ",
      rating: 5,
      text: "Stride transformed how our team manages projects. We've reduced delivery time by 40% and our clients couldn't be happier.",
      color: "bg-indigo-500"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "InnovateLabs",
      initials: "MC",
      rating: 5,
      text: "The best project management tool we've used. The timeline view and automation features have been game-changers for our workflow.",
      color: "bg-purple-500"
    },
    {
      name: "Emily Rodriguez",
      role: "CEO",
      company: "StartupHub",
      initials: "ER",
      rating: 5,
      text: "Stride helped us scale from 5 to 50 team members seamlessly. The collaboration features are intuitive and powerful.",
      color: "bg-pink-500"
    },
    {
      name: "David Kim",
      role: "Engineering Lead",
      company: "CodeCraft",
      initials: "DK",
      rating: 5,
      text: "Finally, a project management tool that developers actually enjoy using. The integrations and API are top-notch.",
      color: "bg-blue-500"
    },
    {
      name: "Lisa Anderson",
      role: "Creative Director",
      company: "DesignStudio",
      initials: "LA",
      rating: 5,
      text: "Stride brings clarity to chaos. Our creative team can now focus on what they do best while staying organized and on track.",
      color: "bg-green-500"
    },
    {
      name: "James Wilson",
      role: "Operations Manager",
      company: "GlobalTech",
      initials: "JW",
      rating: 5,
      text: "The analytics dashboard gives us insights we never had before. We can now predict bottlenecks and optimize our processes.",
      color: "bg-orange-500"
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index)
  }

  return (
    <div className="bg-white">
      {/* Features Grid Section */}
      <div ref={featuresAnimation.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">
            Everything you need to{" "}
            <span className="text-indigo-500">ship faster</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to streamline your workflow and keep your team aligned.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Calendar, title: "Timeline View", desc: "Visualize project timelines and dependencies with our intuitive Gantt-style interface.", borderColor: "hover:border-indigo-400", bgColor: "from-indigo-50", textColor: "group-hover:text-indigo-600" },
            { icon: Users, title: "Team Collaboration", desc: "Real-time updates, comments, and file sharing to keep everyone on the same page.", borderColor: "hover:border-purple-400", bgColor: "from-purple-50", textColor: "group-hover:text-purple-600" },
            { icon: BarChart3, title: "Analytics Dashboard", desc: "Track progress, identify bottlenecks, and make data-driven decisions.", borderColor: "hover:border-blue-400", bgColor: "from-blue-50", textColor: "group-hover:text-blue-600" },
            { icon: Zap, title: "Automation", desc: "Automate repetitive tasks and workflows to focus on what matters most.", borderColor: "hover:border-yellow-400", bgColor: "from-yellow-50", textColor: "group-hover:text-yellow-600" },
            { icon: Clock, title: "Time Tracking", desc: "Built-in time tracking to monitor productivity and project profitability.", borderColor: "hover:border-green-400", bgColor: "from-green-50", textColor: "group-hover:text-green-600" },
            { icon: Shield, title: "Enterprise Security", desc: "Bank-level security with SSO, 2FA, and compliance certifications.", borderColor: "hover:border-red-400", bgColor: "from-red-50", textColor: "group-hover:text-red-600" }
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`group relative p-6 rounded-xl border border-slate-200 ${feature.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer bg-white overflow-hidden`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className={`text-lg font-semibold text-slate-900 mb-2 ${feature.textColor} transition-colors duration-300`}>{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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

      {/* Testimonial Carousel Section */}
      <div className="bg-slate-50">
        <div ref={testimonialAnimation.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center space-y-2 mb-10">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">
              Loved by teams{" "}
              <span className="text-indigo-500">worldwide</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our customers have to say about their experience with Stride.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Main Testimonial Carousel */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl min-h-[380px] flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex space-x-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg lg:text-xl font-medium text-slate-900 leading-relaxed">
                    &quot;{testimonials[currentTestimonial].text}&quot;
                  </blockquote>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 ${testimonials[currentTestimonial].color} rounded-full flex items-center justify-center transform transition-all duration-300`}>
                      <span className="text-white font-semibold text-lg">{testimonials[currentTestimonial].initials}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-slate-600">{testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-500 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToTestimonial(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentTestimonial
                            ? 'w-8 h-2 bg-indigo-500'
                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-500 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Testimonial Grid Preview */}
            <div className="grid grid-cols-2 gap-4">
              {testimonials.slice(0, 4).map((testimonial, index) => (
                <div
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`group cursor-pointer bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    index === currentTestimonial ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs font-semibold">{testimonial.initials}</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{testimonial.name}</div>
                        <div className="text-xs text-slate-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div ref={ctaAnimation.ref} className="mt-12 lg:mt-14">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 lg:p-10 shadow-xl text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
              
              <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-white">
                  Ready to transform your workflow?
                </h3>
                <p className="text-lg text-indigo-100">
                  Join thousands of teams already using Stride to deliver projects on time and under budget.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-white shadow-2xl hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-110 border-4 border-white hover:border-white font-bold text-lg px-8 relative overflow-hidden group">
                    <span className="relative z-10">Start Your Free Trial</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                  <Button variant="outline" size="lg" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-indigo-600 transition-all duration-300 font-bold text-lg hover:scale-105 shadow-xl hover:shadow-2xl">
                    Schedule a Demo
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-6 pt-5 border-t border-indigo-400">
                  <div>
                    <div className="text-3xl font-bold text-white">10k+</div>
                    <div className="text-sm text-indigo-100">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-indigo-100">Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-sm text-indigo-100">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}