import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudent, saveStudent, eleveView, ELEVE_EDITABLE_FIELDS } from "../lib/students";
import { uploadPhoto } from "../cloudinary";
import { ACTIVITES_AS, NIVEAUX_JEU, LIENS_PARENTE } from "../config";
import Header from "../components/Header";

export default function EleveFiche() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudent(id).then((r) => {
      setRecord(r);
      setForm(r ? eleveView(r) : null);
    });
  }, [id]);

  if (!record || !form) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>;
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleActivite(a) {
    const current = form.activites_as || [];
    set(
      "activites_as",
      current.includes(a) ? current.filter((x) => x !== a) : [...current, a]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const updates = {};
    for (const f of ELEVE_EDITABLE_FIELDS) updates[f] = form[f];
    const updated = { ...record, ...updates, derniere_maj: new Date().toISOString() };
    try {
      await saveStudent(updated);
      setRecord(updated);
      setSaved(true);
      // Le message de confirmation est en haut de la page : sans ce scroll,
      // quelqu'un qui vient de cliquer "Enregistrer" tout en bas d'un long
      // formulaire ne le voit jamais et croit que rien ne s'est passé.
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setError("Erreur lors de l'enregistrement, réessaie.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadPhoto(file, record.id);
      const updated = { ...record, photo: url, derniere_maj: new Date().toISOString() };
      await saveStudent(updated);
      setRecord(updated);
    } catch {
      setError("Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Header title="Suivi AS" subtitle="Ma fiche d'inscription" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {saved && (
          <div className="mb-4 rounded bg-green-50 p-2 text-sm text-green-700">
            Fiche enregistrée.
          </div>
        )}
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}

        <div className="mb-6 flex items-center gap-4 rounded-xl border bg-white p-4">
          {record.photo ? (
            <img src={record.photo} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
              Pas de photo
            </div>
          )}
          <label className="cursor-pointer rounded border px-3 py-1.5 text-sm">
            {uploading ? "Envoi…" : "Prendre / choisir une photo"}
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhoto}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-4">
          <Section title="Identité">
            <Grid>
              <Field label="Nom"><input className="input" value={form.nom} onChange={(e) => set("nom", e.target.value)} required /></Field>
              <Field label="Prénom"><input className="input" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} required /></Field>
              <Field label="Classe"><input className="input" value={form.classe} onChange={(e) => set("classe", e.target.value)} required /></Field>
              <Field label="Sexe">
                <div className="flex gap-3">
                  {["F", "M"].map((v) => (
                    <label key={v} className="flex items-center gap-1 text-sm">
                      <input type="radio" checked={form.sexe === v} onChange={() => set("sexe", v)} /> {v}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Date de naissance"><input type="date" className="input" value={form.date_naissance} onChange={(e) => set("date_naissance", e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section title="Coordonnées">
            <Grid>
              <Field label="Adresse personnelle"><input className="input" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} /></Field>
              <Field label="Adresse e-mail"><input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Téléphone élève"><input type="tel" className="input" value={form.telephone_eleve} onChange={(e) => set("telephone_eleve", e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section title="Représentants légaux">
            <Grid>
              <Field label="Représentant 1 — Nom"><input className="input" value={form.rep1_nom} onChange={(e) => set("rep1_nom", e.target.value)} /></Field>
              <Field label="Lien de parenté">
                <select className="input" value={form.rep1_lien} onChange={(e) => set("rep1_lien", e.target.value)}>
                  <option value="">—</option>
                  {LIENS_PARENTE.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Téléphone"><input type="tel" className="input" value={form.rep1_telephone} onChange={(e) => set("rep1_telephone", e.target.value)} /></Field>
              <Field label="Représentant 2 — Nom"><input className="input" value={form.rep2_nom} onChange={(e) => set("rep2_nom", e.target.value)} /></Field>
              <Field label="Lien de parenté">
                <select className="input" value={form.rep2_lien} onChange={(e) => set("rep2_lien", e.target.value)}>
                  <option value="">—</option>
                  {LIENS_PARENTE.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Téléphone"><input type="tel" className="input" value={form.rep2_telephone} onChange={(e) => set("rep2_telephone", e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section title="Disponibilités">
            <textarea className="input" rows={3} value={form.disponibilites} onChange={(e) => set("disponibilites", e.target.value)} placeholder="Créneaux libres dans l'emploi du temps" />
          </Section>

          <Section title="Activités AS">
            <div className="flex flex-wrap gap-2">
              {ACTIVITES_AS.map((a) => (
                <label key={a} className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${form.activites_as?.includes(a) ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>
                  <input type="checkbox" className="hidden" checked={form.activites_as?.includes(a) || false} onChange={() => toggleActivite(a)} />
                  {a}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Pratique en club extérieur">
            <div className="mb-3 flex gap-3">
              {["Oui", "Non"].map((v) => (
                <label key={v} className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={(form.club_pratique || "Non") === v} onChange={() => set("club_pratique", v)} /> {v}
                </label>
              ))}
            </div>
            <Grid>
              <Field label="Activité"><input className="input" value={form.club_activite} onChange={(e) => set("club_activite", e.target.value)} /></Field>
              <Field label="Lieu / structure"><input className="input" value={form.club_lieu} onChange={(e) => set("club_lieu", e.target.value)} /></Field>
              <Field label="Catégorie"><input className="input" value={form.club_categorie} onChange={(e) => set("club_categorie", e.target.value)} /></Field>
              <Field label="Niveau de jeu">
                <select className="input" value={form.club_niveau} onChange={(e) => set("club_niveau", e.target.value)}>
                  <option value="">—</option>
                  {NIVEAUX_JEU.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
            </Grid>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-gray-900 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved && (
            <p className="mt-2 text-center text-sm font-medium text-green-700">
              ✓ Fiche enregistrée
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-2 border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
