"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FAQ() {
  const faqAnimation = useScrollAnimation()

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Our 14-day free trial gives you full access to all Professional plan features. No credit card required to start. You can upgrade, downgrade, or cancel anytime during or after the trial period."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, absolutely! You can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your current billing period. No questions asked, no cancellation fees."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. For Enterprise plans, we also offer invoice billing and bank transfers."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. We use bank-level 256-bit SSL encryption for all data transmission. Your data is stored in secure, redundant servers with daily backups. We're SOC 2 Type II certified and fully GDPR compliant."
    },
    {
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your current billing cycle, and you'll receive a prorated credit."
    },
    {
      question: "Do you offer discounts for nonprofits or educational institutions?",
      answer: "Yes, we offer special pricing for registered nonprofits and educational institutions. Contact our sales team with your organization details to learn more about our discount programs."
    },
    {
      question: "What integrations do you support?",
      answer: "Stride integrates with 100+ popular tools including Slack, Google Workspace, Microsoft Teams, Jira, GitHub, Trello, Asana, and more. We also provide a robust REST API for custom integrations. New integrations are added regularly based on customer feedback."
    },
    {
      question: "What kind of support do you provide?",
      answer: "All plans include email support with response times within 24 hours. Professional plans get priority support with faster response times. Enterprise customers receive 24/7 phone and email support plus a dedicated account manager."
    },
    {
      question: "Can I import data from other project management tools?",
      answer: "Yes! We provide easy import tools for popular platforms like Asana, Trello, Monday.com, and others. You can also import data via CSV files. Our support team is happy to help with the migration process."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "You can export all your data at any time in multiple formats (CSV, JSON, PDF). After cancellation, your data remains accessible for 30 days, giving you plenty of time to export everything. After 30 days, data is permanently deleted from our servers."
    }
  ]

  return (
    <div className="bg-white">
      <div ref={faqAnimation.ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center space-y-4 mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">
            Frequently asked{" "}
            <span className="text-indigo-500">questions</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about Stride. Can't find what you're looking for? Chat with our team.
          </p>
        </div>

        <div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-slate-50 rounded-xl border border-slate-200 px-6 hover:border-indigo-300 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-indigo-600 py-5 text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <MessageCircle className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-600 mb-6">
            Can't find the answer you're looking for? Our friendly team is here to help.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
