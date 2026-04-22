import { useMemo, useState } from "react";
import {
  Search,
  User,
  UserPlus,
  Sparkles,
  MapPin,
  Phone,
  AtSign,
  X,
  Send,
  Info,
} from "lucide-react";
import Logo from "@/components/Logo";
import { catalogData, Category } from "@/data/perfumes";
import { toast } from "@/hooks/use-toast";

interface PerfumeInfo {
  name: string;
  brand: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Category>("Homme");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Toutes");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [selectedPerfumeInfo, setSelectedPerfumeInfo] = useState<PerfumeInfo | null>(null);

  const brands = useMemo(
    () => ["Toutes", ...Object.keys(catalogData[activeTab])],
    [activeTab],
  );

  const filteredData = useMemo(() => {
    const currentCategory = catalogData[activeTab];
    const result: Record<string, string[]> = {};
    Object.keys(currentCategory).forEach((brand) => {
      if (selectedBrand === "Toutes" || selectedBrand === brand) {
        const filteredPerfumes = currentCategory[brand].filter((p) =>
          p.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        if (filteredPerfumes.length > 0) result[brand] = filteredPerfumes;
      }
    });
    return result;
  }, [activeTab, searchTerm, selectedBrand]);

  const handleAiConsultation = () => {
    if (!aiQuery) return;
    toast({
      title: "Conseiller IA bientôt disponible",
      description:
        "Activez Lovable Cloud pour brancher l'expert parfumeur en temps réel.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gold selection:text-primary-foreground">
      {/* Bouton IA Flottant */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-8 right-8 z-[60] bg-gold text-primary-foreground p-4 rounded-full shadow-gold hover:scale-110 transition-transform flex items-center gap-2 font-bold"
        aria-label="Ouvrir le conseiller IA"
      >
        <Sparkles size={24} />
        <span className="hidden md:inline">Conseiller IA ✨</span>
      </button>

      {/* Header */}
      <header className="bg-background border-b border-gold/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <Logo />
          <div className="pb-6 space-y-4">
            <div className="flex bg-secondary/40 rounded-full p-1 max-w-sm mx-auto border border-border">
              <button
                onClick={() => {
                  setActiveTab("Homme");
                  setSelectedBrand("Toutes");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${
                  activeTab === "Homme"
                    ? "bg-gold text-primary-foreground font-bold"
                    : "text-muted-foreground"
                }`}
              >
                <User size={18} /> HOMME
              </button>
              <button
                onClick={() => {
                  setActiveTab("Femme");
                  setSelectedBrand("Toutes");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${
                  activeTab === "Femme"
                    ? "bg-gold text-primary-foreground font-bold"
                    : "text-muted-foreground"
                }`}
              >
                <UserPlus size={18} /> FEMME
              </button>
            </div>
            <div className="relative max-w-xl mx-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gold"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un parfum ou une marque..."
                className="w-full bg-secondary/40 border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filtres Marques */}
      <div className="bg-card border-b border-border overflow-x-auto whitespace-nowrap py-4 px-4 scrollbar-hide">
        <div className="max-w-6xl mx-auto flex gap-3">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-5 py-1.5 rounded-full text-xs tracking-widest border transition-all ${
                selectedBrand === brand
                  ? "bg-gold/10 border-gold text-gold"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {brand.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {Object.keys(filteredData).length === 0 ? (
          <p className="text-center text-muted-foreground py-20 italic">
            Aucun parfum ne correspond à votre recherche.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(filteredData).map((brand) => (
              <article
                key={brand}
                className="bg-card border border-border rounded-2xl p-6 hover:border-gold/30 transition-all group"
              >
                <header className="flex justify-between items-center mb-6 border-b border-gold/20 pb-3">
                  <h3 className="text-gold font-bold tracking-widest text-lg">
                    {brand}
                  </h3>
                  <Sparkles size={16} className="text-gold opacity-50" />
                </header>
                <ul className="space-y-3">
                  {filteredData[brand].map((perfume, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between group/item"
                    >
                      <span className="text-foreground/80 group-hover/item:text-foreground transition-colors">
                        {perfume}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedPerfumeInfo({ name: perfume, brand })
                        }
                        className="p-1 hover:bg-gold/10 rounded-full transition-colors text-gold"
                        title="Détails"
                        aria-label={`Plus d'infos sur ${perfume}`}
                      >
                        <Info size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modal Détail Parfum */}
      {selectedPerfumeInfo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedPerfumeInfo(null)}
        >
          <div
            className="bg-card border border-gold/30 rounded-2xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPerfumeInfo(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gold text-primary-foreground p-2 rounded-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gold">
                  {selectedPerfumeInfo.name}
                </h3>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">
                  {selectedPerfumeInfo.brand}
                </p>
              </div>
            </div>
            <div className="text-foreground/80 text-sm leading-relaxed italic font-serif">
              "Une fragrance signature disponible chez Win Win Parfume.
              Contactez-nous pour découvrir ses notes olfactives et nos
              meilleurs prix."
            </div>
            <button
              onClick={() => setSelectedPerfumeInfo(null)}
              className="w-full mt-6 bg-gold/10 text-gold border border-gold/30 py-2 rounded-xl text-sm font-bold hover:bg-gold/20 transition-colors"
            >
              FERMER
            </button>
          </div>
        </div>
      )}

      {/* Modal Conseiller IA */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
          onClick={() => setIsAiModalOpen(false)}
        >
          <div
            className="bg-card border border-gold/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-gold"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-background to-secondary">
              <div className="flex items-center gap-3">
                <div className="bg-gold text-primary-foreground p-2 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Votre Conseiller Privé ✨
                  </h2>
                  <p className="text-xs text-gold tracking-widest">
                    EXPERT PARFUMEUR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto bg-background">
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-10">
                <div className="text-4xl">🎩</div>
                <p className="text-muted-foreground text-sm italic">
                  "Décrivez-moi vos préférences, une occasion spéciale ou une
                  ambiance, et je trouverai votre signature olfactive idéale."
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Je cherche un parfum frais pour l'été",
                    "Quelque chose d'intense pour une soirée",
                    "Un parfum boisé et élégant",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAiQuery(q)}
                      className="text-[10px] bg-secondary/40 border border-border px-3 py-1 rounded-full hover:border-gold/50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-background border-t border-border">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Posez votre question à l'expert..."
                  className="flex-1 bg-secondary/40 border border-border rounded-2xl py-3 px-4 focus:outline-none focus:border-gold transition-all text-foreground placeholder:text-muted-foreground"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiConsultation()}
                />
                <button
                  onClick={handleAiConsultation}
                  disabled={!aiQuery}
                  className="bg-gold text-primary-foreground p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  aria-label="Envoyer"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-background border-t border-gold/20 mt-20 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <h4 className="text-gold font-bold tracking-widest">
              WIN WIN PARFUME
            </h4>
            <p className="text-sm text-muted-foreground">
              L'élégance, sublimée.
            </p>
          </div>
          <div className="flex gap-8">
            <Phone
              size={20}
              className="text-muted-foreground hover:text-gold cursor-pointer transition-colors"
            />
            <MapPin
              size={20}
              className="text-muted-foreground hover:text-gold cursor-pointer transition-colors"
            />
            <AtSign
              size={20}
              className="text-muted-foreground hover:text-gold cursor-pointer transition-colors"
            />
          </div>
          <div className="text-[10px] text-muted-foreground tracking-widest">
            © 2024 WIN WIN PARFUME
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
