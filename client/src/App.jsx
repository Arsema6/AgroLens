import { Navigate, Route, Routes } from 'react-router-dom';

import AppShell from './components/AppShell.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import ScanPage from './pages/ScanPage.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/results/:scanId" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
