import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listStudents } from "../lib/students";
import { exportStudentsToExcel } from "../lib/excelExport";
import { archiveCurrentYear } from "../lib/archives";
import { ACTIVITES_AS, MODES_PAIEMENT } from "../config";
import Header from "../components/Header";

export default function ProfDashboard() {
  const [students, setStudents] = useState(null);
  const [q, setQ] = useState("");
  const [classe, setClasse] = useState("");
  const [activite, setActivite] = useState("");
  const [dossier, setDossier] = useState("");
  const [sort, setSort] = useState({ field: "nom", dir: "asc" });
  const navigate = useNavigate();

  async function refresh() {
    setStudents(await listStudents());
  }

  useEffect(() => {
    refresh();
  }, []);

  const allClasses = useMemo(
    () => [...new Set((students || []).map((s) => s.classe).filter(Boolean))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    if (!students) return [];
    let list = students;
    const norm = (t) => (t || "").toLowerCase();
    if (q) list = list.filter((s) => norm(s.nom).includes(norm(q)) || norm(s.prenom).includes(norm(q)));
    if (classe) list = list.filter((s) => s.classe === classe);
    if (activite) list = list.filter((s) => (s.activites_as || []).includes(activite));
    if (dossier) list = list.filter((s) => s.dossier_complet === dossier);
    list = [...list].sort((a, b) => {
      const av = norm(a[sort.field]);
      const bv = norm(b[sort.field]);
      const cmp = av.localeCompare(bv);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [students, q, classe, activite, dossier, sort]);

  if (!students) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  const total = students.length;
  const complets = students.filter((s) => s.dossier_complet === "Oui").length;

  function toggleSort(field) {
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));
  }

  async function handleReset() {
    if (!window.confirm(`Archiver les ${total} fiche(s) actuelle(s) et repartir de zéro ? Cette action est irréversible (les données seront conservées dans les Archives).`)) return;
    await archiveCurrentYear(students);
    await refresh();
  }

  return (
    <div>
      <Header
        title="Suivi des élèves de l'AS"
        prof
        links={[
          { to: "/prof/eleve/new", label: "+ Nouvel élève" },
          { to: "/prof/archives", label: "Archives" },
          { to: "/prof/reglages", label: "Réglages" },
          { to: "/inscription/partage", label: "Partager l'inscription" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Élèves inscrits" value={total} />
          <Stat label="Dossiers complets" value={complets} color="text-green-600" />
          <Stat label="Dossiers incomplets" value={total - complets} color="text-red-600" />
          <Stat label="Export Excel" action onClick={() => exportStudentsToExcel(students, `Fiche_suivi_eleves_AS_${new Date().toISOString().slice(0, 10)}.xlsx`)} />
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
                  onClick={() => navigate(`/prof/eleve/${s.id}`)}
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
                    {(s.montant_verse || 0).toFixed(2)} € / {(s.montant_reel ?? s.montant_du ?? 0).toFixed(2)} €
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

        <div className="mt-8 rounded-xl border border-red-200 bg-white p-4">
          <h2 className="mb-1 font-semibold text-red-700">Fin d'année</h2>
          <p className="mb-3 text-sm text-gray-500">
            Archive l'ensemble des {total} fiche(s) actuelle(s) sous l'année scolaire en cours, puis vide la
            liste pour repartir de zéro. Les données archivées restent consultables et exportables dans{" "}
            <Link to="/prof/archives" className="text-indigo-600 hover:underline">Archives</Link>.
          </p>
          <button onClick={handleReset} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white">
            Réinitialiser l'année
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900", action = false, onClick }) {
  if (action) {
    return (
      <button onClick={onClick} className="rounded-xl border bg-white p-4 text-left shadow-sm hover:bg-gray-50">
        <div className="text-sm font-medium text-indigo-600">Exporter en Excel</div>
        <div className="text-xs text-gray-400">Toutes les fiches, filtres inclus</div>
      </button>
    );
  }
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
