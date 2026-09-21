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
 * C'est la "cotisation réelle" (montant_reel) qui fait foi pour le calcul
 * du dossier complet — pas le montant dû par défaut (montant_du), qui n'est
 * qu'une référence non modifiable sur la fiche individuelle.
 */
export function applyProfUpdates(record, form) {
  const oldComplete = record.dossier_complet === "Oui";
  const ficheRendue = form.fiche_rendue === "Oui" ? "Oui" : "Non";
  const montantReel = parseMontant(form.montant_reel);
  const montantVerse = parseMontant(form.montant_verse);
  const modePaiement = ["cheque", "liquide", "LABAZ"].includes(form.mode_paiement)
    ? form.mode_paiement
    : "";
  const newComplete = computeDossierComplet(ficheRendue, montantReel, montantVerse);

  return {
    ...record,
    ...form,
    fiche_rendue: ficheRendue,
    montant_reel: montantReel,
    montant_verse: montantVerse,
    mode_paiement: modePaiement,
    dossier_complet: newComplete ? "Oui" : "Non",
    horodatage_dossier_complet: newComplete
      ? (oldComplete ? record.horodatage_dossier_complet : new Date().toLocaleString("fr-FR"))
      : "",
    derniere_maj: new Date().toISOString(),
  };
}
