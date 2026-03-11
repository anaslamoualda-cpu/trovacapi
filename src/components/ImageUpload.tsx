import { useState, useRef, useEffect } from "react";
import { X, Loader2, Search, Copy, Check, Camera } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SearchableSelect from "@/components/SearchableSelect";
import { supabase } from "@/integrations/supabase/client";

interface ClothingDetails {
  tipo: string;
  brand: string;
  modello: string;
  colore: string;
  materiale: string;
  stile: string;
  genere: string;
}

const tipoOptions = [
  "Scarpe", "Sandali", "Borse", "Zaini", "Tute", "Pantaloni", "Giacche",
  "Occhiali", "Orologi", "Felpe", "Magliette", "Camicie", "Vestiti", "Gonne",
  "Cappotti", "Cappelli", "Cinture", "Sciarpe", "Gioielli", "Altro",
];

const brandOptions = [
  // Luxury / Alta Moda
  "Gucci", "Prada", "Louis Vuitton", "Chanel", "Hermès", "Dior", "Versace",
  "Balenciaga", "Fendi", "Burberry", "Saint Laurent", "Valentino",
  "Dolce and Gabbana", "Givenchy", "Bottega Veneta", "Celine", "Loewe",
  "Alexander McQueen", "Tom Ford", "Balmain", "Stella McCartney",
  "Salvatore Ferragamo", "Miu Miu", "Brunello Cucinelli", "Loro Piana",
  "Ermenegildo Zegna", "Lanvin", "Maison Margiela", "Rick Owens",
  "Philipp Plein", "Roberto Cavalli", "Moschino", "Etro", "Missoni",
  "Max Mara", "Alberta Ferretti", "Oscar de la Renta", "Carolina Herrera",
  "Elie Saab", "Marchesa", "Vivienne Westwood", "Alexander Wang",
  "Jacquemus", "Amiri", "Fear of God", "Palm Angels", "Kenzo",
  // Accessori / Orologi / Gioielli di lusso
  "Rolex", "Cartier", "Omega", "Patek Philippe", "Audemars Piguet",
  "Hublot", "IWC", "Tag Heuer", "Breitling", "Bulgari", "Tiffany and Co",
  "Van Cleef and Arpels", "Chopard", "Piaget", "Jaeger-LeCoultre",
  // Occhiali di lusso
  "Ray-Ban", "Oakley", "Persol", "Oliver Peoples", "Celine Eyewear",
  // Borse / Pelletteria di lusso
  "Michael Kors", "Coach", "Kate Spade", "Furla", "Longchamp",
  "Mulberry", "MCM", "Goyard", "Moynat",
  // Sportswear / Streetwear
  "Nike", "Adidas", "Moncler", "Off-White", "Supreme", "Stone Island",
  "The North Face", "New Balance", "Converse", "Vans", "Puma", "Reebok",
  "Jordan", "Yeezy", "Comme des Garcons", "A Bathing Ape",
  // Premium / Fashion
  "Ralph Lauren", "Calvin Klein", "Tommy Hilfiger", "Hugo Boss", "Lacoste",
  "Armani", "Timberland", "Diesel", "Paul Smith", "Ted Baker",
  "AllSaints", "Sandro", "Maje", "Reiss",
  // Fast Fashion
  "Zara", "H and M", "Uniqlo", "Massimo Dutti", "COS",
  // Altro
  "Altro",
];

const coloreOptions = [
  "Nero", "Bianco", "Grigio", "Blu", "Rosso", "Verde", "Giallo",
  "Arancione", "Rosa", "Viola", "Marrone", "Beige", "Oro", "Argento",
  "Multicolore",
];

const stileOptions = [
  "Casual", "Sportivo", "Formale", "Elegante", "Streetwear", "Vintage",
  "Bohemian", "Minimalista", "Classico", "Urban",
];

const materialeOptions = [
  "Cotone", "Pelle", "Nylon", "Poliestere", "Lana", "Seta", "Denim",
  "Lino", "Camoscio", "Canvas", "Gomma", "Acciaio", "Plastica", "Tessuto tecnico", "Altro",
];

const ImageUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<ClothingDetails>({
    tipo: "", brand: "", modello: "", colore: "", materiale: "", stile: "", genere: "",
  });
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    setProgress(0);
    const start = Date.now();
    const duration = 30000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 99);
      setProgress(pct);
      if (elapsed >= duration) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || !selected.type.startsWith("image/")) return;

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResultText(null);
    e.target.value = "";
    setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const updateDetail = (key: keyof ClothingDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const searchProducts = async () => {
    if (!file) return;
    setLoading(true);
    setResultText(null);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("clothing-images")
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("clothing-images")
        .getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("search-products", {
        body: {
          image: urlData.publicUrl,
          images: [urlData.publicUrl],
          details,
          timestamp: new Date().toISOString(),
        },
      });
      if (error) throw error;

      const raw = typeof data === "string" ? data : (data?.output || data?.text || data?.message || JSON.stringify(data));
      const urlMatch = raw.match(/https?:\/\/[^\s"'<>\])}]+/);
      const cleanUrl = urlMatch ? urlMatch[0] : raw;
      setResultText(cleanUrl);
    } catch (err) {
      console.error("Ricerca fallita:", err);
      setResultText("Si è verificato un errore durante la ricerca. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setResultText(null);
    setDetails({ tipo: "", brand: "", modello: "", colore: "", materiale: "", stile: "", genere: "" });
  };

  return (
    <section ref={previewRef} className="-mt-8 md:-mt-16 relative z-10 px-4">
      {!preview && (
        <div className="max-w-2xl mx-auto">
          <motion.label
            className="relative block cursor-pointer rounded-2xl overflow-hidden shadow-xl group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 gradient-bg opacity-90" />
            <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-[0.15] select-none pointer-events-none" aria-hidden="true">
              {["👟","👜","⌚","🧥","👔","🕶️","👗","👠","🎒","💍","🧢","👖","👞","🧣","👒","💎","🩴","👝","🧤","👘","👙","🩱","🧦","👚"].map((emoji, i) => (
                <span key={i} className="text-2xl md:text-3xl flex items-center justify-center">{emoji}</span>
              ))}
            </div>

            <div className="relative z-10 py-10 md:py-14 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <Camera className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-lg md:text-xl font-bold text-primary-foreground mb-1">
                Carica una foto
              </p>
              <p className="text-sm text-primary-foreground/70">
                Qualsiasi dimensione e formato
              </p>
            </div>

            <input
              type="file"
              onChange={handleFileSelect}
              className="sr-only"
              style={{ fontSize: "16px" }}
            />
          </motion.label>
        </div>
      )}

      {preview && (
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6">
            {/* Single image preview */}
            <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden bg-secondary">
              <img
                src={preview}
                alt="Foto caricata"
                className="w-full h-auto object-contain max-h-64"
              />
              <button
                onClick={clear}
                className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Change photo */}
            <div className="mt-3 text-center">
              <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors underline">
                Cambia foto
                <input type="file" onChange={handleFileSelect} className="sr-only" style={{ fontSize: "16px" }} />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                Dettaglio dell'articolo
              </p>

              {/* Genere */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Genere *</Label>
                <RadioGroup
                  value={details.genere}
                  onValueChange={(v) => updateDetail("genere", v)}
                  className="flex gap-4"
                >
                  {["Uomo", "Donna", "Unisex"].map((g) => (
                    <div key={g} className="flex items-center gap-1.5">
                      <RadioGroupItem value={g} id={`genere-${g}`} />
                      <Label htmlFor={`genere-${g}`} className="text-sm cursor-pointer">{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Tipo - searchable */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tipo *</Label>
                  <SearchableSelect
                    options={tipoOptions}
                    value={details.tipo.startsWith("Altro:") ? "Altro" : details.tipo}
                    onValueChange={(v) => updateDetail("tipo", v)}
                    placeholder="Seleziona tipo"
                    searchPlaceholder="Cerca tipo..."
                  />
                </div>

                {/* Brand - searchable */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Brand *</Label>
                  <SearchableSelect
                    options={brandOptions}
                    value={details.brand.startsWith("Altro:") ? "Altro" : details.brand}
                    onValueChange={(v) => updateDetail("brand", v)}
                    placeholder="Seleziona brand"
                    searchPlaceholder="Cerca brand..."
                  />
                </div>

                {/* Modello (free text) */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Modello</Label>
                  <Input
                    value={details.modello}
                    onChange={(e) => updateDetail("modello", e.target.value)}
                    placeholder="es. Air Max 90, Oversize..."
                    className="bg-secondary border-0 text-sm"
                  />
                </div>

                {/* Colore */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Colore</Label>
                  <Select value={details.colore} onValueChange={(v) => updateDetail("colore", v)}>
                    <SelectTrigger className="bg-secondary border-0 text-sm"><SelectValue placeholder="Seleziona colore" /></SelectTrigger>
                    <SelectContent>
                      {coloreOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stile */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stile</Label>
                  <Select value={details.stile} onValueChange={(v) => updateDetail("stile", v)}>
                    <SelectTrigger className="bg-secondary border-0 text-sm"><SelectValue placeholder="Seleziona stile" /></SelectTrigger>
                    <SelectContent>
                      {stileOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Materiale */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Materiale</Label>
                  <Select value={details.materiale} onValueChange={(v) => updateDetail("materiale", v)}>
                    <SelectTrigger className="bg-secondary border-0 text-sm"><SelectValue placeholder="Seleziona materiale" /></SelectTrigger>
                    <SelectContent>
                      {materialeOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="default"
                size="lg"
                onClick={searchProducts}
                disabled={loading}
                className="px-8 gradient-bg text-primary-foreground"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Ricerca in corso...</>
                ) : (
                  <><Search className="mr-2 h-5 w-5" />Cerca prodotti simili</>
                )}
              </Button>

              {loading && (
                <div className="mt-4 max-w-xs mx-auto space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                </div>
              )}
            </div>

            {resultText && (
              <div className="mt-6 text-center space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Adesso accedi al link, lì trovi tutto e più!
                </p>
                <p
                  className="text-primary underline text-sm break-all hover:opacity-80 cursor-pointer select-all"
                  onClick={() => window.open(resultText, '_blank', 'noopener,noreferrer')}
                >
                  {resultText}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resultText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <><Check className="h-3.5 w-3.5 text-primary" /> Copiato!</> : <><Copy className="h-3.5 w-3.5" /> Copia link</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageUpload;
