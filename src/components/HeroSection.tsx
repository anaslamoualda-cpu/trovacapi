import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-[40vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
    <motion.img
      src={heroBg}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-40"
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
    <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
      <motion.h1
        className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Carica una foto.{" "}
        <span className="gradient-text">trovi tutto qui</span>
      </motion.h1>
      <motion.p
        className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        La ricerca intelligente che trova articoli simili 1:1 scarpe, vestiti, occhiali, borse, cinture, tute, orologi e molto altro...
      </motion.p>
    </div>
  </section>
);

export default HeroSection;
