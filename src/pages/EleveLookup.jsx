import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listStudents, findByIdentity, newStudentRecord, saveStudent } from "../lib/students";
import { getMontantAdhesion } from "../lib/settings";
import Header from "../components/Header";

export default function EleveLookup() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classe, setClasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !classe.trim()) {
      setError("Merci de renseigner ton nom, prénom et classe.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const students = await listStudents();
      let record = findByIdentity(students, nom, prenom, classe);
      if (!record) {
        const montant = await getMontantAdhesion();
        record = newStudentRecord(nom.trim(), prenom.trim(), classe.trim(), montant);
        await saveStudent(record);
      }
      navigate(`/eleve/fiche/${record.id}`);
    } catch (err) {
      setError("Une erreur est survenue, réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header
        title="Suivi AS"
        subtitle="Inscription élève"
        links={[{ to: "/prof/login", label: "Tu es professeur ? Connexion ici" }]}
      />
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">Qui es-tu ?</h2>
          <p className="mb-4 text-sm text-gray-500">
            Renseigne ton nom, prénom et classe pour accéder (ou créer) ta fiche d'inscription.
          </p>
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Nom</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Prénom</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Classe</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-gray-900 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Chargement…" : "Commencer"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
