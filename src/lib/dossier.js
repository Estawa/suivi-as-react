export function parseMontant(raw) {
  const cleaned = String(raw ?? "0").trim().replace(",", ".");
  const val = parseFloat(cleaned);
  if (!Number.isFinite(val)) return 0;
  return Math.max(0, Math.round(val * 100) / 100);
}

/**
 * Un dossier n'est "complet" que si la fiche d'inscription a été rendue ET
 * que le montant perçu couvre au moins le montant dû.
 */
export function computeDossierComplet(ficheRendue, montantDu, montantVerse) {
  return ficheRendue === "Oui" && montantVerse >= montantDu;
}

/**
 * Applique les changements du formulaire Prof à une fiche existante :
 * calcule le nouveau statut et gère l'horodatage de complétion.
 */
export function applyProfUpdates(record, form) {
  const oldComplete = record.dossier_complet === "Oui";
  const ficheRendue = form.fiche_rendue === "Oui" ? "Oui" : "Non";
  const montantDu = parseMontant(form.montant_du);
  const montantVerse = parseMontant(form.montant_verse);
  const modePaiement = ["cheque", "liquide", "LABAZ"].includes(form.mode_paiement)
    ? form.mode_paiement
    : "";
  const newComplete = computeDossierComplet(ficheRendue, montantDu, montantVerse);

  return {
    ...record,
    ...form,
    fiche_rendue: ficheRendue,
    montant_du: montantDu,
    montant_verse: montantVerse,
    mode_paiement: modePaiement,
    dossier_complet: newComplete ? "Oui" : "Non",
    horodatage_dossier_complet: newComplete
      ? (oldComplete ? record.horodatage_dossier_complet : new Date().toLocaleString("fr-FR"))
      : "",
    derniere_maj: new Date().toISOString(),
  };
}
