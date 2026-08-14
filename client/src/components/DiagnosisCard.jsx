import Icon from './Icon.jsx';
import ConfidenceMeter from './ConfidenceMeter.jsx';

const KIND_STYLES = {
  disease: { icon: 'drop', tone: 'bg-alert-high text-white', label: 'Disease' },
  pest: { icon: 'bug', tone: 'bg-alert-low text-white', label: 'Pest' },
  deficiency: { icon: 'seed', tone: 'bg-soil-700 text-white', label: 'Nutrient shortage' },
  healthy: { icon: 'check', tone: 'bg-leaf-600 text-white', label: 'Healthy' },
  unknown: { icon: 'warning', tone: 'bg-soil-700 text-white', label: 'Not clear' },
};

export default function DiagnosisCard({ diagnosis }) {
  const kind = KIND_STYLES[diagnosis.kind] ?? KIND_STYLES.unknown;

  return (
    <section className="card">
      <div className="flex items-start gap-3">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${kind.tone}`}>
          <Icon name={kind.icon} className="h-8 w-8" title={kind.label} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-wide text-soil-700">{kind.label}</p>
          <h2 className="text-2xl leading-tight">{diagnosis.name}</h2>
        </div>
      </div>

      <div className="mt-4">
        <ConfidenceMeter band={diagnosis.confidenceBand} confidence={diagnosis.confidence} />
      </div>

      <p className="mt-4 text-lg leading-snug">{diagnosis.explanation}</p>
    </section>
  );
}
