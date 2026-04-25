import { useEffect, useMemo, useState } from "react";
import {
  Search,
  User,
  UserPlus,
  Sparkles,
  MapPin,
  Phone,
  Instagram,
  X,
  Send,
  Loader2,
  Info,
  Languages,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { catalogData, type Gender } from "@/data/catalog";
import { perfumeNameAr, ui, type Lang } from "@/data/translations";
import { useToast } from "@/hooks/use-toast";

const Logo = () => (
  <div className="flex flex-col items-center py-6">
    <svg viewBox="0 0 100 100" className="h-20 w-20 mb-2 text-primary">
      <path d="M50 10 L60 10 L60 20 L40 20 L40 10 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M40 20 L60 20 L65 35 L35 35 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M35 35 L25 50 L40 65 L60 65 L75 50 L65 35" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M40 75 L30 85 L50 95 L70 85 L60 75 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="currentColor" fontSize="10" className="italic font-serif">WinWin</text>
    </svg>
    <h1 className="text-primary text-2xl font-bold tracking-[0.3em]">WIN WIN</h1>
    <p className="text-primary/80 text-xs tracking-[0.5em] uppercase">Parfume</p>
  </div>
);

type PerfumeInfo = { name: string; brand: string; loading: boolean; description: string };

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Gender>("Homme");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Toutes");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedPerfumeInfo, setSelectedPerfumeInfo] = useState<PerfumeInfo | null>(null);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    return (localStorage.getItem("ww_lang") as Lang) || "fr";
  });

  const t = ui[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    localStorage.setItem("ww_lang", lang);
  }, [lang, isRtl]);

  const callAdvisor = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("perfume-advisor", {
      body: { ...payload, lang },
    });
    if (error) {
      let message = lang === "ar"
        ? "خدمة الذكاء الاصطناعي غير متوفرة. حاول بعد قليل."
        : "Service IA indisponible. Réessayez dans un instant.";
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const body = await ctx.json();
          if (body?.error) message = body.error;
        } catch { /* ignore */ }
      }
      throw new Error(message);
    }
    return (data as { text?: string })?.text ?? "";
  };

  const handleAiConsultation = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const text = await callAdvisor({ type: "advisor", query: aiQuery });
      setAiResponse(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setAiResponse("");
      toast({ title: t.advisorUnavailable, description: msg, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const analyzePerfume = async (perfume: string, brand: string) => {
    setSelectedPerfumeInfo({ name: perfume, brand, loading: true, description: "" });
    try {
      const text = await callAdvisor({ type: "analyze", name: perfume, brand });
      setSelectedPerfumeInfo({ name: perfume, brand, loading: false, description: text });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setSelectedPerfumeInfo({ name: perfume, brand, loading: false, description: msg });
    }
  };

  const brands = useMemo(
    () => ["Toutes", ...Object.keys(catalogData[activeTab])],
    [activeTab],
  );

  const filteredData = useMemo(() => {
    const currentCategory = catalogData[activeTab];
    const result: Record<string, string[]> = {};
    Object.keys(currentCategory).forEach((brand) => {
      if (selectedBrand === "Toutes" || selectedBrand === brand) {
        const term = searchTerm.toLowerCase();
        const filteredPerfumes = currentCategory[brand].filter((p) => {
          const ar = perfumeNameAr[p] ?? "";
          return p.toLowerCase().includes(term) || ar.includes(searchTerm);
        });
        if (filteredPerfumes.length > 0) result[brand] = filteredPerfumes;
      }
    });
    return result;
  }, [activeTab, searchTerm, selectedBrand]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Bouton IA Flottant */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        aria-label={t.advisorBtn}
        className={`fixed bottom-8 z-[60] bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold ${
          isRtl ? "left-8" : "right-8"
        }`}
      >
        <Sparkles size={24} />
        <span className="hidden md:inline">{t.advisorBtn}</span>
      </button>

      {/* Sélecteur de langue flottant */}
      <button
        onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
        aria-label="Changer la langue"
        className={`fixed top-4 z-[60] bg-card border border-primary/40 text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-primary/10 transition-colors ${
          isRtl ? "left-4" : "right-4"
        }`}
      >
        <Languages size={14} />
        {lang === "fr" ? "العربية" : "Français"}
      </button>

      {/* Header */}
      <header className="bg-background border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <Logo />
          <div className="pb-6 space-y-4">
            <div className="flex bg-card rounded-full p-1 max-w-sm mx-auto border border-border" role="tablist">
              <button
                onClick={() => { setActiveTab("Homme"); setSelectedBrand("Toutes"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${
                  activeTab === "Homme" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                <User size={18} /> {t.homme}
              </button>
              <button
                onClick={() => { setActiveTab("Femme"); setSelectedBrand("Toutes"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${
                  activeTab === "Femme" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                <UserPlus size={18} /> {t.femme}
              </button>
            </div>
            <div className="relative max-w-xl mx-auto">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-primary ${isRtl ? "right-4" : "left-4"}`} size={20} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className={`w-full bg-card border border-border rounded-xl py-3 focus:outline-none focus:border-primary transition-colors text-foreground ${
                  isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filtres Marques */}
      <div className="bg-card/50 border-b border-border overflow-x-auto whitespace-nowrap py-4 px-4 scrollbar-hide">
        <div className="max-w-6xl mx-auto flex gap-3">
          {brands.map((brand) => {
            const label = brand === "Toutes" ? t.all.toUpperCase() : brand.toUpperCase();
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-5 py-1.5 rounded-full text-xs tracking-widest border transition-all ${
                  selectedBrand === brand
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalogue Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="sr-only">Catalogue Win Win Parfume</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(filteredData).map((brand) => (
            <article
              key={brand}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-center mb-6 border-b border-primary/20 pb-3">
                <h3 className="text-primary font-bold tracking-widest text-lg" dir="ltr">{brand}</h3>
                <Sparkles size={16} className="text-primary opacity-50" />
              </div>
              <ul className="space-y-3">
                {filteredData[brand].map((perfume, idx) => {
                  const ar = perfumeNameAr[perfume];
                  return (
                    <li key={idx} className="flex items-center justify-between group/item gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-foreground/80 group-hover/item:text-foreground transition-colors" dir="ltr">
                          {perfume}
                        </span>
                        {ar && (
                          <span className="text-xs text-primary/70 font-serif" dir="rtl">
                            {ar}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => analyzePerfume(perfume, brand)}
                        className="p-1 hover:bg-primary/10 rounded-full transition-colors text-primary shrink-0"
                        title={t.olfactoryAnalysis}
                        aria-label={`${t.olfactoryAnalysis} — ${perfume}`}
                      >
                        <Info size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
          {Object.keys(filteredData).length === 0 && (
            <p className="text-muted-foreground italic col-span-full text-center py-10">
              {t.noResults}
            </p>
          )}
        </div>
      </main>

      {/* Modal Analyse Parfum */}
      {selectedPerfumeInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-primary/30 rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setSelectedPerfumeInfo(null)}
              className={`absolute top-4 text-muted-foreground hover:text-foreground ${isRtl ? "left-4" : "right-4"}`}
              aria-label={t.close}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-primary" dir="ltr">{selectedPerfumeInfo.name}</h3>
                {perfumeNameAr[selectedPerfumeInfo.name] && (
                  <p className="text-xs text-primary/70" dir="rtl">{perfumeNameAr[selectedPerfumeInfo.name]}</p>
                )}
                <p className="text-xs text-muted-foreground tracking-widest uppercase" dir="ltr">
                  {selectedPerfumeInfo.brand}
                </p>
              </div>
            </div>
            {selectedPerfumeInfo.loading ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-sm italic text-muted-foreground">{t.analyzing}</p>
              </div>
            ) : (
              <div className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap italic font-serif">
                "{selectedPerfumeInfo.description}"
              </div>
            )}
            <button
              onClick={() => setSelectedPerfumeInfo(null)}
              className="w-full mt-6 bg-primary/10 text-primary border border-primary/30 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Modal Conseiller IA */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <div
            className="bg-card border border-primary/50 rounded-3xl w-full max-w-2xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-background to-card">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t.advisorTitle}</h2>
                  <p className="text-xs text-primary tracking-widest">{t.poweredBy}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t.close}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto bg-background">
              {!aiResponse && !isAiLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-10">
                  <div className="text-4xl">🎩</div>
                  <p className="text-muted-foreground text-sm italic">
                    {t.intro}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {t.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setAiQuery(s)}
                        className="text-[10px] bg-card border border-border px-3 py-1 rounded-full hover:border-primary/50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isAiLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-primary animate-pulse font-serif italic">
                    {t.loading}
                  </p>
                </div>
              ) : (
                <div className="text-foreground/80 text-sm leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: aiResponse
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-background border-t border-border">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={t.inputPlaceholder}
                  aria-label={t.inputPlaceholder}
                  className="flex-1 bg-card border border-border rounded-2xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-foreground"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiConsultation()}
                />
                <button
                  onClick={handleAiConsultation}
                  disabled={isAiLoading || !aiQuery.trim()}
                  aria-label="Send"
                  className="bg-primary text-primary-foreground p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={24} className={isRtl ? "rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-background border-t border-primary/20 mt-20 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-primary font-bold tracking-widest" dir="ltr">WIN WIN PARFUME</h4>
            <p className="text-sm text-muted-foreground">{t.footerTagline}</p>
          </div>
          <div className="flex gap-8">
            <Phone size={20} className="text-muted-foreground hover:text-primary cursor-pointer" />
            <MapPin size={20} className="text-muted-foreground hover:text-primary cursor-pointer" />
            <Instagram size={20} className="text-muted-foreground hover:text-primary cursor-pointer" />
          </div>
          <div className="text-[10px] text-muted-foreground tracking-widest" dir="ltr">© 2024 WIN WIN PARFUME</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
