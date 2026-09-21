import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Header from "../components/Header";

export default function PartageInscription() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const inscriptionUrl = `${window.location.origin}/eleve`;

  useEffect(() => {
    QRCode.toDataURL(inscriptionUrl, { margin: 2, width: 500 }).then(setQrDataUrl);
  }, [inscriptionUrl]);

  return (
    <div>
      <div className="no-print">
        <Header title="Partager l'inscription" links={[{ to: "/prof/dashboard", label: "← Tableau de bord" }]} />
      </div>
      <main className="mx-auto max-w-md px-4 py-8">
        <div id="print-area" className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold">Inscription à l'Association Sportive</h2>
          <p className="mb-6 text-sm text-gray-600">Scanne ce code ou utilise le lien ci-dessous.</p>
          {qrDataUrl && <img src={qrDataUrl} alt="QR code d'inscription" className="mx-auto mb-6" />}
          <p className="break-all text-sm font-medium">{inscriptionUrl}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print mt-4 w-full rounded bg-gray-900 py-2.5 font-medium text-white"
        >
          Imprimer (noir et blanc)
        </button>
      </main>
    </div>
  );
}
