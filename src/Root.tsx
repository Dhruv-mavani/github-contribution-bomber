import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";

export interface BombTarget {
  x: number;
  z: number;
  frame: number;
}

export type MyCompositionProps = {
  levels: number[];
  targets: BombTarget[];
  flightPath: { x: number; z: number }[];
  durationInFrames: number;
  username: string;
};

// The actual GitHub contribution fetch happens in scripts/fetch-contributions.mjs,
// a plain Node script run *before* `remotion render`, whose output is passed in via
// `--props=props.json`. It used to happen right here inside calculateMetadata, but
// that runs inside a real headless Chrome tab (Puppeteer), where fetching github.com
// is blocked by CORS unless proxied through a third party — which is exactly what
// broke this project when that proxy service changed its terms. Doing the fetch in
// plain Node sidesteps CORS entirely, since it isn't a browser context.
const calculateMetadata: CalculateMetadataFunction<MyCompositionProps> = async ({ props }) => {
  // Pre-computed props (targets/flightPath/durationInFrames) came in via --props=props.json.
  if (props.levels?.length > 0 && props.targets?.length > 0) {
    return {
      durationInFrames: props.durationInFrames,
      props,
      width: 1200,
      height: 600,
    };
  }

  // No pre-computed data (e.g. running `remotion studio` locally without the fetch
  // script) — fall back to placeholder demo data just so the composition previews.
  return {
    durationInFrames: 300,
    props: {
      ...props,
      levels: Array(52 * 7).fill(0),
      targets: [{ x: 25, z: 3, frame: 75 }],
      flightPath: [{ x: 0, z: 0 }, { x: 25, z: 3 }, { x: 52, z: 7 }, { x: 26, z: 14 }],
      durationInFrames: 300,
    },
    width: 1200,
    height: 600,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        fps={30}
        defaultProps={{
          levels: [],
          targets: [],
          flightPath: [],
          durationInFrames: 300,
          username: "dhruv-mavani",
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
