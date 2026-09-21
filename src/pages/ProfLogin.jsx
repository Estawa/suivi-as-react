import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { hasPin, setPin, verifyPin, markAuthenticated } from "../lib/pin";
import Header from "../components/Header";

export default function ProfLogin() {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    hasPin().then((exists) => {
      setNeedsSetup(!exists);
      setReady(true);
    });
  }, []);

  async function handleSetup(e) {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Choisis un code d'au moins 4 chiffres.");
      return;
    }
    if (pin !== confirmPin) {
      setError("Les deux codes ne correspondent pas.");
      return;
    }
    await setPin(pin);
    markAuthenticated();
    navigate("/prof/dashboard");
  }

  async function handleLogin(e) {
    e.preventDefault();
    const ok = await verifyPin(pin);
    if (!ok) {
      setError("Code incorrect.");
      return;
    }
    markAuthenticated();
    navigate("/prof/dashboard");
  }

  if (!ready) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  return (
    <div>
      <Header title="Suivi AS" subtitle="Espace professeur" links={[{ to: "/eleve", label: "Je suis élève" }]} />
      <main className="mx-auto max-w-sm px-4 py-10">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {needsSetup ? (
            <>
              <h2 className="mb-1 text-xl font-semibold">Premier lancement</h2>
              <p className="mb-4 text-sm text-gray-500">
                Choisis le code d'accès professeur (tu pourras le changer ensuite depuis le tableau de bord).
              </p>
              {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
              <form onSubmit={handleSetup} className="space-y-3">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Nouveau code"
                  className="input"
                  value={pin}
                  onChange={(e) => setPinValue(e.target.value)}
                />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Confirmer le code"
                  className="input"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                />
                <button className="w-full rounded bg-gray-900 py-2.5 font-medium text-white">
                  Définir le code
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-semibold">Connexion professeur</h2>
              {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Code d'accès"
                  className="input"
                  autoFocus
                  value={pin}
                  onChange={(e) => setPinValue(e.target.value)}
                />
                <button className="w-full rounded bg-gray-900 py-2.5 font-medium text-white">
                  Se connecter
                </button>
              </form>
            </>
          )}
          <Link to="/eleve" className="mt-4 block text-center text-sm text-indigo-600 hover:underline">
            Je suis élève
          </Link>
        </div>
      </main>
    </div>
  );
}
