import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function SharePanel() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/eleve`;
  const message = "Inscription à l'Association Sportive du lycée :";

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 2, width: 300 }).then(setQrDataUrl);
  }, [url]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // API presse-papiers indisponible (permission refusée, contexte non
      // sécurisé...) : le lien reste affiché à l'écran, copiable à la main.
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;

  return (
    <div className="rounded-xl border bg-white p-4 text-center">
      <p className="mb-3 text-sm font-medium text-gray-700">Partager cette page</p>
      {qrDataUrl && (
        <img src={qrDataUrl} alt="QR code d'inscription" className="mx-auto mb-3 w-28" />
      )}
      <p className="mb-3 break-all text-xs text-gray-500">{url}</p>
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded bg-green-600 py-2 text-sm font-medium text-white"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded border py-2 text-sm font-medium text-gray-700"
        >
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}
