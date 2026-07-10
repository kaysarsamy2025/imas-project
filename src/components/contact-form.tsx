"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Send, Mail, User, MessageSquare, MapPin, Clock, Phone } from "lucide-react"

export default function ContactForm() {
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      addToast({ title: "Message sent!", description: "We'll get back to you soon." })
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      addToast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    /* Background — last alternating section */
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
            Contact Us
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get In Touch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a question or want to learn more? We&apos;d love to hear from you
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:grid-cols-5">
          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
              <p className="mt-2 text-sm text-muted-foreground">Reach out to our team and we&apos;ll respond within 24 hours.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail,    label: "Email",     value: "hello@imas.io" },
                { icon: Phone,   label: "Phone",     value: "+8801760107748" },
                { icon: MapPin,  label: "Location",  value: "Kazla, Rajshahi, Bangladesh" },
                { icon: Clock,   label: "Hours",     value: "Mon–Fri, 9am–6pm PST" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xs"
                    style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Yellow accent block */}
            <div
              className="rounded-xs p-5"
              style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderLeft: "3px solid var(--primary)" }}
            >
              <p className="text-sm font-semibold text-foreground">Priority Support</p>
              <p className="mt-1 text-xs text-muted-foreground">Verified investors and listed entrepreneurs receive priority response within 2 hours.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xs border border-border bg-muted p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" name="name" value={form.name} onChange={handleChange} required className="pl-9" placeholder="Your name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="pl-9" placeholder="your@email.com" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="mb-1.5 block text-sm font-medium">Subject</Label>
                  <div className="relative">
                    <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="subject" name="subject" value={form.subject} onChange={handleChange} required className="pl-9" placeholder="How can we help?" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="mb-1.5 block text-sm font-medium">Message</Label>
                  <textarea
                    id="message" name="message" rows={5}
                    value={form.message} onChange={handleChange} required
                    className="flex w-full rounded-xs border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about your project or question..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full gap-2">
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
