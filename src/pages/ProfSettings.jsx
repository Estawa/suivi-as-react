import { useEffect, useState } from "react";
import { getMontantAdhesion, setMontantAdhesion } from "../lib/settings";
import { applyMontantATousLesEleves } from "../lib/students";
import Header from "../components/Header";

export default function ProfSettings() {
  const [montant, setMontant] = useState(null);
  const [saisie, setSaisie] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMontantAdhesion().then((m) => {
      setMontant(m);
      setSaisie(String(m));
    });
  }, []);

  async function handleEnregistrer(e) {
    e.preventDefault();
    setMessage("");
    setErreur("");
    const valeur = parseFloat(String(saisie).replace(",", "."));
    if (!Number.isFinite(valeur) || valeur < 0) {
      setErreur("Montant invalide.");
      return;
    }
    if (!window.confirm(
      `Confirmer le nouveau montant de l'adhésion AS : ${valeur.toFixed(2)} € ?\n\n` +
      `Ce montant sera proposé par défaut pour chaque NOUVELLE fiche élève créée à partir de maintenant. ` +
      `Les fiches déjà existantes ne sont pas modifiées (utilise le bouton ci-dessous pour ça, séparément).`
    )) {
      return;
    }
    setBusy(true);
    try {
      await setMontantAdhesion(valeur);
      setMontant(valeur);
      setMessage("Montant par défaut mis à jour.");
    } catch {
      setErreur("Erreur lors de l'enregistrement, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAppliquerATous() {
    setMessage("");
    setErreur("");
    const valeur = montant;
    if (!Number.isFinite(valeur) || valeur < 0) return;
    const confirmation = window.prompt(
      `Cette action va remplacer le montant dû sur toutes les fiches élèves qui ont encore le montant ` +
      `par défaut d'origine, par ${valeur.toFixed(2)} €. Les fiches déjà ajustées au cas par cas (tarif ` +
      `réduit, etc.) ne seront pas touchées. Le statut "dossier complet" sera recalculé pour les fiches ` +
      `modifiées.\n\n` +
      `Tape OUI en majuscules pour confirmer.`
    );
    if (confirmation !== "OUI") return;
    setBusy(true);
    try {
      const { nbModifiees, nbIgnorees } = await applyMontantATousLesEleves(valeur);
      setMessage(
        `Montant appliqué à ${nbModifiees} fiche(s).` +
        (nbIgnorees > 0 ? ` ${nbIgnorees} fiche(s) ajustée(s) au cas par cas ont été laissée(s) inchangée(s).` : "")
      );
    } catch {
      setErreur("Erreur lors de la mise à jour, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  if (montant === null) {
    return <div className="p-8 text-center text-gray-500">Chargement…</div>;
  }

  return (
    <div>
      <Header title="Réglages" subtitle="Espace professeur" prof links={[{ to: "/prof/dashboard", label: "← Tableau de bord" }]} />
      <main className="mx-auto max-w-md px-4 py-8">
        {message && <div className="mb-4 rounded bg-green-50 p-2 text-sm text-green-700">{message}</div>}
        {erreur && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{erreur}</div>}

        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-1 text-lg font-semibold">Montant de l'adhésion AS</h2>
          <p className="mb-4 text-sm text-gray-500">
            Montant proposé par défaut pour chaque nouvelle fiche élève créée
            (inscription en ligne ou fiche créée manuellement par le prof).
          </p>
          <form onSubmit={handleEnregistrer} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Montant (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded bg-gray-900 py-2.5 font-medium text-white disabled:opacity-60"
            >
              Enregistrer le nouveau montant par défaut
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-amber-300 bg-white p-5">
          <h2 className="mb-1 text-lg font-semibold text-amber-700">Appliquer à toutes les fiches existantes</h2>
          <p className="mb-4 text-sm text-gray-500">
            Remplace le montant dû par la valeur actuellement enregistrée ci-dessus ({montant.toFixed(2)} €)
            sur toutes les fiches déjà créées cette année <strong>qui n'ont pas été ajustées au cas par cas</strong> —
            les fiches avec une cotisation réelle personnalisée (tarif réduit, etc.) sont automatiquement
            laissées de côté. Une confirmation explicite est demandée avant toute application.
          </p>
          <button
            onClick={handleAppliquerATous}
            disabled={busy}
            className="w-full rounded bg-amber-600 py-2.5 font-medium text-white disabled:opacity-60"
          >
            Appliquer {montant.toFixed(2)} € à toutes les fiches non ajustées
          </button>
        </div>
      </main>
    </div>
  );
}
