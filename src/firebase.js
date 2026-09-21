import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Ces valeurs viennent de la console Firebase du projet "suivi-as-brassens" :
// Paramètres du projet -> Vos applications -> (ajouter une appli Web) -> "Config".
// Ce ne sont PAS des identifiants secrets (contrairement à la clé de service
// utilisée côté serveur) : elles sont faites pour être visibles côté navigateur,
// c'est le rôle des règles Firestore de protéger les données.
const firebaseConfig = {
  apiKey: "AIzaSyC7CcSZorvSKjL1jYDleTDGpIGoM19pKF0",
  authDomain: "suivi-as-brassens.firebaseapp.com",
  projectId: "suivi-as-brassens",
  storageBucket: "suivi-as-brassens.firebasestorage.app",
  messagingSenderId: "938185630132",
  appId: "1:938185630132:web:dedb10f0fdbe9e70c8d2e1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Authentification anonyme : indispensable pour que les règles Firestore
// puissent exiger "request.auth != null" (donc bloquer tout accès direct à
// la base par quelqu'un qui ne passe pas par ce site), sans faire reposer
// tout le système sur un vrai compte utilisateur. Le code PIN (voir
// src/lib/pin.js) reste la seule protection de l'espace Prof à proprement
// parler : cette authentification anonyme protège la base dans son
// ensemble, pas la distinction élève/prof.
export const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    if (user) {
      resolve(user);
    } else {
      signInAnonymously(auth).then((cred) => resolve(cred.user));
    }
  });
});

