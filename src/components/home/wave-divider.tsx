import { cn } from "@/lib/cn";

// Each layer is one 1440×96 tile, repeated sideways as a mask over the accent
// color at 1px per unit, so the water reaches any screen width and the
// wavelength stays the same on a phone and a wide screen. The tile stretches
// only vertically.
export const waveTile = 1440;
export const waveHeight = 96;

export type WaveLayer = {
  wavelength: number; // must divide the tile so the loop is seamless
  amplitude: number;
  base: number; // trough line, from the top
  sharpness: number; // >1 narrows the crests and widens the troughs
  opacity: number;
  roll: number; // seconds to slide one tile
  bob: number; // seconds for one rise or fall
  reverse?: boolean;
  crest?: number; // stroke opacity of the foam line along the top
};

const layers: WaveLayer[] = [
  { wavelength: 720, amplitude: 34, base: 52, sharpness: 1.2, opacity: 0.14, roll: 28, bob: 5.6, crest: 0.25 },
  { wavelength: 480, amplitude: 28, base: 66, sharpness: 1.7, opacity: 0.24, roll: 18, bob: 4.3, reverse: true, crest: 0.45 },
  { wavelength: 360, amplitude: 24, base: 80, sharpness: 2.4, opacity: 0.36, roll: 11, bob: 3.4, crest: 0.9 },
];

// The swell the boat rides on.
export const frontWave = layers[layers.length - 1];

// A swell profile: the height follows ((1 + cos) / 2) ^ sharpness, which
// gives the pointed crests and long, flat troughs of real waves. `x` is in
// tile units; the result is the surface's distance from the top, in units.
export function waveSurface({ wavelength, amplitude, base, sharpness }: WaveLayer, x: number) {
  const lift = ((1 + Math.cos((2 * Math.PI * x) / wavelength)) / 2) ** sharpness;
  return base - amplitude * lift;
}

function surfacePath(layer: WaveLayer) {
  const step = layer.wavelength / 36;
  const points: string[] = [];
  for (let x = 0; x <= waveTile; x += step) {
    points.push(`${Math.round(x * 10) / 10} ${Math.round(waveSurface(layer, x) * 10) / 10}`);
  }
  return `M${points.join(" L")}`;
}

// The tile as an SVG data URL: the filled body and, optionally, a brighter
// foam line along its top. Only alpha matters, since it is used as a mask.
function tile(layer: WaveLayer) {
  const line = surfacePath(layer);
  const body = `${line} L${waveTile} ${waveHeight} L0 ${waveHeight} Z`;
  const foam = layer.crest
    ? `<path d="${line}" fill="none" stroke="#000" stroke-opacity="${layer.crest}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${waveTile} ${waveHeight}" preserveAspectRatio="none"><path d="${body}" fill-opacity="${layer.opacity}"/>${foam}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const shapes = layers.map((layer) => ({ ...layer, mask: tile(layer) }));

export type SeaPart = "back" | "front";

// Which way the tiles are laid: from the left edge (the hero, whose pier is on
// the left) or from the right edge (the harbor, whose pier is on the right).
// Either way the swell's shape at a given distance from that edge is the same
// on every screen width, so a boat placed at that distance without motion
// rests on a flat part of the swell: front-swell crests sit every 360px from
// the edge (0, 360, ...) and troughs halfway between (180, 540, ...).
export type SeaAnchor = "left" | "right";

// The open water of the voyage: layers of swell in the accent color, each
// rolling sideways and rising and falling at its own pace (.wave-roll /
// .wave-bob in globals.css; still with reduced motion). It fills its
// positioned parent, the sea box ([data-sea]), which is also the box page
// motion measures the water and places the boat in.
//
// "back" draws the two far layers, "front" the near swell the boat rides
// ([data-front-bob] / [data-front-roll] for page motion). They are separate so
// something can float between them: the hero's app window sits in front of the
// far water and behind the near swell. The water fades out towards the bottom.
export function SeaLayers({
  part,
  anchor = "left",
  className,
}: {
  part: SeaPart;
  anchor?: SeaAnchor;
  className?: string;
}) {
  const front = part === "front";
  const drawn = front ? shapes.slice(-1) : shapes.slice(0, -1);
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden text-kicker", className)}
      style={{ maskImage: "linear-gradient(to bottom, black 78%, transparent)" }}
    >
      {drawn.map((layer, index) => {
        const order = front ? shapes.length - 1 : index;
        return (
          <div
            key={order}
            data-front-bob={front ? "" : undefined}
            className={cn("wave-bob absolute inset-0", order === 0 && "max-sm:hidden")}
            style={{ animationDuration: `${layer.bob}s`, animationDelay: `${-order * 1.1}s` }}
          >
            {/* One tile wider than the sea, so sliding it a tile loops
                without a seam (.wave-roll). Anchored on the right, the tiles
                start from the right edge of this wider strip, which is a
                whole tile past the sea's right edge. */}
            <div
              data-front-roll={front ? "" : undefined}
              data-anchor={anchor}
              className="wave-roll absolute inset-y-0 left-0 w-[calc(100%+1440px)] bg-current"
              style={{
                maskImage: layer.mask,
                maskRepeat: "repeat-x",
                maskSize: `${waveTile}px 100%`,
                maskPosition: anchor === "right" ? "right top" : "left top",
                animationDuration: `${layer.roll}s`,
                animationDirection: layer.reverse ? "reverse" : "normal",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
