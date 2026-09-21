// Un upload non signé est indispensable ici : contrairement au serveur Flask
// (qui avait la clé secrète Cloudinary), une appli 100% navigateur ne peut pas
// garder de secret. Il faut donc créer, dans la console Cloudinary, un
// "Upload preset" en mode "Unsigned" (Settings -> Upload -> Upload presets ->
// Add upload preset -> Signing Mode: Unsigned), et reporter son nom dans la
// variable d'environnement VITE_CLOUDINARY_UPLOAD_PRESET (voir .env.example).
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadPhoto(file, studentId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", `suivi_as/${studentId}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    throw new Error("Échec de l'envoi de la photo à Cloudinary.");
  }
  const data = await res.json();
  return data.secure_url;
}
