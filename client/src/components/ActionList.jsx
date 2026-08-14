import Icon from './Icon.jsx';

const TYPE_STYLES = {
  organic: { label: 'Organic', tone: 'bg-leaf-600 text-white' },
  chemical: { label: 'Chemical', tone: 'bg-alert-low text-white' },
  cultural: { label: 'Do first', tone: 'bg-soil-700 text-white' },
};

/** Recommended actions, ordered as the server sends them (cheapest and safest first). */
export default function ActionList({ actions }) {
  return (
    <ol className="space-y-3">
      {actions.map((action, index) => {
        const type = TYPE_STYLES[action.type] ?? TYPE_STYLES.cultural;
        return (
          <li key={action.title} className="card flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-leaf-700">
              <Icon name={action.icon} className="h-7 w-7" title={action.title} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-soil-700">{index + 1}</span>
                <h3 className="text-xl leading-tight">{action.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold uppercase ${type.tone}`}>
                  {type.label}
                </span>
              </div>
              <p className="mt-1 text-lg leading-snug">{action.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
