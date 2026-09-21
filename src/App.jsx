import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authReady } from "./firebase";
import { isAuthenticated } from "./lib/pin";
import EleveLookup from "./pages/EleveLookup";
import EleveFiche from "./pages/EleveFiche";
import ProfLogin from "./pages/ProfLogin";
import ProfDashboard from "./pages/ProfDashboard";
import ProfFiche from "./pages/ProfFiche";
import ProfArchives from "./pages/ProfArchives";
import ProfSettings from "./pages/ProfSettings";
import PartageInscription from "./pages/PartageInscription";

function RequireProf({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/prof/login" replace />;
  }
  return children;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authReady.then(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Chargement…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/eleve" replace />} />
        <Route path="/eleve" element={<EleveLookup />} />
        <Route path="/eleve/fiche/:id" element={<EleveFiche />} />
        <Route path="/prof/login" element={<ProfLogin />} />
        <Route path="/prof/dashboard" element={<RequireProf><ProfDashboard /></RequireProf>} />
        <Route path="/prof/eleve/new" element={<RequireProf><ProfFiche isNew /></RequireProf>} />
        <Route path="/prof/eleve/:id" element={<RequireProf><ProfFiche /></RequireProf>} />
        <Route path="/prof/archives" element={<RequireProf><ProfArchives /></RequireProf>} />
        <Route path="/prof/reglages" element={<RequireProf><ProfSettings /></RequireProf>} />
        <Route path="/inscription/partage" element={<PartageInscription />} />
        <Route path="*" element={<Navigate to="/eleve" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
