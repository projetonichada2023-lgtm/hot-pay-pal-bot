import { Flame, MoreVertical, Eye, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: string;
  sales: number;
  views: number;
  image: string;
  isHot?: boolean;
  delay?: number;
}

export function ProductCard({ 
  name, 
  price, 
  sales, 
  views, 
  image, 
  isHot,
  delay = 0 
}: ProductCardProps) {
  return (
    <div 
      className="glass-card overflow-hidden hover-scale animate-slide-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        {isHot && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full gradient-hot glow-hot">
            <Flame className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-bold text-primary-foreground">HOT</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-card/50 backdrop-blur-sm hover:bg-card/80"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 truncate">{name}</h3>
        <p className="text-2xl font-bold gradient-text mb-3">{price}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            <span>{sales} vendas</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
