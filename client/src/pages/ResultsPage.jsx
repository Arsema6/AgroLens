import { Link, useParams } from 'react-router-dom';

import ActionList from '../components/ActionList.jsx';
import DiagnosisCard from '../components/DiagnosisCard.jsx';
import Icon from '../components/Icon.jsx';
import { getScan } from '../lib/storage.js';

export default function ResultsPage() {
  const { scanId } = useParams();
  const scan = getScan(scanId);

  if (!scan) {
    return (
      <div className="space-y-4 text-center">
        <Icon name="warning" className="mx-auto h-16 w-16 text-alert-low" />
        <h1 className="text-2xl">Scan not found</h1>
        <p className="text-lg">This scan is no longer saved on this phone.</p>
        <Link to="/" className="btn-primary">
          <Icon name="camera" className="h-8 w-8" />
          New scan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {scan.thumbnail ? (
        <img
          src={scan.thumbnail}
          alt="Scanned crop"
          className="aspect-video w-full rounded-2xl border-2 border-soil-200 object-cover"
        />
      ) : null}

      <DiagnosisCard diagnosis={scan.diagnosis} />

      <section>
        <h2 className="mb-3 text-xl uppercase tracking-wide text-soil-700">What to do</h2>
        <ActionList actions={scan.actions} />
      </section>

      {scan.alternatives?.length ? (
        <section className="card">
          <h2 className="text-lg uppercase tracking-wide text-soil-700">It could also be</h2>
          <ul className="mt-2 space-y-1">
            {scan.alternatives.map((alternative) => (
              <li key={alternative.label} className="flex items-center justify-between text-lg font-bold">
                <span>{alternative.name}</span>
                <span className="text-soil-700">{Math.round(alternative.confidence * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="space-y-3">
        <Link to="/" className="btn-primary">
          <Icon name="camera" className="h-8 w-8" />
          New scan
        </Link>
        <Link to="/history" className="btn-secondary">
          <Icon name="history" className="h-8 w-8" />
          Past scans
        </Link>
      </div>
    </div>
  );
}
