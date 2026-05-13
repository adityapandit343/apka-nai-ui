import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-gold/15 text-gold' : 'text-cream/70 hover:bg-gold/10 hover:text-cream'
    }`;

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-ink p-4 text-cream md:flex">
        <div className="mb-8 flex items-center">
          <span className="font-playfair text-xl font-bold">CutBook</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/dashboard" end className={navClass}>
            Live Queue
          </NavLink>
          <NavLink to="/dashboard/analytics/" className={navClass}>
            Analytics
          </NavLink>
          <NavLink to="/dashboard/settings/" className={navClass}>
            Settings
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-cream"
        >
          Logout
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-white/10 bg-ink/95 p-2 text-center backdrop-blur md:hidden">
        <NavLink to="/dashboard" end className={navClass}>
          Queue
        </NavLink>
        <NavLink to="/dashboard/analytics/" className={navClass}>
          Analytics
        </NavLink>
        <NavLink to="/dashboard/settings/" className={navClass}>
          Settings
        </NavLink>
      </nav>
    </>
  );
}
