import { MessageCircle, Send, Instagram } from "lucide-react";

const contacts = [
  { icon: MessageCircle, label: "WhatsApp", value: "+39 123 456 7890", href: "https://wa.me/391234567890" },
  { icon: Send, label: "Telegram", value: "@trovicapi", href: "https://t.me/trovicapi" },
  { icon: Instagram, label: "Instagram", value: "@trovicapi", href: "https://instagram.com/trovicapi" },
];

const ContactInfo = () => (
  <section className="py-6 md:py-10 px-4">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Contattaci</h2>
      <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-xl mx-auto">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl p-2 md:p-4 flex flex-col items-center gap-1 md:gap-2 border-2 border-primary/50 bg-card shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] hover:border-primary transition-colors text-center"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-bg flex items-center justify-center shrink-0">
              <c.icon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">{c.label}</p>
            <p className="text-[11px] md:text-sm font-medium text-foreground break-all">{c.value}</p>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default ContactInfo;