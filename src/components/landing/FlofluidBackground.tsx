import { motion } from "framer-motion";

export function FlofluidBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/[0.12] blur-[120px]"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/[0.08] blur-[100px]"
        animate={{
          x: [0, -60, 30, 0],
          y: [0, 50, -30, 0],
          scale: [1.1, 0.9, 1.2, 1.1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-primary/[0.06] blur-[80px]"
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -40, 20, 0],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
