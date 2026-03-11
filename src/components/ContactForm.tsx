import { useState } from "react";
import { Send, Loader2, X, CheckCircle, Plus, Link as LinkIcon, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactData {
  nome: string;
  whatsapp: string;
  telegram: string;
  email: string;
}

const ContactForm = () => {
  const [data, setData] = useState<ContactData>({
    nome: "", whatsapp: "", telegram: "", email: "",
  });
  const [note, setNote] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof ContactData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  };
  const addLink = () => setLinks((prev) => [...prev, ""]);
  const removeLink = (index: number) => setLinks((prev) => prev.filter((_, i) => i !== index));

  // Simple photo handler using URL.createObjectURL
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    // Reset after a delay to allow re-selection of same file
    setTimeout(() => { e.target.value = ""; }, 100);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nome.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    setLoading(true);
    try {
      const fotoUrls: string[] = [];
      for (const p of photos) {
        const fileName = `contacts/${Date.now()}-${Math.random().toString(36).slice(2)}-${p.file.name}`;
        const { error: upErr } = await supabase.storage
          .from("clothing-images")
          .upload(fileName, p.file, { contentType: p.file.type });
        if (upErr) {
          toast.error("Errore upload foto: " + upErr.message);
          throw upErr;
        }
        const { data: urlData } = supabase.storage
          .from("clothing-images")
          .getPublicUrl(fileName);
        fotoUrls.push(urlData.publicUrl);
      }

      const cleanLinks = links.map((l) => l.trim()).filter(Boolean);

      const { error } = await supabase.from("contacts").insert({
        nome: data.nome.trim(),
        whatsapp: data.whatsapp.trim() || null,
        telegram: data.telegram.trim() || null,
        email: data.email.trim() || null,
        link: cleanLinks[0] || null,
        foto_url: fotoUrls[0] || null,
        links: cleanLinks,
        foto_urls: fotoUrls,
        note: note.trim() || null,
      } as any);
      if (error) {
        toast.error("Errore salvataggio: " + error.message);
        throw error;
      }

      setSubmitted(true);
      toast.success("Dati inviati con successo!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData({ nome: "", whatsapp: "", telegram: "", email: "" });
    setNote("");
    setLinks([""]);
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <section className="py-16 px-4">
        <motion.div
          className="max-w-lg mx-auto glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          </motion.div>
          <motion.h3
            className="text-xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Grazie!
          </motion.h3>
          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            I tuoi dati sono stati inviati con successo. Ti risponderemo al più presto possibile!
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="outline" onClick={reset}>Invia altri dati</Button>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  const formFields: { key: keyof ContactData; label: string; placeholder: string; type?: string }[] = [
    { key: "nome", label: "Nome *", placeholder: "Il tuo nome" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "+39 123 456 7890", type: "tel" },
    { key: "telegram", label: "Telegram", placeholder: "@username" },
    { key: "email", label: "Email", placeholder: "email@esempio.com", type: "email" },
  ];

  return (
    <section className="py-4 md:py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Inserisci i tuoi dati per ricevere prezzi
        </h2>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4 border-2 border-primary/50 bg-card shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]">
          {formFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`contact-${f.key}`} className="text-sm text-muted-foreground">
                {f.label}
              </Label>
              <Input
                id={`contact-${f.key}`}
                type={f.type || "text"}
                value={data[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="bg-secondary border-0"
              />
            </div>
          ))}

          {/* Multiple Links */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" /> Link
            </Label>
            {links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateLink(i, e.target.value)}
                  placeholder="https://... o www...."
                  className="bg-secondary border-0"
                />
                {links.length > 1 && (
                  <button type="button" onClick={() => removeLink(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={addLink} className="text-xs">
              <Plus className="mr-1 h-3 w-3" /> Aggiungi link
            </Button>
          </div>

          {/* Multiple Photos - plain native input */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Foto
            </Label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative inline-block">
                    <img src={p.preview} alt={`Foto ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 py-1.5 px-3 rounded-md border border-input bg-background text-foreground text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
              <Camera className="h-4 w-4" />
              {photos.length > 0 ? "Carica un'altra foto" : "Carica foto"}
              <input
                type="file"
                multiple
                onChange={handlePhotoSelect}
                className="sr-only"
                style={{ fontSize: "16px" }}
              />
            </label>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="contact-note" className="text-sm text-muted-foreground">
              Note
            </Label>
            <Textarea
              id="contact-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Scrivi qui eventuali note o richieste..."
              className="bg-secondary border-0 min-h-[80px]"
              maxLength={500}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full gradient-bg text-primary-foreground" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Invio in corso...</>
              ) : (
                <><Send className="mr-2 h-5 w-5" />Invia dati</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;