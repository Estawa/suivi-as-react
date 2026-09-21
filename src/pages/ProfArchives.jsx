import { useEffect, useState } from "react";
import { listArchives } from "../lib/archives";
import { exportStudentsToExcel } from "../lib/excelExport";
import Header from "../components/Header";

export default function ProfArchives() {
  const [archives, setArchives] = useState(null);

  useEffect(() => {
    listArchives().then(setArchives);
  }, []);

  if (!archives) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  return (
    <div>
      <Header title="Archives" subtitle="Années précédentes" prof links={[{ to: "/prof/dashboard", label: "← Tableau de bord" }]} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {archives.length === 0 && (
          <p className="text-gray-500">Aucune année archivée pour l'instant.</p>
        )}
        <div className="space-y-3">
          {archives.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
              <div>
                <div className="font-semibold">{a.annee}</div>
                <div className="text-sm text-gray-500">
                  {a.nb_eleves} élève(s) — archivé le {(a.archive_le || "").slice(0, 10)}
                </div>
              </div>
              <button
                onClick={() => exportStudentsToExcel(a.students, `Fiche_suivi_eleves_AS_${a.annee}.xlsx`)}
                className="rounded border px-3 py-1.5 text-sm text-indigo-600"
              >
                Exporter Excel
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
