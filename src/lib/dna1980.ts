import seedrandom from 'seedrandom';

export type DnaOptions = {
  seed?: string;
  intensity?: number; // 0..1 strength of adaptation
  tone?: 'heroic' | 'satirical' | 'mystery' | 'sci-fi' | 'fantasy' | 'action';
};

const COLOR_PALETTES = [
  'neon teal and magenta with scanlines',
  'sunset gradient: fuchsia to amber with chrome highlights',
  'electric blue, hot pink, and synthwave purple',
  'pastel cyan, bubblegum pink, VHS grain overlay',
  'deep navy, laser grid cyan, and neon violet',
];

const TROPES = [
  'laser-grid horizon and neon skyline',
  'outrun cars streaking with light trails',
  'hero team freeze-frame with bold title card',
  'villain monologue echo with dramatic rim light',
  'VHS tracking noise and subtle chromatic aberration',
  'hand-drawn cel shading with thick ink lines',
  'motion smear frames at action beats',
  'montage sequence with synth arpeggios',
  'toyetic sidekick creature with catchphrase',
  'episode moral wrap-up with star wipe',
];

const COMPOSERS = [
  'synth brass fanfare',
  'FM bass ostinato',
  'gated reverb drums',
  'chorused guitar stabs',
  'fairlight choir hits',
];

const DIRECTIVES = [
  'add VHS tape grit and scanlines',
  'increase cel-shaded line weight 15%',
  'apply neon rim light to silhouettes',
  'use bold title card with chrome logo',
  'freeze-frame on hero pose, add sparkle',
  'use split-screen panels for banter',
  'insert episodic moral in final line',
  'emphasize practical miniatures look',
  'stage wide shots on laser grid floor',
  'apply subtle film grain and jitter',
];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function transformPromptTo80sDNA(input: string, opts: DnaOptions = {}): string {
  const seed = opts.seed ?? `${input.length}|${input.slice(0, 8)}`;
  const rng = seedrandom(seed);
  const intensity = clamp01(opts.intensity ?? 0.75);
  const tone = opts.tone ?? pick(rng, ['heroic', 'satirical', 'mystery', 'sci-fi', 'fantasy', 'action']);

  const color = pick(rng, COLOR_PALETTES);
  const tropeA = pick(rng, TROPES);
  const tropeB = pick(rng, TROPES.filter(t => t !== tropeA));
  const music = pick(rng, COMPOSERS);
  const directive = pick(rng, DIRECTIVES);

  const booster = intensity > 0.66 ? 'AMPLIFY visuals to bold 80s heroics' : intensity > 0.33 ? 'BLEND subtle 80s cues' : 'SPRINKLE minimal 80s texture';

  const header = `1980s Animation DNA Adapter — tone: ${tone}, intensity: ${Math.round(intensity*100)}%`;

  const adapted = [
    `Original: ${input.trim()}`,
    `Palette: ${color}`,
    `Tropes: ${tropeA}; ${tropeB}`,
    `Music Texture: ${music}`,
    `Directive: ${directive}`,
    booster,
    'Rendering style: hand-inked cel with limited frames, analog softness, broadcast-safe colors',
    'Framing: wide establishing shots on laser grid, punch-in for hero quips, star wipes between scenes',
    'Logo treatment: chrome extrude with neon rim, slight bevel, drop shadow onto gradient',
  ].join('\n');

  return adapted;
}

export function batchTransform(prompts: string[], opts: DnaOptions = {}): string[] {
  return prompts.map((p, i) => transformPromptTo80sDNA(p, { ...opts, seed: `${opts.seed ?? 's'}|${i}` }));
}
