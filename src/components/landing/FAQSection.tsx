import { lazy, Suspense } from "react";
import { ScrollReveal } from "./shared/ScrollReveal";
import { faqs } from "./shared/data";

const Accordion = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.Accordion })));
const AccordionContent = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionContent })));
const AccordionItem = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionItem })));
const AccordionTrigger = lazy(() => import("@/components/ui/accordion").then(m => ({ default: m.AccordionTrigger })));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-[#0a0a0a]">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 font-display font-bold tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Tire suas dúvidas sobre o Conversy.
          </p>
        </ScrollReveal>
        
        <ScrollReveal className="max-w-3xl mx-auto">
          <Suspense fallback={<SectionLoader />}>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="landing-feature-card !p-0 border-0 rounded-2xl overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-primary/30"
                >
                  <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors duration-300 py-6 text-base px-6 font-display font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground leading-relaxed pb-6 px-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Suspense>
        </ScrollReveal>
      </div>
    </section>
  );
}
