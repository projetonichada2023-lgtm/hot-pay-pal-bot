import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn("py-20 px-4 bg-muted/30 overflow-hidden", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col gap-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="relative w-full max-w-6xl mx-auto">
            <div 
              className="flex gap-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
              style={{ '--gap': '1rem' } as React.CSSProperties}
            >
              <div 
                className="flex gap-4 animate-marquee"
                style={{ '--duration': '40s' } as React.CSSProperties}
              >
                {[...Array(4)].map((_, setIndex) => (
                  testimonials.map((testimonial, i) => (
                    <TestimonialCard
                      key={`${setIndex}-${i}`}
                      {...testimonial}
                      className="w-[350px] shrink-0"
                    />
                  ))
                ))}
              </div>
            </div>

            {/* Gradient overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-muted/30 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-muted/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
