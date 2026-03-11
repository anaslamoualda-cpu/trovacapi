import { Camera, Brain, Send, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Camera, title: "Carica la foto", desc: "Scatta o carica la foto dell'articolo che vuoi trovare." },
  { icon: Brain, title: "Analisi AI", desc: "Il nostro sistema analizza l'immagine e cerca prodotti simili." },
  { icon: Send, title: "Inviaci la foto o il link", desc: "Condividi la foto o il link dell'articolo trovato." },
  { icon: ShoppingBag, title: "Ricevi proposte", desc: "Ricevi proposte e prezzi dai nostri fornitori." },
];

const HowItWorks = () => (
  <section className="py-8 md:py-12 px-4">
    <div className="max-w-5xl mx-auto">
      <motion.h2
        className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        Come <span className="gradient-text">funziona</span>
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="rounded-2xl p-5 md:p-8 text-center border-2 border-primary/50 bg-card shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-5">
              <step.icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-xs font-semibold text-primary mb-2 tracking-widest uppercase">
              Step {i + 1}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
