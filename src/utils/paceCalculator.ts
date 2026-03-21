export type PaceType = 'average' | 'stronger-begin' | 'stronger-finish';

export type SwimStyle = 'Freestyle' | 'Butterfly' | 'Breaststroke' | 'Backstroke' | 'IM';

export type RaceDistance = 50 | 100 | 200 | 400 | 800 | 1500;

export interface SplitTimes {
  [key: string]: number; // e.g., "15m": 5.04, "25m": 9.12, etc.
}

export interface TimesheetRow {
  target: number;
  splits: SplitTimes;
}

/**
 * Get split markers for a given race distance
 * Returns distances in meters where splits should be recorded
 */
function getSplitMarkers(raceDistance: RaceDistance): number[] {
  // Define split points as percentages that scale with distance
  const percentages = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  const markers = percentages.map(p => {
    const distance = raceDistance * p;
    // Round to nearest 5m for cleaner numbers
    return Math.round(distance / 5) * 5;
  });

  // Ensure last marker is exactly the race distance
  markers[markers.length - 1] = raceDistance;

  // Remove duplicates and return unique sorted values
  return [...new Set(markers)].sort((a, b) => a - b);
}

/**
 * Calculate split times for a given race distance and target time
 * @param targetTime - Target time for the race in seconds
 * @param raceDistance - Race distance in meters (50, 100, 200, etc.)
 * @param paceType - Type of pacing strategy
 * @returns Split times for each distance marker
 */
export function calculateSplitTimes(
  targetTime: number,
  raceDistance: RaceDistance,
  paceType: PaceType
): SplitTimes {
  const markers = getSplitMarkers(raceDistance);
  let times: number[];

  if (paceType === 'average') {
    // Linear pace - equal speed throughout
    const speed = raceDistance / targetTime; // meters per second
    times = markers.map(d => d / speed);
  } else if (paceType === 'stronger-begin') {
    // Faster start, slower finish
    // First half at ~97% of target pace (3% faster)
    // Second half at ~103% of target pace (3% slower)
    const avgSpeed = raceDistance / targetTime;
    const fastSpeed = avgSpeed * 1.03;
    const slowSpeed = avgSpeed * 0.97;
    const halfDistance = raceDistance / 2;

    times = markers.map(d => {
      if (d <= halfDistance) {
        return d / fastSpeed;
      } else {
        const firstHalf = halfDistance / fastSpeed;
        const remaining = d - halfDistance;
        return firstHalf + (remaining / slowSpeed);
      }
    });
  } else {
    // stronger-finish: Slower start, faster finish
    // First half at ~103% of target pace (3% slower)
    // Second half at ~97% of target pace (3% faster)
    const avgSpeed = raceDistance / targetTime;
    const slowSpeed = avgSpeed * 0.97;
    const fastSpeed = avgSpeed * 1.03;
    const halfDistance = raceDistance / 2;

    times = markers.map(d => {
      if (d <= halfDistance) {
        return d / slowSpeed;
      } else {
        const firstHalf = halfDistance / slowSpeed;
        const remaining = d - halfDistance;
        return firstHalf + (remaining / fastSpeed);
      }
    });
  }

  // Build the result object with marker labels
  const result: SplitTimes = {};

  for (let i = 0; i < markers.length - 1; i++) {
    result[`${markers[i]}m`] = times[i];
  }

  // Add finish split (last segment time)
  const lastSegmentDistance = markers[markers.length - 1] - markers[markers.length - 2];
  result[`finish-${lastSegmentDistance}m`] = times[times.length - 1] - times[times.length - 2];

  return result;
}

/**
 * Generate a complete timesheet with multiple target times
 * @param startTime - Starting target time in seconds
 * @param endTime - Ending target time in seconds
 * @param step - Step size in seconds
 * @param raceDistance - Race distance in meters
 * @param paceType - Type of pacing strategy
 * @returns Array of timesheet rows
 */
export function generateTimesheet(
  startTime: number,
  endTime: number,
  step: number,
  raceDistance: RaceDistance,
  paceType: PaceType
): TimesheetRow[] {
  const rows: TimesheetRow[] = [];

  // Round to avoid floating point issues
  const steps = Math.round((endTime - startTime) / step) + 1;

  for (let i = 0; i < steps; i++) {
    const target = Number((startTime + i * step).toFixed(1));
    const splits = calculateSplitTimes(target, raceDistance, paceType);
    rows.push({ target, splits });
  }

  return rows;
}

/**
 * Format time in seconds to MM:SS.SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
  }
  return secs.toFixed(2);
}

/**
 * Get default time range for a given race distance
 * Returns [startTime, endTime] in seconds
 */
export function getDefaultTimeRange(raceDistance: RaceDistance): [number, number] {
  const ranges: Record<RaceDistance, [number, number]> = {
    50: [20, 27],
    100: [45, 60],
    200: [100, 135],
    400: [210, 280],
    800: [450, 600],
    1500: [900, 1200],
  };

  return ranges[raceDistance];
}
