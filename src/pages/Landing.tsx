import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { MobileFloatingCTA } from "@/components/landing/MobileFloatingCTA";
import { testimonials } from "@/components/landing/shared/data";

// Lazy load heavy components
const DemoModal = lazy(() => import("@/components/landing/DemoModal").then(m => ({ default: m.DemoModal })));
const TestimonialsSection = lazy(() => import("@/components/ui/testimonials-with-marquee").then(m => ({ default: m.TestimonialsSection })));
const PricingSection = lazy(() => import("@/components/landing/PricingSection").then(m => ({ default: m.PricingSection })));

// Loading fallback for lazy components
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);

  // Force dark mode on landing page
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden">
      {/* Header */}
      <Header onOpenDemo={() => setDemoOpen(true)} />

      {/* Hero Section */}
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />

      {/* Features Section */}
      <FeaturesSection />

      {/* How it Works */}
      <HowItWorksSection />

      {/* Benefits Comparison Table */}
      <ComparisonSection />

      {/* Para Quem é Section */}
      <TargetAudienceSection />

      {/* Pricing Section */}
      <Suspense fallback={<SectionLoader />}>
        <PricingSection />
      </Suspense>

      {/* Trust Section */}
      <TrustSection />

      {/* Testimonials Section */}
      <Suspense fallback={<SectionLoader />}>
        <TestimonialsSection
          title="O que nossos clientes dizem"
          description="Milhares de empreendedores já transformaram suas vendas com o Conversy."
          testimonials={testimonials}
        />
      </Suspense>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Mobile Floating CTA */}
      <MobileFloatingCTA />

      {/* Demo Modal */}
      <Suspense fallback={null}>
        <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
      </Suspense>
    </div>
  );
}
