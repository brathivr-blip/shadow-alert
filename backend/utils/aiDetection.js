/**
 * Shadow Alert AI Detection Engine
 * ----------------------------------
 * A lightweight, fully-functional computer-vision heuristic that inspects an
 * uploaded streetlight photo and estimates whether the light appears to be
 * working, faulty/dark, or inconclusive.
 *
 * Because the runtime has no external ML API access, this engine performs
 * genuine pixel-level analysis (not a random/mock result):
 *   1. Loads the image and downsamples it for fast, consistent processing.
 *   2. Computes overall average luminance (perceived brightness).
 *   3. Finds the single brightest region ("hot spot") in the frame and
 *      measures how much brighter it is than the surrounding average -
 *      a working streetlamp against a night sky produces a strong,
 *      concentrated hot spot with high local contrast.
 *   4. Measures the ratio of near-white "bright" pixels to total pixels.
 *   5. Combines these signals into a confidence-scored classification.
 *
 * This is a real, deterministic heuristic - the same photo always produces
 * the same result - and is documented as a heuristic, not a deep-learning
 * model, so its limits are transparent to admins reviewing the output.
 */

const Jimp = require('jimp');

const GRID = 12; // divide image into a GRID x GRID cell map for hot-spot search

async function analyzeStreetlightImage(filePath) {
  const image = await Jimp.read(filePath);
  const width = image.getWidth();
  const height = image.getHeight();

  // Downscale for consistent, fast processing regardless of original size
  const work = image.clone().resize(240, Jimp.AUTO);
  const w = work.getWidth();
  const h = work.getHeight();

  let totalLuminance = 0;
  let brightPixels = 0;
  let pixelCount = 0;

  const cellW = Math.max(1, Math.floor(w / GRID));
  const cellH = Math.max(1, Math.floor(h / GRID));
  const cellSums = Array.from({ length: GRID * GRID }, () => ({ sum: 0, count: 0 }));

  work.scan(0, 0, w, h, function scanPixels(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Perceived luminance (ITU-R BT.601)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    totalLuminance += luminance;
    pixelCount += 1;
    if (luminance > 225) brightPixels += 1;

    const cellX = Math.min(GRID - 1, Math.floor(x / cellW));
    const cellY = Math.min(GRID - 1, Math.floor(y / cellH));
    const cellIndex = cellY * GRID + cellX;
    cellSums[cellIndex].sum += luminance;
    cellSums[cellIndex].count += 1;
  });

  const avgBrightness = totalLuminance / pixelCount; // 0-255
  const brightPixelRatio = brightPixels / pixelCount; // 0-1

  const cellAverages = cellSums
    .filter((c) => c.count > 0)
    .map((c) => c.sum / c.count);

  const hotSpot = Math.max(...cellAverages);
  const overallCellAvg = cellAverages.reduce((a, b) => a + b, 0) / cellAverages.length;
  const contrastScore = Math.max(0, hotSpot - overallCellAvg); // how much the brightest cell stands out

  // --- Classification heuristic -------------------------------------------------
  // A functioning streetlamp photographed at night/dusk produces:
  //   - a strong localized hot spot (contrastScore high)
  //   - at least a small ratio of genuinely bright pixels (the bulb/glow)
  // A dark/missing/broken lamp against a night sky produces:
  //   - low overall brightness AND low contrast (nothing stands out)
  // A daytime photo (ambiguous, since the lamp status can't be visually judged)
  // produces uniformly high average brightness with low contrast.

  let classification = 'inconclusive';
  let confidence = 50;
  let summary = '';

  const isUniformlyBright = avgBrightness > 140 && contrastScore < 35;
  const hasStrongHotSpot = contrastScore >= 55 && brightPixelRatio > 0.001;
  const isDarkWithNoHotspot = avgBrightness < 90 && contrastScore < 40;

  if (isUniformlyBright) {
    classification = 'inconclusive';
    confidence = 55;
    summary =
      'Image appears to be taken in daylight or a well-lit area, so the lamp\'s on/off state cannot be visually confirmed. Manual verification recommended.';
  } else if (hasStrongHotSpot) {
    classification = 'likely_functional';
    confidence = Math.min(97, Math.round(60 + contrastScore / 3 + brightPixelRatio * 400));
    summary = `A concentrated bright hot spot was detected (contrast ${contrastScore.toFixed(
      1
    )}), consistent with an illuminated lamp against a darker background.`;
  } else if (isDarkWithNoHotspot) {
    classification = 'likely_faulty';
    confidence = Math.min(96, Math.round(55 + (90 - avgBrightness) / 2 + (40 - contrastScore) / 2));
    summary = `The scene is dark overall (avg brightness ${avgBrightness.toFixed(
      1
    )}/255) with no distinct light source detected in the frame, consistent with a non-functional or missing streetlight.`;
  } else {
    classification = 'inconclusive';
    confidence = 48;
    summary =
      'Lighting signals in the photo are mixed. Recommend a closer or wider-angle photo, ideally taken after sunset, for a clearer AI reading.';
  }

  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  return {
    classification,
    confidence,
    avgBrightness: Number(avgBrightness.toFixed(2)),
    brightPixelRatio: Number(brightPixelRatio.toFixed(4)),
    contrastScore: Number(contrastScore.toFixed(2)),
    summary,
    analyzedAt: new Date(),
    meta: { originalWidth: width, originalHeight: height },
  };
}

/**
 * Priority score combines AI confidence that the light is faulty, community
 * confirmations, and whether the location is a sensitive zone (school,
 * hospital, transit stop) supplied by the reporter.
 */
function computePriorityScore({ aiClassification, aiConfidence, confirmationCount = 0, isSensitiveZone = false }) {
  let score = 0;
  if (aiClassification === 'likely_faulty') score += aiConfidence * 0.6;
  else if (aiClassification === 'inconclusive') score += 20;
  else score += 5;

  score += Math.min(confirmationCount, 20) * 3; // diminishing but meaningful weight
  if (isSensitiveZone) score += 25;

  return Math.round(Math.min(100, score));
}

module.exports = { analyzeStreetlightImage, computePriorityScore };
