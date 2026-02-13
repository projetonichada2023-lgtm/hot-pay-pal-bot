import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Send } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo-new.png";

export function Footer() {
  return (
    <motion.footer 
      className="py-12 px-4 border-t border-white/[0.06] bg-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src={conversyLogo} alt="Conversy" className="h-7 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              O padrão de excelência em automação para Telegram. Potencializando o mercado digital desde 2026.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com/conversy" },
                { icon: Youtube, href: "https://youtube.com/@conversy" },
                { icon: Send, href: "https://t.me/conversy" },
              ].map(({ icon: Icon, href }) => (
                <motion.a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-primary/20 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#produtos" className="hover:text-primary transition-colors">Produtos</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
              <li><a href="#depoimentos" className="hover:text-primary transition-colors">Depoimentos</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos</Link></li>
              <li><Link to="/lgpd" className="hover:text-primary transition-colors">LGPD</Link></li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="font-display font-semibold mb-4">Equipa</h4>
            <p className="text-sm text-muted-foreground">Marcos Hilguera (Haru)</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Conversy Technology — Todos os Direitos Reservados
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Youtube, Send].map((Icon, i) => (
                <Icon key={i} className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
