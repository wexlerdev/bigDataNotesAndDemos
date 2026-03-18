import { Outlet, Link, useLocation } from 'react-router-dom';
import SpaceBackground from './SpaceBackground';

export default function Layout() {
  const { pathname } = useLocation();
  const isUnit5 = pathname.startsWith('/5.') || pathname === '/ref';
  const isDemo = pathname.startsWith('/4.') || pathname.startsWith('/5.') || pathname === '/ref';

  return (
    <>
      <SpaceBackground />
      <Outlet />
      {isDemo && (
        <footer>
          <Link to="/demos">← Back to {isUnit5 ? 'Unit 5 — Regression Analysis' : 'Unit 4 — Probability & Inference'} hub</Link>
        </footer>
      )}
    </>
  );
}
