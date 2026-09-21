import * as XLSX from "xlsx";
import { MODES_PAIEMENT } from "../config";

export function exportStudentsToExcel(students, filename) {
  const sorted = [...students].sort((a, b) => {
    const an = (a.nom || "").toLowerCase();
    const bn = (b.nom || "").toLowerCase();
    return an.localeCompare(bn) || (a.prenom || "").localeCompare(b.prenom || "");
  });

  const rows = sorted.map((s) => ({
    Nom: s.nom, Prénom: s.prenom, Classe: s.classe,
    "Date de naissance": s.date_naissance, Sexe: s.sexe,
    "Adresse personnelle": s.adresse, "Adresse e-mail": s.email,
    "Téléphone élève": s.telephone_eleve,
    "Représentant 1 - Nom": s.rep1_nom, "Représentant 1 - Lien": s.rep1_lien,
    "Représentant 1 - Téléphone": s.rep1_telephone,
    "Représentant 2 - Nom": s.rep2_nom, "Représentant 2 - Lien": s.rep2_lien,
    "Représentant 2 - Téléphone": s.rep2_telephone,
    Disponibilités: s.disponibilites,
    "Activités pratiquées à l'AS": (s.activites_as || []).join(", "),
    "Pratique en club ?": s.club_pratique, "Club - Activité": s.club_activite,
    "Club - Lieu": s.club_lieu, "Club - Catégorie": s.club_categorie,
    "Club - Niveau de jeu": s.club_niveau,
    "Fiche rendue": s.fiche_rendue,
    "Montant AS dû par défaut (€)": s.montant_du,
    "Cotisation réelle (€)": s.montant_reel !== undefined ? s.montant_reel : s.montant_du,
    "Montant perçu (€)": s.montant_verse,
    "Mode de paiement": MODES_PAIEMENT[s.mode_paiement] || "—",
    "Dossier complet": s.dossier_complet,
    "Horodatage dossier complet": s.horodatage_dossier_complet,
    "Inscription validée OPUS": s.opus_valide,
    "Dernière mise à jour": (s.derniere_maj || "").slice(0, 16).replace("T", " "),
    Observations: s.observations,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!autofilter"] = { ref: ws["!ref"] };
  const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(14, k.length + 2) }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fiche élèves");
  XLSX.writeFile(wb, filename);
}
