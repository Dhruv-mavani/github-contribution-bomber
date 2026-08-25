// Fetches a GitHub user's contribution calendar and turns it into render props
// (levels/targets/flightPath/durationInFrames) for the Remotion composition.
//
// This runs as a plain Node script (not inside the Remotion/Puppeteer browser),
// so it can hit github.com directly without needing a CORS proxy. Root.tsx's
// calculateMetadata used to do this fetch itself from inside headless Chrome,
// which is subject to real browser CORS and broke whenever the third-party
// CORS proxy it depended on went away.
import { writeFileSync } from "node:fs";
import { Vector3, CatmullRomCurve3 } from "three";

const SPACING = 1.2;
const COLS = 52;
const ROWS = 7;
const EXPLOSION_RADIUS = 2.5;
const AIRPLANE_SPEED = 0.35;

const fallbackProps = (username) => ({
  username,
  levels: Array(COLS * ROWS).fill(0),
  targets: [{ x: 25, z: 3, frame: 75 }],
  flightPath: [{ x: 0, z: 0 }, { x: 25, z: 3 }, { x: 52, z: 7 }, { x: 26, z: 14 }],
  durationInFrames: 300,
});

async function buildProps(username) {
  const res = await fetch(`https://github.com/users/${username}/contributions`);
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status} for ${username}`);
  }
  const html = await res.text();

  const cells = [];
  const tdRegex = /<td[^>]+class="ContributionCalendar-day"[^>]*>/g;
  let match;
  while ((match = tdRegex.exec(html)) !== null) {
    const tdStr = match[0];
    const dateMatch = tdStr.match(/data-date="([^"]+)"/);
    const levelMatch = tdStr.match(/data-level="(\d+)"/);
    if (dateMatch && levelMatch) {
      cells.push({ date: dateMatch[1], level: parseInt(levelMatch[1], 10) });
    }
  }
  cells.sort((a, b) => a.date.localeCompare(b.date));

  const finalLevels = new Array(COLS * ROWS).fill(0);
  if (cells.length > 0) {
    const newestDateStr = cells[cells.length - 1].date;
    const newestDate = new Date(newestDateStr + "T00:00:00Z");
    let r = newestDate.getUTCDay();
    let c = COLS - 1;

    for (let i = cells.length - 1; i >= 0; i--) {
      if (c < 0) break;
      finalLevels[c * ROWS + r] = cells[i].level;
      r--;
      if (r < 0) {
        r = ROWS - 1;
        c--;
      }
    }
  }

  let greenBlocks = [];
  for (let i = 0; i < finalLevels.length; i++) {
    if (finalLevels[i] > 0) {
      const c = Math.floor(i / ROWS);
      const r = i % ROWS;
      if (c < COLS) {
        greenBlocks.push({ x: c, z: r });
      }
    }
  }

  greenBlocks.sort(() => Math.random() - 0.5);

  const chosenTargets = [];
  while (greenBlocks.length > 0) {
    const target = greenBlocks[0];
    chosenTargets.push(target);
    greenBlocks = greenBlocks.filter((block) => {
      const dx = block.x - target.x;
      const dz = block.z - target.z;
      return Math.sqrt(dx * dx + dz * dz) > EXPLOSION_RADIUS;
    });
  }

  const flightPath = [];
  if (chosenTargets.length > 0) {
    flightPath.push({ x: 26, z: -25 });
    for (const t of chosenTargets) flightPath.push({ x: t.x, z: t.z });
    flightPath.push({ x: 52, z: 15 });
    flightPath.push({ x: 26, z: 25 });
    flightPath.push({ x: 0, z: 15 });
  }

  const gridWidth = COLS * SPACING;
  const gridDepth = ROWS * SPACING;
  const curvePoints = flightPath.map(
    (p) => new Vector3(p.x * SPACING - gridWidth / 2, 8, p.z * SPACING - gridDepth / 2)
  );

  if (curvePoints.length === 0) {
    return fallbackProps(username);
  }

  const curve = new CatmullRomCurve3(curvePoints, true, "centripetal", 0.5);
  curve.arcLengthDivisions = 3000;
  const totalLength = curve.getLength();
  const durationInFrames = Math.max(300, Math.ceil(totalLength / AIRPLANE_SPEED));

  const targets = chosenTargets.map((t) => {
    const targetVec = new Vector3(t.x * SPACING - gridWidth / 2, 8, t.z * SPACING - gridDepth / 2);
    let minDistance = Infinity;
    let bestU = 0;
    const RESOLUTION = 2000;
    for (let i = 0; i <= RESOLUTION; i++) {
      const u = i / RESOLUTION;
      const p = curve.getPointAt(u);
      const dist = p.distanceTo(targetVec);
      if (dist < minDistance) {
        minDistance = dist;
        bestU = u;
      }
    }
    return { x: t.x, z: t.z, frame: Math.round(bestU * durationInFrames) };
  });

  return { username, levels: finalLevels, targets, flightPath, durationInFrames };
}

const username = process.argv[2];
const outFile = process.argv[3] || "props.json";

if (!username) {
  console.error("Usage: node scripts/fetch-contributions.mjs <username> [outFile]");
  process.exit(1);
}

try {
  const props = await buildProps(username);
  writeFileSync(outFile, JSON.stringify(props, null, 2));
  console.log(`Wrote ${outFile} with ${props.targets.length} contribution targets for ${username}.`);
} catch (err) {
  console.error("Failed to fetch GitHub contributions, using fallback props:", err.message);
  writeFileSync(outFile, JSON.stringify(fallbackProps(username), null, 2));
}
