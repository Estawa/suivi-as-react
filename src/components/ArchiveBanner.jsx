import { Link } from "react-router-dom";

/** Bandeau affiché en haut de toutes les pages de consultation d'une archive. */
export default function ArchiveBanner({ annee }) {
  return (
    <div className="border-b border-amber-300 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="text-sm text-amber-900">
          Année archivée <strong>{annee}</strong> — consultation en lecture seule
        </p>
        <Link
          to="/prof/dashboard"
          className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          Revenir à l'année en cours
        </Link>
      </div>
    </div>
  );
}
