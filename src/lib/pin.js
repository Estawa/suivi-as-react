import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const CONFIG_DOC = doc(db, "config", "app");
const SESSION_KEY = "suivi_as_prof_authenticated";

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** true si aucun code n'a encore été défini (premier lancement). */
export async function hasPin() {
  const snap = await getDoc(CONFIG_DOC);
  return snap.exists() && !!snap.data().prof_pin_hash;
}

export async function setPin(newPin) {
  const hash = await sha256(newPin);
  await setDoc(CONFIG_DOC, { prof_pin_hash: hash }, { merge: true });
}

export async function verifyPin(candidate) {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists() || !snap.data().prof_pin_hash) return false;
  const hash = await sha256(candidate);
  return hash === snap.data().prof_pin_hash;
}

export function markAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
