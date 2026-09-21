// Listes utilisées dans les formulaires. Pour les modifier, éditer ce
// fichier puis redéployer (contrairement au code PIN, changeable sans
// redéploiement — voir src/lib/pin.js).
export const ACTIVITES_AS = [
  "Badminton", "Volley-ball", "Basket-ball", "Futsal", "Football",
  "Escalade", "Tennis de table", "Danse", "Musculation", "Hiit",
  "Athlétisme", "Gymnastique",
];

export const NIVEAUX_JEU = [
  "Loisir", "Compétition départementale", "Compétition académique",
  "Compétition nationale", "Autre",
];

export const LIENS_PARENTE = ["Père", "Mère", "Tuteur légal", "Tutrice légale", "Autre"];

export const MONTANT_AS_DEFAUT = 20;

export const MODES_PAIEMENT = { cheque: "Chèque", liquide: "Liquide", LABAZ: "LABAZ" };
