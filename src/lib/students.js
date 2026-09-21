import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { MONTANT_AS_DEFAUT } from "../config";

const COLLECTION = "students";

export async function listStudents() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => d.data());
}

export async function getStudent(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? snap.data() : null;
}

export async function saveStudent(record) {
  await setDoc(doc(db, COLLECTION, record.id), record);
}

export async function deleteStudent(id) {
  await deleteDoc(doc(db, COLLECTION, id));
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

export function newStudentRecord(nom = "", prenom = "", classe = "") {
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
    montant_du: MONTANT_AS_DEFAUT,
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
  "fiche_rendue", "montant_du", "montant_verse", "mode_paiement",
  "dossier_complet", "horodatage_dossier_complet", "opus_valide", "observations",
];

export function eleveView(record) {
  const view = { ...record };
  for (const f of PROF_ONLY_FIELDS) delete view[f];
  return view;
}
