import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: "N8N_WEBHOOK_URL not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Creiamo i parametri separati per GET
    const params = new URLSearchParams({
      image: body.image || "",
      timestamp: body.timestamp || "",
      tipo: body.details?.tipo || "",
      brand: body.details?.brand || "",
      modello: body.details?.modello || "",
      colore: body.details?.colore || "",
      materiale: body.details?.materiale || "",
      stile: body.details?.stile || "",
      genere: body.details?.genere || "",
    });

    // GET verso il webhook n8n
    const response = await fetch(`${webhookUrl}?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("search-products error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
