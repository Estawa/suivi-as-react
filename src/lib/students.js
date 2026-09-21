import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { MONTANT_AS_DEFAUT } from "../config";
import { computeDossierComplet } from "./dossier";

const COLLECTION = "students";

/**
 * Ajoute la "cotisation réelle" aux fiches créées avant l'introduction de ce
 * champ, en la calant sur le montant dû par défaut déjà présent, sans rien
 * écraser d'existant.
 */
function normalizeStudent(data) {
  if (data && data.montant_reel === undefined) {
    data.montant_reel = data.montant_du;
  }
  return data;
}

export async function listStudents() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => normalizeStudent(d.data()));
}

export async function getStudent(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? normalizeStudent(snap.data()) : null;
}

export async function saveStudent(record) {
  await setDoc(doc(db, COLLECTION, record.id), record);
}

export async function deleteStudent(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Applique un nouveau montant à toutes les fiches dont la cotisation réelle
 * est encore identique au montant dû par défaut (donc jamais ajustée au cas
 * par cas). Les fiches déjà personnalisées (tarif réduit, etc.) ne sont pas
 * touchées, ni le montant dû ni la cotisation réelle.
 */
export async function applyMontantATousLesEleves(montant) {
  const students = await listStudents();
  const batch = writeBatch(db);
  let nbModifiees = 0;
  for (const s of students) {
    const personnalisee = s.montant_reel !== s.montant_du;
    if (personnalisee) continue; // on ne touche pas aux cas particuliers

    const complet = computeDossierComplet(s.fiche_rendue, montant, s.montant_verse);
    const updated = {
      ...s,
      montant_du: montant,
      montant_reel: montant,
      dossier_complet: complet ? "Oui" : "Non",
      horodatage_dossier_complet: complet
        ? (s.dossier_complet === "Oui" ? s.horodatage_dossier_complet : new Date().toLocaleString("fr-FR"))
        : "",
    };
    batch.set(doc(db, COLLECTION, s.id), updated);
    nbModifiees += 1;
  }
  await batch.commit();
  return { nbModifiees, nbIgnorees: students.length - nbModifiees };
}

export function normalize(text) {
  return (text || "").trim().toLowerCase();
}

export function findByIdentity(students, nom, prenom, classe) {
  return (
    students.find(
      (s) =>
        normalize(s.nom) === normalize(nom) &&
        normalize(s.prenom) === normalize(prenom) &&
        normalize(s.classe) === normalize(classe)
    ) || null
  );
}

export function newStudentRecord(nom = "", prenom = "", classe = "", montantDu = MONTANT_AS_DEFAUT) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID().replace(/-/g, ""),
    nom, prenom, classe,
    date_naissance: "", sexe: "", photo: "",
    adresse: "", email: "", telephone_eleve: "",
    rep1_nom: "", rep1_lien: "", rep1_telephone: "",
    rep2_nom: "", rep2_lien: "", rep2_telephone: "",
    disponibilites: "",
    activites_as: [],
    club_pratique: "Non",
    club_activite: "", club_lieu: "", club_categorie: "", club_niveau: "",
    fiche_rendue: "Non",
    montant_du: montantDu,
    montant_reel: montantDu,
    montant_verse: 0,
    mode_paiement: "",
    dossier_complet: "Non",
    horodatage_dossier_complet: "",
    opus_valide: "Non",
    observations: "",
    derniere_maj: now,
    cree_le: now,
  };
}

// Champs qu'un élève peut renseigner lui-même depuis /eleve.
export const ELEVE_EDITABLE_FIELDS = [
  "nom", "prenom", "classe", "date_naissance", "sexe",
  "adresse", "email", "telephone_eleve",
  "rep1_nom", "rep1_lien", "rep1_telephone",
  "rep2_nom", "rep2_lien", "rep2_telephone",
  "disponibilites", "activites_as",
  "club_pratique", "club_activite", "club_lieu", "club_categorie", "club_niveau",
];

// Champs réservés au Prof, jamais montrés côté élève.
export const PROF_ONLY_FIELDS = [
  "fiche_rendue", "montant_du", "montant_reel", "montant_verse", "mode_paiement",
  "dossier_complet", "horodatage_dossier_complet", "opus_valide", "observations",
];

export function eleveView(record) {
  const view = { ...record };
  for (const f of PROF_ONLY_FIELDS) delete view[f];
  return view;
}
