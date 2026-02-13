import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PartnersMarquee } from "@/components/landing/PartnersMarquee";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { MobileFloatingCTA } from "@/components/landing/MobileFloatingCTA";
import { MessageCircle } from "lucide-react";

// Lazy load heavy components
const DemoModal = lazy(() => import("@/components/landing/DemoModal").then(m => ({ default: m.DemoModal })));
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
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden">
      <Header onOpenDemo={() => setDemoOpen(true)} />
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />
      <FeaturesSection />
      <PartnersMarquee />

      <Suspense fallback={<SectionLoader />}>
        <PricingSection />
      </Suspense>

      <CTASection />
      <Footer />

      {/* Mobile Floating CTA */}
      <MobileFloatingCTA />

      {/* Floating Support Button */}
      <a
        href="https://t.me/conversy_suporte"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </a>

      {/* Demo Modal */}
      <Suspense fallback={null}>
        <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
      </Suspense>
    </div>
  );
}
