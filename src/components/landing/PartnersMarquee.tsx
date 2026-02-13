import { motion } from "framer-motion";

const partners = ["MERCADO PAGO", "STRIPE", "UNIPAY", "TON", "TELEGRAM"];

export function PartnersMarquee() {
  return (
    <section className="py-10 bg-black border-y border-white/[0.04] overflow-hidden">
      <div 
        className="flex gap-12 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        style={{ '--gap': '3rem' } as React.CSSProperties}
      >
        <motion.div
          className="flex items-center gap-12 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].map((_, setIndex) => (
            partners.map((partner, i) => (
              <span
                key={`${setIndex}-${i}`}
                className="text-sm font-display font-medium text-white/20 tracking-widest whitespace-nowrap uppercase"
              >
                {partner}
              </span>
            ))
          ))}
        </motion.div>
      </div>
    </section>
  );
}
