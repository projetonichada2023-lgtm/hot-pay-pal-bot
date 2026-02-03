import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Send, BookOpen, Mail, ExternalLink } from "lucide-react";
import conversyLogo from "@/assets/conversy-logo.png";
import unipayLogo from "@/assets/unipay-logo.png";

export function Footer() {
  return (
    <motion.footer 
      className="py-12 px-4 border-t border-white/[0.06] bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <motion.div 
              className="flex items-center mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src={conversyLogo} 
                alt="Conversy" 
                className="h-8 w-auto object-contain"
              />
            </motion.div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatize suas vendas no Telegram com pagamento PIX, entrega instantânea e recuperação de carrinho.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <motion.a
                href="https://instagram.com/conversy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://youtube.com/@conversy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://t.me/conversy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/30 hover:bg-primary/20 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-display font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors flex items-center gap-1">
                  Preços
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors flex items-center gap-1">
                  Recursos
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-display font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Documentação
                </a>
              </li>
              <li>
                <a href="https://t.me/conversy_suporte" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Suporte Telegram
                </a>
              </li>
              <li>
                <a href="mailto:suporte@conversy.com.br" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/termos-de-uso" className="hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookies" className="hover:text-primary transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/lgpd" className="hover:text-primary transition-colors">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* UniPay Partnership */}
            <motion.a
              href="https://unipaybr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src={unipayLogo} 
                alt="UniPay" 
                className="h-6 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <span>Gateway de Pagamentos</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </motion.a>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2025 Conversy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
