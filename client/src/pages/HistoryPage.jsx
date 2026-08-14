import { useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../components/Icon.jsx';
import ScanHistoryItem from '../components/ScanHistoryItem.jsx';
import { clearScans, deleteScan, listScans } from '../lib/storage.js';

export default function HistoryPage() {
  const [scans, setScans] = useState(() => listScans());

  function handleDelete(scanId) {
    deleteScan(scanId);
    setScans(listScans());
  }

  function handleClear() {
    clearScans();
    setScans([]);
  }

  if (scans.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <Icon name="history" className="mx-auto h-16 w-16 text-leaf-300" />
        <h1 className="text-2xl">No scans yet</h1>
        <p className="text-lg">Your checks are saved on this phone so you can look at them later.</p>
        <Link to="/" className="btn-primary">
          <Icon name="camera" className="h-8 w-8" />
          Take first photo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">Past scans</h1>
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 rounded-xl border-2 border-soil-200 px-3 py-2 text-base font-extrabold uppercase text-soil-700 active:bg-soil-200"
        >
          <Icon name="trash" className="h-5 w-5" />
          Clear
        </button>
      </div>

      <ul className="space-y-3">
        {scans.map((scan) => (
          <ScanHistoryItem key={scan.scanId} scan={scan} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
