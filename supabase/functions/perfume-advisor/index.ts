// Edge function: proxies requests to Lovable AI Gateway.
// No API key handling on the client side.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const CATALOG = {
  Homme: {
    "DIOR": ["Sauvage", "Dior Homme", "Fahrenheit", "Oud Ispahan", "Bois d'Argent", "Sauvage Elixir"],
    "TOM FORD": ["Black Orchid", "Tobacco Vanille", "Tom Ford Oud", "Ombré Leather", "Fabulous", "Oud Wood", "Noir Extreme"],
    "ARMANI": ["Armani Code", "Acqua di Gio", "Aqua di Gio Profumo", "Stronger With You", "S.W.Y Intensely", "S.W.Y Amber", "S.W.Y Absolutely"],
    "GUCCI": ["Gucci Guilty Black", "Gucci Guilty", "Guilty Oud", "Guilty Elixir Men"],
    "YVES SAINT LAURENT": ["La Nuit de l'Homme", "MYSLF", "Y de YSL", "Y Le Parfum YSL", "L'Homme le Parfum"],
    "PACO RABANNE": ["Black XS", "Invictus", "One Million", "One Million Golden Oud", "One Million Royal", "One Million Elixir", "Phantom"],
    "JEAN PAUL GAULTIER": ["Le Male", "Le Male Elixir", "Ultra Male", "Scandal", "Le Beau"],
    "VERSACE": ["Eros", "Eros Flame", "Dylan Blue"],
    "CREED": ["Creed Aventus", "Creed Aventus Absolu"],
    "MARLY": ["Layton", "Sedley", "Percival", "Pegasus"],
    "PARFUMS ORIENTAUX": ["Oud Malaki", "Oud Abyad", "Ana Abyad", "Oud Moud", "Kalimat", "Ragheba", "Mudhila", "Ghobar Dahab"],
  },
  Femme: {
    "DIOR": ["J'adore", "Miss Dior", "Oud Ispahan", "Joy Dior"],
    "ARMANI": ["Si Armani", "Si Passione", "My Way", "Because It's You"],
    "GUCCI": ["Guilty Oud", "Gucci Flora", "Gucci Bamboo"],
    "YVES SAINT LAURENT": ["Libre Intense", "Libre L'Absolu Platine", "Black Opium", "Mon Paris", "Cinéma", "Manifesto", "Libre"],
    "LANCÔME": ["La Nuit Trésor", "La Vie est Belle", "Idôle"],
    "GIVENCHY": ["L'Interdit", "L'Interdit EDP Rouge"],
    "BURBERRY": ["Burberry", "Her EDP", "Goddess"],
    "PACO RABANNE": ["Lady Million", "Olympea"],
    "FRANCIS KURKDJIAN": ["Baccarat Rouge", "Baccarat Rouge Extrait"],
    "CHANEL": ["Coco Mademoiselle", "Coco Chanel", "Chance"],
    "NARCISO RODRIGUEZ": ["For Her Pure Musc"],
    "PARFUMS ORIENTAUX": ["Oud Malaki", "Oud Abyad", "Ana Abyad", "Oud Moud", "Kalimat", "Ragheba", "Mudhila", "Ghobar Dahab", "Ameerat Al Arab"],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY non configurée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const type: "advisor" | "analyze" = body?.type ?? "advisor";

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "analyze") {
      const name = String(body?.name ?? "").slice(0, 120);
      const brand = String(body?.brand ?? "").slice(0, 120);
      if (!name || !brand) {
        return new Response(JSON.stringify({ error: "name et brand requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      systemPrompt = "Tu es un sommelier de la parfumerie de luxe. Réponds en français, ton poétique et raffiné.";
      userPrompt = `Décris brièvement les notes olfactives (tête, cœur, fond) du parfum "${name}" de la marque "${brand}". Sois poétique et luxueux. Limite-toi à 3-4 phrases.`;
    } else {
      const query = String(body?.query ?? "").slice(0, 800);
      if (!query) {
        return new Response(JSON.stringify({ error: "query requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      systemPrompt = `Tu es l'expert parfumeur de "Win Win Parfume". Tu conseilles le client EXCLUSIVEMENT parmi notre catalogue : ${JSON.stringify(CATALOG)}. Réponds en français avec élégance et luxe. Suggère 2 ou 3 parfums précis du catalogue en expliquant pourquoi ils correspondent. Utilise des listes à puces (-) et **gras** pour les noms de parfums.`;
      userPrompt = query;
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de demandes, veuillez patienter quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez du crédit dans Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("perfume-advisor error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
