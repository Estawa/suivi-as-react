import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { MONTANT_AS_DEFAUT as MONTANT_INITIAL } from "../config";

// Même document que le code PIN (src/lib/pin.js) : un seul petit document de
// réglages pour toute l'appli.
const CONFIG_DOC = doc(db, "config", "app");

export async function getMontantAdhesion() {
  const snap = await getDoc(CONFIG_DOC);
  if (snap.exists() && typeof snap.data().montant_as_defaut === "number") {
    return snap.data().montant_as_defaut;
  }
  return MONTANT_INITIAL;
}

export async function setMontantAdhesion(montant) {
  await setDoc(CONFIG_DOC, { montant_as_defaut: montant }, { merge: true });
}
