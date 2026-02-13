import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Send } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo-new.png";
import conversyIcon from "@/assets/conversy-icon-new.png";

export function Footer() {
  return (
    <motion.footer 
      className="py-10 px-4 border-t border-white/[0.06]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <img src={conversyIcon} alt="Conversy" className="h-5 w-auto" />
            </div>
            <span className="font-display font-semibold text-lg">Conversy</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos</Link>
            <Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <a href="https://t.me/conversy_suporte" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Suporte</a>
          </div>
          
          <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">
            © 2026 CONVERSY TECHNOLOGY • HARU DESIGN
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
