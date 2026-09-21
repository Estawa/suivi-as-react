import { Link, useNavigate } from "react-router-dom";
import { logout } from "../lib/pin";

export default function Header({ title, subtitle, prof = false, links = [] }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/prof/login");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-indigo-600 hover:underline">
              {l.label}
            </Link>
          ))}
          {prof && (
            <button onClick={handleLogout} className="text-gray-500 hover:underline">
              Se déconnecter
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
