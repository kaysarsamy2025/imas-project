"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  { question: "How does the platform work for investors?", answer: "Investors can browse through verified startup listings, review detailed project information including financials and team backgrounds, and directly connect with entrepreneurs through our built-in messaging system. Once you find a promising opportunity, you can initiate the investment process securely through our platform." },
  { question: "How can entrepreneurs submit their projects?", answer: "Entrepreneurs can create an account, fill out a comprehensive project profile including your business plan, funding requirements, equity offering, and team information. Our team reviews each submission to ensure quality and authenticity before it goes live on the platform." },
  { question: "What fees does IMAS charge?", answer: "IMAS charges a competitive success fee of 5% on funds raised, which is only applicable when your funding round is successfully completed. There are no upfront listing fees or monthly charges for entrepreneurs. Investors can browse and connect with startups completely free of charge." },
  { question: "How do you verify projects and investors?", answer: "We have a rigorous verification process that includes identity verification, business registration checks, and background reviews. All users are required to complete KYC verification before participating in any investment activities on our platform." },
  { question: "What types of startups are listed on IMAS?", answer: "We feature a diverse range of startups across multiple sectors including GreenTech, HealthTech, AgriTech, EdTech, Cybersecurity, E-Commerce, and more. Each startup goes through our vetting process to ensure they meet our quality standards." },
  { question: "Is my investment secure?", answer: "We prioritize security and transparency. All transactions are processed through secure payment gateways, and we maintain detailed records of all investment activities. We also provide escrow services for larger transactions to protect both parties throughout the investment process." },
  { question: "Can I invest from outside the United States?", answer: "Yes, IMAS welcomes international investors. Our platform supports investors from over 30 countries. However, certain restrictions may apply based on local securities laws and regulations. We recommend consulting with a legal advisor familiar with your jurisdiction." },
]

export default function FAQ() {
  return (
    /* Muted background — alternating again */
    <section className="bg-muted py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about IMAS</p>
        </div>

        <div className="mt-12">
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <Accordion.Item
                key={i}
                value={`item-${i}`}
                className="group rounded-xs border border-border bg-background transition-colors duration-instant hover:border-ring data-[state=open]:border-primary"
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      "flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-foreground transition-colors duration-instant",
                      "focus-visible:outline-none",
                      "data-[state=open]:text-primary"
                    )}
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-instant group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="border-t border-border px-6 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  )
}
