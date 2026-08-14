/**
 * Treatment advice keyed by classifier label.
 *
 * Every entry is written for a low-literacy, mobile-first audience: short sentences, no jargon,
 * and each action carries an icon key the client renders as a picture.
 * `kind` drives the icon and colour of the diagnosis card ('disease' | 'pest' | 'deficiency' | 'healthy').
 */
const CATALOG = {
  tomato_late_blight: {
    name: 'Tomato late blight',
    kind: 'disease',
    crops: ['tomato', 'potato'],
    explanation:
      'A water mould is spreading on the leaves. It grows fast in cool, wet weather and can kill the plant in a few days.',
    actions: [
      {
        type: 'cultural',
        icon: 'shears',
        title: 'Remove sick leaves',
        detail: 'Pick off spotted leaves and bury or burn them away from the field. Do not leave them on the ground.',
      },
      {
        type: 'organic',
        icon: 'drop',
        title: 'Spray copper',
        detail: 'Spray a copper-based mix on all leaves, top and bottom. Repeat every 7 days while it stays wet.',
      },
      {
        type: 'chemical',
        icon: 'flask',
        title: 'Use mancozeb',
        detail: 'If spots keep spreading, spray mancozeb. Follow the label dose and wait 7 days before harvest.',
      },
    ],
  },
  maize_fall_armyworm: {
    name: 'Fall armyworm',
    kind: 'pest',
    crops: ['maize', 'sorghum'],
    explanation:
      'Caterpillars are eating inside the leaf whorl. They chew ragged holes and leave sawdust-like droppings.',
    actions: [
      {
        type: 'cultural',
        icon: 'hand',
        title: 'Pick by hand',
        detail: 'Early morning, check the whorl of each plant and crush the caterpillars and egg patches you find.',
      },
      {
        type: 'organic',
        icon: 'leaf',
        title: 'Apply neem or Bt',
        detail: 'Pour a neem or Bt spray straight into the whorl in the evening. Repeat after 7 days.',
      },
      {
        type: 'chemical',
        icon: 'flask',
        title: 'Use emamectin benzoate',
        detail: 'For heavy attack, spray emamectin benzoate into the whorl. Wear gloves and keep children away.',
      },
    ],
  },
  cassava_mosaic_virus: {
    name: 'Cassava mosaic virus',
    kind: 'disease',
    crops: ['cassava'],
    explanation:
      'A virus carried by whiteflies is twisting the leaves and making yellow patches. There is no cure once a plant has it.',
    actions: [
      {
        type: 'cultural',
        icon: 'shears',
        title: 'Uproot sick plants',
        detail: 'Pull out and burn badly affected plants so whiteflies cannot carry the virus to healthy ones.',
      },
      {
        type: 'cultural',
        icon: 'seed',
        title: 'Plant clean cuttings',
        detail: 'Next season take cuttings only from healthy fields, or buy certified clean planting material.',
      },
      {
        type: 'organic',
        icon: 'drop',
        title: 'Control whiteflies',
        detail: 'Spray soapy water or neem under the leaves each week to reduce the whiteflies that spread it.',
      },
    ],
  },
  coffee_leaf_rust: {
    name: 'Coffee leaf rust',
    kind: 'disease',
    crops: ['coffee'],
    explanation:
      'Orange powder under the leaves is a fungus. Infected leaves drop early, so the tree carries fewer cherries.',
    actions: [
      {
        type: 'cultural',
        icon: 'shears',
        title: 'Open up the tree',
        detail: 'Prune crowded branches and remove fallen leaves so air moves through and leaves dry faster.',
      },
      {
        type: 'organic',
        icon: 'drop',
        title: 'Spray copper',
        detail: 'Spray copper on the underside of the leaves at the start of the rains, then again after 4 weeks.',
      },
      {
        type: 'chemical',
        icon: 'flask',
        title: 'Use a triazole fungicide',
        detail: 'For heavy rust, use a triazole fungicide once at the label dose. Do not spray in hot midday sun.',
      },
    ],
  },
  nitrogen_deficiency: {
    name: 'Nitrogen shortage',
    kind: 'deficiency',
    crops: ['maize', 'rice', 'vegetables'],
    explanation:
      'The oldest leaves are turning pale yellow from the tip. The plant is short of nitrogen, not sick from a pest.',
    actions: [
      {
        type: 'organic',
        icon: 'seed',
        title: 'Add manure or compost',
        detail: 'Work well-rotted manure or compost into the soil around each plant, then water it in.',
      },
      {
        type: 'chemical',
        icon: 'flask',
        title: 'Top-dress with urea',
        detail: 'Place a small handful of urea in a ring 10 cm from the stem. Never put it against the stem.',
      },
      {
        type: 'cultural',
        icon: 'leaf',
        title: 'Rotate with legumes',
        detail: 'Plant beans or groundnuts next season. They put nitrogen back into the soil for free.',
      },
    ],
  },
  healthy: {
    name: 'Looks healthy',
    kind: 'healthy',
    crops: [],
    explanation: 'No clear sign of disease, pest or nutrient shortage in this photo. Keep checking every few days.',
    actions: [
      {
        type: 'cultural',
        icon: 'eye',
        title: 'Keep watching',
        detail: 'Check new leaves twice a week. Photograph anything that changes colour or shape.',
      },
      {
        type: 'cultural',
        icon: 'drop',
        title: 'Water at the base',
        detail: 'Water the soil, not the leaves. Dry leaves get sick less often.',
      },
    ],
  },
};

const UNKNOWN = {
  name: 'Not clear',
  kind: 'unknown',
  crops: [],
  explanation:
    'The photo was not clear enough to name a problem. Take another photo in daylight, close to one affected leaf.',
  actions: [
    {
      type: 'cultural',
      icon: 'camera',
      title: 'Take a better photo',
      detail: 'Hold the phone one hand-width from the leaf. Fill the frame with the spotted part.',
    },
    {
      type: 'cultural',
      icon: 'eye',
      title: 'Check other plants',
      detail: 'Look at nearby plants for the same marks. Photograph the worst one.',
    },
  ],
};

export function getAdvice(label) {
  return CATALOG[label] ?? UNKNOWN;
}

export function knownLabels() {
  return Object.keys(CATALOG);
}
