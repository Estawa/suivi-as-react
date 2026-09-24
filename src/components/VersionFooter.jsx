/* global __APP_VERSION__, __BUILD_DATE__ */

/** Petite ligne en bas de chaque page : version et date de mise en ligne. */
export default function VersionFooter() {
  return (
    <footer className="py-4 text-center text-[11px] text-gray-400">
      Suivi AS v{__APP_VERSION__} — mise à jour du {__BUILD_DATE__}
    </footer>
  );
}
