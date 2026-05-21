"use client"

import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { useState } from "react"

export default function Pricing() {
  const pricingAnimation = useScrollAnimation()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      monthlyPrice: 499,
      annualPrice: 4990,
      popular: false,
      features: [
        { name: "Up to 10 team members", included: true },
        { name: "5 projects", included: true },
        { name: "Basic timeline view", included: true },
        { name: "Mobile app access", included: true },
        { name: "Email support", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Custom integrations", included: false },
        { name: "Priority support", included: false },
      ]
    },
    {
      name: "Professional",
      description: "For growing teams that need more power",
      monthlyPrice: 1499,
      annualPrice: 14990,
      popular: true,
      features: [
        { name: "Up to 50 team members", included: true },
        { name: "Unlimited projects", included: true },
        { name: "Advanced timeline view", included: true },
        { name: "Mobile app access", included: true },
        { name: "Priority email support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "API access", included: true },
        { name: "Custom integrations", included: false },
      ]
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      monthlyPrice: null,
      annualPrice: null,
      popular: false,
      features: [
        { name: "Unlimited team members", included: true },
        { name: "Unlimited projects", included: true },
        { name: "Advanced timeline view", included: true },
        { name: "Mobile app access", included: true },
        { name: "24/7 phone & email support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated account manager", included: true },
      ]
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (!plan.monthlyPrice) return "Custom"
    const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice
    return `₱${price?.toLocaleString()}`
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (!plan.monthlyPrice || !plan.annualPrice) return null
    const monthlyCost = plan.monthlyPrice * 12
    const savings = monthlyCost - plan.annualPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return percentage
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50">
      <div ref={pricingAnimation.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center space-y-4 mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">
            Simple, transparent{" "}
            <span className="text-indigo-500">pricing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Save up to 17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-lg transition-all duration-700 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-indigo-500 shadow-2xl scale-105 hover:scale-110' 
                  : 'border border-slate-200 hover:border-indigo-300'
              }"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-600 mt-2 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice && (
                      <span className="text-slate-600">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'annual' && getSavings(plan) && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Save {getSavings(plan)}% with annual billing
                    </p>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className={`w-full font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600'
                      : 'bg-slate-900 hover:bg-slate-800 border-2 border-slate-900'
                  }`}
                >
                  {plan.monthlyPrice ? 'Start Free Trial' : 'Contact Sales'}
                </Button>

                <div className="mt-8 space-y-4">
                  <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            All plans include a 14-day free trial. No credit card required.{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
              Compare all features
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
