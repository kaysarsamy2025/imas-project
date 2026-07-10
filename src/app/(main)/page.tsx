import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import FeaturedProjects from "@/components/featured-projects"
import StatsSection from "@/components/stats-section"
import Testimonials from "@/components/testimonials"
import FAQ from "@/components/faq"
import ContactForm from "@/components/contact-form"

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedProjects />
      <StatsSection />
      <Testimonials />
      <FAQ />
      <ContactForm />
    </>
  )
}
