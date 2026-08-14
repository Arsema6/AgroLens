const BANDS = {
  low: { filled: 1, label: 'Low - not sure', className: 'bg-alert-low' },
  medium: { filled: 2, label: 'Medium - likely', className: 'bg-leaf-400' },
  high: { filled: 3, label: 'High - very likely', className: 'bg-leaf-600' },
};

/** Three blocks instead of a percentage, so confidence reads at a glance. */
export default function ConfidenceMeter({ band, confidence }) {
  const { filled, label, className } = BANDS[band] ?? BANDS.low;

  return (
    <div>
      <div className="flex items-center gap-2" role="img" aria-label={`Confidence: ${label}`}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-4 flex-1 rounded-full ${index < filled ? className : 'bg-soil-200'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-base font-bold text-leaf-800">
        {label}
        {typeof confidence === 'number' ? (
          <span className="ml-2 font-medium text-soil-700">{Math.round(confidence * 100)}%</span>
        ) : null}
      </p>
    </div>
  );
}
