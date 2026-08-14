/**
 * crop.health (Kindwise) provider.
 *
 * POST {endpoint}?details=...&language=... with `Api-Key` and `{ images: [base64] }`; the response
 * carries `result.crop.suggestions` (which plant) and `result.disease.suggestions` (what is wrong),
 * each with `name`, `probability` and the requested `details`. Docs: https://crop.kindwise.com/docs
 *
 * The `treatment` detail is what makes this provider worth the round trip: it already splits advice
 * into prevention / biological / chemical, which maps onto the cultural / organic / chemical actions
 * the results screen renders.
 */

const DEFAULT_ENDPOINT = 'https://crop.kindwise.com/api/v1/identification';
const DETAILS = 'description,treatment,type,common_names';
const MAX_ALTERNATIVES = 2;
const MAX_EXPLANATION_CHARS = 320;
const MAX_DETAIL_CHARS = 260;

export async function identifyWithCropHealth({ buffer, apiKey, endpoint, language = 'en' }) {
  const url = new URL(endpoint || DEFAULT_ENDPOINT);
  url.searchParams.set('details', DETAILS);
  url.searchParams.set('language', language);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
      body: JSON.stringify({ images: [buffer.toString('base64')], similar_images: false }),
    });
  } catch (cause) {
    const error = new Error('Could not reach the crop health service. Try again in a moment.');
    error.status = 502;
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    // A bad or exhausted key is our problem, not the farmer's: the status text goes to the log via
    // `cause`, the screen just says to try again.
    const error = new Error('The crop health service could not check this photo. Try again in a moment.');
    error.status = 502;
    error.cause = new Error(`crop.health responded ${response.status}: ${detail.slice(0, 200)}`);
    throw error;
  }

  return mapIdentification(await response.json());
}

export function mapIdentification(payload) {
  const suggestions = payload?.result?.disease?.suggestions ?? [];
  const crop = payload?.result?.crop?.suggestions?.[0]?.name ?? null;

  if (suggestions.length === 0) {
    return { label: 'unknown', confidence: 0, alternatives: [], crop };
  }

  const [top, ...rest] = suggestions;
  return {
    label: toLabel(top),
    confidence: clamp(top.probability),
    alternatives: rest
      .slice(0, MAX_ALTERNATIVES)
      .map((suggestion) => ({
        label: toLabel(suggestion),
        name: displayName(suggestion),
        kind: toKind(suggestion),
        confidence: clamp(suggestion.probability),
      })),
    crop,
    advice: toAdvice(top, crop),
  };
}

/** Provider names are free text; slugs keep them usable as catalog keys and React list keys. */
function toLabel(suggestion) {
  const source = suggestion.name ?? suggestion.scientific_name ?? '';
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return slug || 'unknown';
}

function displayName(suggestion) {
  const common = suggestion.details?.common_names?.[0];
  return capitalise(common ?? suggestion.name ?? suggestion.scientific_name ?? 'Not clear');
}

/**
 * `details.type` is a taxonomic group (e.g. Fungi, Insecta, Abiotic); the results screen only cares
 * whether to show a disease, a pest, a nutrient shortage or a healthy plant.
 */
function toKind(suggestion) {
  const name = `${suggestion.name ?? ''} ${suggestion.scientific_name ?? ''}`.toLowerCase();
  if (name.includes('healthy')) return 'healthy';

  const type = String(suggestion.details?.type ?? '').toLowerCase();
  if (/insect|arachn|nemat|mite|acari|mollusc|rodent|pest/.test(type)) return 'pest';
  if (/abiotic|nutrient|deficien/.test(type) || /deficien/.test(name)) return 'deficiency';
  return 'disease';
}

function toAdvice(suggestion, crop) {
  const details = suggestion.details ?? {};
  return {
    name: displayName(suggestion),
    kind: toKind(suggestion),
    crops: crop ? [crop.toLowerCase()] : [],
    explanation: shorten(details.description, MAX_EXPLANATION_CHARS),
    actions: toActions(details.treatment),
  };
}

const TREATMENT_GROUPS = [
  { key: 'prevention', type: 'cultural', icon: 'shears', title: 'Do this first' },
  { key: 'biological', type: 'organic', icon: 'drop', title: 'Organic option' },
  { key: 'chemical', type: 'chemical', icon: 'flask', title: 'Chemical option' },
];

function toActions(treatment) {
  if (!treatment || typeof treatment !== 'object') return [];

  return TREATMENT_GROUPS.map(({ key, type, icon, title }) => {
    const detail = shorten(joinInstructions(treatment[key]), MAX_DETAIL_CHARS);
    return detail ? { type, icon, title, detail } : null;
  }).filter(Boolean);
}

/** Providers return a list per category, but occasionally a bare string. */
function joinInstructions(value) {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, 2)
    .map((item) => item.trim().replace(/\.?$/, '.'))
    .join(' ');
}

/** Keeps whole sentences: long clinical descriptions do not read well on a phone in a field. */
function shorten(value, maxChars) {
  const text = String(value ?? '').trim();
  if (!text || text.length <= maxChars) return text;

  const clipped = text.slice(0, maxChars);
  const lastStop = clipped.lastIndexOf('. ');
  return lastStop > maxChars / 3 ? clipped.slice(0, lastStop + 1) : `${clipped.trimEnd()}…`;
}

function capitalise(value) {
  const text = String(value).trim();
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function clamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(1, Math.max(0, numeric));
}
