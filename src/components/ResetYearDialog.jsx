import { useState } from "react";
import { verifyPin } from "../lib/pin";
import { listStudents } from "../lib/students";
import { archiveCurrentYear, computeSchoolYearLabel } from "../lib/archives";

const MOT_CLE = "REINITIALISER";

/**
 * Fenêtre de confirmation renforcée pour "Réinitialiser l'année" :
 * - il faut taper REINITIALISER en majuscules,
 * - puis ressaisir le code PIN Prof (vérifié auprès de Firestore),
 * - le bouton est bloqué pendant l'opération (pas de double archive),
 * - un message clair indique le résultat (succès ou erreur).
 */
export default function ResetYearDialog({ total, onClose, onDone }) {
  const [motCle, setMotCle] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const annee = computeSchoolYearLabel();

  const pret = motCle === MOT_CLE && pin.length > 0 && !busy;

  async function handleConfirmer(e) {
    e.preventDefault();
    if (!pret) return;
    setErreur("");
    setBusy(true);
    try {
      if (!(await verifyPin(pin))) {
        setErreur("Code PIN incorrect. Rien n'a été modifié.");
        setPin("");
        return;
      }
      // Relit la liste juste avant d'archiver, pour inclure un élève
      // qui se serait inscrit depuis l'ouverture de la page.
      const students = await listStudents();
      if (students.length === 0) {
        setErreur("Aucune fiche à archiver.");
        return;
      }
      const archive = await archiveCurrentYear(students);
      onDone(`${archive.nb_eleves} fiche(s) archivée(s) sous l'année ${archive.annee}. La liste est maintenant vide.`);
    } catch (err) {
      console.error(err);
      setErreur(
        "Erreur pendant la réinitialisation. Vérifie la page Archives avant de réessayer : " +
        "si l'archive de l'année y apparaît, les données sont en sécurité."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleConfirmer} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="mb-2 text-lg font-bold text-red-700">Réinitialiser l'année</h2>
        <p className="mb-3 text-sm text-gray-700">
          Les <strong>{total} fiche(s)</strong> actuelle(s) vont être archivées sous l'année{" "}
          <strong>{annee}</strong>, puis la liste des élèves inscrits sera <strong>entièrement vidée</strong>.
          Les données resteront consultables et exportables dans Archives.
        </p>

        <label className="mb-1 block text-sm font-medium">
          Tape <span className="font-mono font-bold">{MOT_CLE}</span> en majuscules
        </label>
        <input
          className="input mb-3 font-mono"
          value={motCle}
          onChange={(e) => setMotCle(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          disabled={busy}
          autoFocus
        />

        <label className="mb-1 block text-sm font-medium">Code PIN Prof</label>
        <input
          className="input mb-3"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoComplete="off"
          disabled={busy}
        />

        {erreur && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{erreur}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded border px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!pret}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Archivage en cours…" : "Archiver et vider la liste"}
          </button>
        </div>
      </form>
    </div>
  );
}
