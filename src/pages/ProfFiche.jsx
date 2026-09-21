import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getStudent, saveStudent, deleteStudent, newStudentRecord } from "../lib/students";
import { applyProfUpdates } from "../lib/dossier";
import { uploadPhoto } from "../cloudinary";
import { ACTIVITES_AS, NIVEAUX_JEU, LIENS_PARENTE } from "../config";
import Header from "../components/Header";

export default function ProfFiche({ isNew = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(isNew ? newStudentRecord() : null);
  const [form, setForm] = useState(isNew ? newStudentRecord() : null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      getStudent(id).then((r) => {
        setRecord(r);
        setForm(r);
      });
    }
  }, [id, isNew]);

  if (!record || !form) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleActivite(a) {
    const current = form.activites_as || [];
    set("activites_as", current.includes(a) ? current.filter((x) => x !== a) : [...current, a]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const updated = applyProfUpdates(record, form);
    try {
      await saveStudent(updated);
      if (isNew) {
        navigate(`/prof/eleve/${updated.id}`, { replace: true });
      } else {
        setRecord(updated);
        setForm(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Erreur lors de l'enregistrement, réessaie.");
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadPhoto(file, record.id);
      set("photo", url);
      if (!isNew) {
        const updated = { ...record, photo: url, derniere_maj: new Date().toISOString() };
        await saveStudent(updated);
        setRecord(updated);
      }
    } catch {
      setError("Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer définitivement la fiche de ${record.prenom} ${record.nom} ?`)) return;
    await deleteStudent(record.id);
    navigate("/prof/dashboard");
  }

  const reste = (form.montant_du || 0) - (form.montant_verse || 0);

  return (
    <div>
      <Header
        title={isNew ? "Nouvel élève" : `${record.prenom} ${record.nom}`}
        subtitle="Espace professeur"
        prof
        links={[{ to: "/prof/dashboard", label: "← Tableau de bord" }]}
      />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {saved && <div className="mb-4 rounded bg-green-50 p-2 text-sm text-green-700">Fiche enregistrée.</div>}
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}

        {!isNew && (
          <div className="mb-6 flex items-center gap-4 rounded-xl border bg-white p-4">
            {form.photo ? (
              <img src={form.photo} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">Pas de photo</div>
            )}
            <label className="cursor-pointer rounded border px-3 py-1.5 text-sm">
              {uploading ? "Envoi…" : "Prendre une photo"}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-4">
          <Section title="Identité">
            <Grid>
              <Field label="Nom"><input className="input" value={form.nom} onChange={(e) => set("nom", e.target.value)} required /></Field>
              <Field label="Prénom"><input className="input" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} required /></Field>
              <Field label="Classe"><input className="input" value={form.classe} onChange={(e) => set("classe", e.target.value)} required /></Field>
              {isNew && (
                <Field label="Photo (optionnel)">
                  <input type="file" accept="image/*" capture="environment" className="input" onChange={handlePhoto} />
                </Field>
              )}
            </Grid>
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

          <Section title="Club extérieur">
            <Grid>
              <Field label="Club - Activité"><input className="input" value={form.club_activite} onChange={(e) => set("club_activite", e.target.value)} /></Field>
              <Field label="Niveau">
                <select className="input" value={form.club_niveau} onChange={(e) => set("club_niveau", e.target.value)}>
                  <option value="">—</option>
                  {NIVEAUX_JEU.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
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
            </Grid>
          </Section>

          <Section title="Dossier d'inscription (réservé au professeur)">
            <Grid>
              <Field label="Fiche d'inscription rendue">
                <div className="flex gap-3">
                  {["Oui", "Non"].map((v) => (
                    <label key={v} className="flex items-center gap-1 text-sm">
                      <input type="radio" checked={(form.fiche_rendue || "Non") === v} onChange={() => set("fiche_rendue", v)} /> {v}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Montant de l'AS dû (€)">
                <input type="number" min="0" step="0.01" className="input" value={form.montant_du} onChange={(e) => set("montant_du", e.target.value)} />
              </Field>
              <Field label="Montant perçu (€)">
                <input type="number" min="0" step="0.01" className="input" value={form.montant_verse} onChange={(e) => set("montant_verse", e.target.value)} />
              </Field>
            </Grid>
            <p className="mt-1 text-xs text-gray-500">
              Le montant perçu est le total cumulé : en cas de nouveau versement, remplace la valeur par
              la somme déjà perçue + le nouveau versement.
            </p>
            <div className="mt-3">
              <Field label="Mode de paiement">
                <div className="flex gap-3">
                  {[["cheque", "Chèque"], ["liquide", "Liquide"], ["LABAZ", "LABAZ"]].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-1 text-sm">
                      <input type="radio" checked={form.mode_paiement === v} onChange={() => set("mode_paiement", v)} /> {l}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <Grid className="mt-3">
              <Field label="Dossier complet (calculé)">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${record.dossier_complet === "Oui" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {record.dossier_complet}
                </span>
              </Field>
              <Field label="Reste dû"><input className="input" disabled value={`${reste.toFixed(2)} €`} /></Field>
              <Field label="Inscription validée OPUS">
                <div className="flex gap-3">
                  {["Oui", "Non"].map((v) => (
                    <label key={v} className="flex items-center gap-1 text-sm">
                      <input type="radio" checked={(form.opus_valide || "Non") === v} onChange={() => set("opus_valide", v)} /> {v}
                    </label>
                  ))}
                </div>
              </Field>
            </Grid>
          </Section>

          <Section title="Observations">
            <textarea className="input" rows={3} value={form.observations} onChange={(e) => set("observations", e.target.value)} />
          </Section>

          <button type="submit" className="w-full rounded bg-gray-900 py-2.5 font-medium text-white">
            {isNew ? "Créer la fiche" : "Enregistrer"}
          </button>
        </form>

        {!isNew && (
          <button onClick={handleDelete} className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white">
            Supprimer cette fiche
          </button>
        )}
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

function Grid({ children, className = "" }) {
  return <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
