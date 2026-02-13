import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function MobileFloatingCTA() {
  return (
    <>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-black/95 backdrop-blur-xl border-t border-white/5 md:hidden z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/auth" className="block">
          <Button className="w-full h-12 text-base gap-2 shadow-lg shadow-primary/30 font-display font-medium cta-shine btn-gradient rounded-xl">
            Começar Grátis Agora
            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </Link>
      </motion.div>
      <div className="h-20 md:hidden" />
    </>
  );
}
