import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    if (!image) throw new Error("No image provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sei un esperto di moda, abbigliamento e accessori. Analizza l'immagine dell'articolo (es. capo di abbigliamento, scarpe, borse, cinture, orologi, ecc.) e restituisci le informazioni in formato strutturato.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analizza questo articolo e identificalo.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "clothing_analysis",
              description: "Return structured analysis of a clothing item from an image.",
              parameters: {
                type: "object",
                properties: {
                  tipo: { type: "string", description: "Tipo di articolo (es. felpa, giacca, scarpe, pantaloni, orologio, cintura)" },
                  brand: { type: "string", description: "Brand/marca se riconoscibile, altrimenti 'Non identificato'" },
                  modello: { type: "string", description: "Nome o tipo di modello se riconoscibile" },
                  colore: { type: "string", description: "Colore principale" },
                  materiale: { type: "string", description: "Materiale probabile (es. cotone, pelle, nylon, acciaio)" },
                  stile: { type: "string", description: "Stile (es. streetwear, casual, elegante, sportivo)" },
                  descrizione: { type: "string", description: "Breve descrizione dell'articolo in 1-2 frasi" },
                },
                required: ["tipo", "brand", "modello", "colore", "materiale", "stile", "descrizione"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "clothing_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppi richieste, riprova tra poco." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) throw new Error("No analysis returned from AI");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-clothing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
