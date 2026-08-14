import { NavLink } from 'react-router-dom';

import Icon from './Icon.jsx';

const NAV_ITEMS = [
  { to: '/', icon: 'camera', label: 'Scan' },
  { to: '/history', icon: 'history', label: 'History' },
];

export default function AppShell({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col sm:max-w-2xl">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-leaf-700 px-4 py-3 text-white shadow-card">
        <Icon name="leaf" className="h-8 w-8 shrink-0" title="AgroLens" />
        <span className="text-2xl font-extrabold tracking-tight">AgroLens</span>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md border-t-4 border-leaf-700 bg-white sm:max-w-2xl">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-3 text-sm font-extrabold uppercase tracking-wide',
                isActive ? 'bg-leaf-100 text-leaf-800' : 'text-leaf-600',
              ].join(' ')
            }
          >
            <Icon name={item.icon} className="h-7 w-7" title={item.label} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
