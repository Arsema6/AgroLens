import { Link } from 'react-router-dom';

import Icon from './Icon.jsx';

const BAND_DOT = {
  low: 'bg-alert-low',
  medium: 'bg-leaf-400',
  high: 'bg-leaf-600',
};

export default function ScanHistoryItem({ scan, onDelete }) {
  return (
    <li className="card flex items-center gap-3 p-3">
      <Link to={`/results/${scan.scanId}`} className="flex min-w-0 flex-1 items-center gap-3">
        {scan.thumbnail ? (
          <img
            src={scan.thumbnail}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl border-2 border-soil-200 object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
            <Icon name="leaf" className="h-8 w-8" />
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className={`h-3 w-3 shrink-0 rounded-full ${BAND_DOT[scan.diagnosis.confidenceBand]}`} />
            <span className="truncate text-xl font-extrabold">{scan.diagnosis.name}</span>
          </span>
          <span className="mt-0.5 block text-base text-soil-700">{formatWhen(scan.createdAt)}</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(scan.scanId)}
        aria-label={`Delete scan: ${scan.diagnosis.name}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-soil-200 text-soil-700 active:bg-soil-200"
      >
        <Icon name="trash" className="h-6 w-6" />
      </button>
    </li>
  );
}

function formatWhen(isoDate) {
  const date = new Date(isoDate);
  const minutesAgo = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  if (minutesAgo < 60 * 24) return `${Math.round(minutesAgo / 60)} h ago`;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
