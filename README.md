# Suivi AS — version React / Vite / Firebase

Réécriture de l'application Flask, sur le même socle que tes autres projets
(React + Vite + Tailwind, GitHub Estawa + Vercel, Firebase/Firestore).
Plus de serveur qui dort ou redémarre : c'est un site 100% statique, les
données restent dans le **même projet Firestore `suivi-as-brassens`**
(mêmes noms de champs), donc rien n'est perdu.

**Important — je n'ai pas pu exécuter `npm install` / `npm run build` dans
cet environnement (pas d'accès réseau ici) : le code a été écrit avec soin
mais n'a pas été testé par une vraie compilation. Fais le premier
`npm run build` (ou laisse Vercel le faire) et, s'il y a une erreur,
colle-la moi telle quelle pour que je la corrige tout de suite.**

## 1. Récupérer la configuration Web Firebase

Dans la [console Firebase](https://console.firebase.google.com), projet
`suivi-as-brassens` :
- Icône ⚙️ (Paramètres du projet) → onglet **Général**
- Section "Vos applications" → si aucune appli Web n'existe, clique sur
  l'icône `</>` pour en ajouter une (nom libre, ex. "Suivi AS Web")
- Copie l'objet `firebaseConfig` affiché, et colle ses valeurs dans
  `src/firebase.js` (remplace les `REMPLACER_...`)

Ces valeurs ne sont **pas secrètes** (contrairement à la clé de service
utilisée côté serveur Flask) : elles sont faites pour être visibles dans le
navigateur.

## 2. Activer l'authentification anonyme

Dans la console Firebase → **Authentication** (menu de gauche) → si c'est la
première fois, clique sur "Get started" → onglet **Sign-in method** →
trouve **Anonymous** dans la liste des fournisseurs → active-le (bouton
bascule) → **Enregistrer**.

Sans cette étape, l'appli reste bloquée sur "Chargement…" : c'est ce qui
permet à chaque visiteur (élève ou prof) de se connecter silencieusement
avant d'accéder à Firestore.

## 3. Sécuriser les règles Firestore

Toujours dans la console Firebase → Firestore Database → **Règles**,
remplace le contenu actuel par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

`request.auth != null` bloque tout accès direct à la base par quelqu'un qui
ne passe pas par le site (l'appli connecte automatiquement chaque visiteur
de façon anonyme via Firebase Authentication — rien à faire de ton côté).

**Limite à connaître** : cette règle protège la base dans son ensemble,
mais ne peut pas distinguer "élève" de "professeur" (ça demanderait un vrai
compte par utilisateur). C'est le code PIN, côté application, qui protège
l'espace Prof — comme convenu, un contrôle uniquement côté navigateur,
cohérent avec le reste de tes applis.

## 4. Créer un "Upload preset" Cloudinary (non signé)

Sur [cloudinary.com](https://cloudinary.com) → Settings → **Upload** →
"Upload presets" → **Add upload preset** :
- Signing Mode : **Unsigned**
- Folder (optionnel) : `suivi_as`
- Note le nom du preset généré (ou choisis-en un personnalisé)

C'est indispensable : contrairement au serveur Flask, une appli 100%
navigateur ne peut pas garder de clé secrète Cloudinary.

## 5. Variables d'environnement

Copie `.env.example` en `.env` et renseigne :
```
VITE_CLOUDINARY_CLOUD_NAME=le-nom-de-ton-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=le-nom-du-preset-créé-à-l'étape-3
```

Pense à reporter les deux mêmes variables dans **Vercel → Project Settings
→ Environment Variables** avant le déploiement (sinon les photos ne
s'enverront pas en production).

## 6. Icônes PWA

Les icônes (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
`favicon.ico`) n'ont pas été régénérées : copie-les depuis
`static/icons/` et `static/favicon.ico` de l'ancien projet Flask vers
`public/icons/` et `public/` ici (mêmes noms de fichiers).

## 7. Installer, tester en local

```
npm install
npm run dev
```

## 8. Premier code PIN

Au tout premier accès à `/prof/login`, l'appli te proposera de définir le
code d'accès professeur (stocké haché dans Firestore, changeable ensuite
sans redéploiement).

## 9. Déployer

- Pousse ce dossier sur un nouveau dépôt GitHub (compte Estawa), par
  exemple `suivi-as-react`
- Sur Vercel, importe ce dépôt (Framework preset : Vite), en renseignant
  les variables d'environnement de l'étape 4
- Une fois en ligne, tu peux **supprimer le service Render** de
  l'ancienne version Flask — plus utile.

## Différences avec la version Flask

- Plus de redémarrage/mise en veille : site statique, toujours disponible.
- Les photos (`s.photo`) sont maintenant des URL Cloudinary complètes.
- L'archivage de fin d'année et l'export Excel fonctionnent pareil, mais
  entièrement dans le navigateur (bibliothèque `xlsx`).
- Le mot de passe Prof devient un code PIN (plus proche du fonctionnement
  de tes autres applis), stocké haché dans Firestore.
