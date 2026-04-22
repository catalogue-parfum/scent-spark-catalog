export type Category = "Homme" | "Femme";

export const catalogData: Record<Category, Record<string, string[]>> = {
  Homme: {
    DIOR: ["Sauvage", "Dior Homme", "Fahrenheit", "Oud Ispahan", "Bois d'Argent", "Sauvage Elixir"],
    "TOM FORD": ["Black Orchid", "Tobacco Vanille", "Tom Ford Oud", "Ombré Leather", "Fabulous", "Oud Wood", "Noir Extreme"],
    ARMANI: ["Armani Code", "Acqua di Gio", "Aqua di Gio Profumo", "Stronger With You", "S.W.Y Intensely", "S.W.Y Amber", "S.W.Y Absolutely"],
    GUCCI: ["Gucci Guilty Black", "Gucci Guilty", "Guilty Oud", "Guilty Elixir Men"],
    "YVES SAINT LAURENT": ["La Nuit de l'Homme", "MYSLF", "Y de YSL", "Y Le Parfum YSL", "L'Homme le Parfum"],
    "PACO RABANNE": ["Black XS", "Invictus", "One Million", "One Million Golden Oud", "One Million Royal", "One Million Elixir", "Phantom"],
    "JEAN PAUL GAULTIER": ["Le Male", "Le Male Elixir", "Ultra Male", "Scandal", "Le Beau"],
    VERSACE: ["Eros", "Eros Flame", "Dylan Blue"],
    CREED: ["Creed Aventus", "Creed Aventus Absolu"],
    MARLY: ["Layton", "Sedley", "Percival", "Pegasus"],
    "PARFUMS ORIENTAUX": ["Oud Malaki", "Oud Abyad", "Ana Abyad", "Oud Moud", "Kalimat", "Ragheba", "Mudhila", "Ghobar Dahab"],
  },
  Femme: {
    DIOR: ["J'adore", "Miss Dior", "Oud Ispahan", "Joy Dior"],
    ARMANI: ["Si Armani", "Si Passione", "My Way", "Because It's You"],
    GUCCI: ["Guilty Oud", "Gucci Flora", "Gucci Bamboo"],
    "YVES SAINT LAURENT": ["Libre Intense", "Libre L'Absolu Platine", "Black Opium", "Mon Paris", "Cinéma", "Manifesto", "Libre"],
    LANCÔME: ["La Nuit Trésor", "La Vie est Belle", "Idôle"],
    GIVENCHY: ["L'Interdit", "L'Interdit EDP Rouge"],
    BURBERRY: ["Burberry", "Her EDP", "Goddess"],
    "PACO RABANNE": ["Lady Million", "Olympea"],
    "FRANCIS KURKDJIAN": ["Baccarat Rouge", "Baccarat Rouge Extrait"],
    CHANEL: ["Coco Mademoiselle", "Coco Chanel", "Chance"],
    "NARCISO RODRIGUEZ": ["For Her Pure Musc"],
    "PARFUMS ORIENTAUX": ["Oud Malaki", "Oud Abyad", "Ana Abyad", "Oud Moud", "Kalimat", "Ragheba", "Mudhila", "Ghobar Dahab", "Ameerat Al Arab"],
  },
};
