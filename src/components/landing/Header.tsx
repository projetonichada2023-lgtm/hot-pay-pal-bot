import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo-new.png";
import conversyIcon from "@/assets/conversy-icon-new.png";

interface HeaderProps {
  onOpenDemo: () => void;
}

export function Header({ onOpenDemo }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-black/90 backdrop-blur-xl border-b border-white/[0.06]" 
          : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div className="flex items-center" whileHover={{ scale: 1.02 }}>
          <img src={conversyLogo} alt="Conversy" className="h-7 w-auto object-contain hidden sm:block" />
          <img src={conversyIcon} alt="Conversy" className="h-8 w-auto object-contain sm:hidden" />
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {["Produtos", "Recursos", "Preços"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" className="gap-2 btn-gradient rounded-xl">
                Começar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black border-white/[0.06]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <img src={conversyLogo} alt="Conversy" className="h-7 w-auto object-contain" />
                </div>
                <nav className="flex flex-col gap-4">
                  {["Produtos", "Recursos", "Preços"].map(item => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="text-lg hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {item}
                    </a>
                  ))}
                </nav>
                <div className="border-t border-white/[0.06] pt-6 mt-2 flex flex-col gap-3">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center rounded-xl border-white/10">Login</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center gap-2 btn-gradient rounded-xl">
                      Começar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
