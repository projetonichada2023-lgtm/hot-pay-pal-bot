import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4",
        "transition-colors duration-300 hover:border-primary/50 hover:bg-card/80",
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {author.handle}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {text}
      </p>
    </Card>
  )
}
