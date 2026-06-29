import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminConsole from './components/AdminConsole.tsx';
import './index.css';

// Hidden admin routes — rendered standalone, outside the public tabbed app.
// All three paths render one AdminConsole; the initial tab is chosen by path.
// In-app tab switching keeps the session in memory (instant, no reload).
const path =
  typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/+$/, '')
    : '';

function Root() {
  if (path === '/admin/reports') return <AdminConsole initialTab="reports" />;
  if (path === '/admin/feedback') return <AdminConsole initialTab="feedback" />;
  if (path === '/admin/insights') return <AdminConsole initialTab="insights" />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
