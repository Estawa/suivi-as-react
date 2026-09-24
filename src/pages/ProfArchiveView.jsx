import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getArchive } from "../lib/archives";
import { exportStudentsToExcel } from "../lib/excelExport";
import { ACTIVITES_AS, MODES_PAIEMENT } from "../config";
import Header from "../components/Header";
import ArchiveBanner from "../components/ArchiveBanner";

export default function ProfArchiveView() {
  const { archiveId } = useParams();
  const navigate = useNavigate();
  const [archive, setArchive] = useState(undefined); // undefined = chargement, null = introuvable
  const [q, setQ] = useState("");
  const [classe, setClasse] = useState("");
  const [activite, setActivite] = useState("");
  const [dossier, setDossier] = useState("");
  const [sort, setSort] = useState({ field: "nom", dir: "asc" });

  useEffect(() => {
    getArchive(archiveId).then(setArchive).catch(() => setArchive(null));
  }, [archiveId]);

  const students = archive?.students || [];

  const allClasses = useMemo(
    () => [...new Set(students.map((s) => s.classe).filter(Boolean))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    let list = students;
    const norm = (t) => (t || "").toLowerCase();
    if (q) list = list.filter((s) => norm(s.nom).includes(norm(q)) || norm(s.prenom).includes(norm(q)));
    if (classe) list = list.filter((s) => s.classe === classe);
    if (activite) list = list.filter((s) => (s.activites_as || []).includes(activite));
    if (dossier) list = list.filter((s) => s.dossier_complet === dossier);
    return [...list].sort((a, b) => {
      const cmp = norm(a[sort.field]).localeCompare(norm(b[sort.field]));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [students, q, classe, activite, dossier, sort]);

  if (archive === undefined) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  if (archive === null) {
    return (
      <div>
        <Header title="Archive introuvable" prof links={[{ to: "/prof/archives", label: "← Archives" }]} />
        <p className="p-8 text-center text-gray-500">Cette archive n'existe pas ou n'a pas pu être chargée.</p>
      </div>
    );
  }

  const total = students.length;
  const complets = students.filter((s) => s.dossier_complet === "Oui").length;

  function toggleSort(field) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));
  }

  return (
    <div>
      <ArchiveBanner annee={archive.annee} />
      <Header
        title={`Suivi des élèves de l'AS — ${archive.annee}`}
        subtitle={`Archivé le ${(archive.archive_le || "").slice(0, 10)}`}
        prof
        links={[{ to: "/prof/archives", label: "← Archives" }]}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Élèves inscrits" value={total} />
          <Stat label="Dossiers complets" value={complets} color="text-green-600" />
          <Stat label="Dossiers incomplets" value={total - complets} color="text-red-600" />
          <button
            onClick={() => exportStudentsToExcel(students, `Fiche_suivi_eleves_AS_${archive.annee}.xlsx`)}
            className="rounded-xl border bg-white p-4 text-left shadow-sm hover:bg-gray-50"
          >
            <div className="text-sm font-medium text-indigo-600">Exporter en Excel</div>
            <div className="text-xs text-gray-400">Toute l'année {archive.annee}</div>
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border bg-white p-3">
          <input className="input max-w-xs" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-[10rem]" value={classe} onChange={(e) => setClasse(e.target.value)}>
            <option value="">Toutes les classes</option>
            {allClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input max-w-[12rem]" value={activite} onChange={(e) => setActivite(e.target.value)}>
            <option value="">Toutes les activités</option>
            {ACTIVITES_AS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="input max-w-[10rem]" value={dossier} onChange={(e) => setDossier(e.target.value)}>
            <option value="">Tous les dossiers</option>
            <option value="Oui">Complet</option>
            <option value="Non">Incomplet</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-2"></th>
                <SortTh field="nom" label="Nom" sort={sort} onSort={toggleSort} />
                <th className="px-3 py-2">Prénom</th>
                <SortTh field="classe" label="Classe" sort={sort} onSort={toggleSort} />
                <th className="px-3 py-2">Activités AS</th>
                <SortTh field="dossier_complet" label="Dossier" sort={sort} onSort={toggleSort} />
                <th className="px-3 py-2">Perçu</th>
                <th className="px-3 py-2">Paiement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/prof/archives/${archiveId}/eleve/${s.id}`)}
                  className="cursor-pointer border-b hover:bg-gray-50"
                >
                  <td className="px-3 py-2">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{s.nom}</td>
                  <td className="px-3 py-2">{s.prenom}</td>
                  <td className="px-3 py-2">{s.classe}</td>
                  <td className="px-3 py-2">{(s.activites_as || []).join(", ")}</td>
                  <td className="px-3 py-2">
                    <Badge ok={s.dossier_complet === "Oui"}>{s.dossier_complet}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    {Number(s.montant_verse || 0).toFixed(2)} € / {Number(s.montant_reel ?? s.montant_du ?? 0).toFixed(2)} €
                  </td>
                  <td className="px-3 py-2">{MODES_PAIEMENT[s.mode_paiement] || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-400">Aucun élève ne correspond à ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900" }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function SortTh({ field, label, sort, onSort }) {
  const active = sort.field === field;
  return (
    <th className="cursor-pointer select-none px-3 py-2" onClick={() => onSort(field)}>
      {label} {active && (sort.dir === "asc" ? "▲" : "▼")}
    </th>
  );
}

function Badge({ ok, children }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {children}
    </span>
  );
}
