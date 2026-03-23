export type PaceType = 'average' | 'stronger-begin' | 'stronger-finish';

export type SwimStyle = 'Freestyle' | 'Butterfly' | 'Breaststroke' | 'Backstroke' | 'IM';

export type RaceDistance = 50 | 100 | 200 | 400 | 800 | 1500;

export interface SplitTimes {
  [key: string]: number; // e.g., "15m": 5.04, "25m": 9.12, etc.
}

export interface TimesheetRow {
  target: [number, number];
  splits: SplitTimes;
}

/**
 * Get split markers for a given race distance
 * Returns distances in meters where splits should be recorded
 */
function getSplitMarkers(raceDistance: RaceDistance): number[] {
  const markerMap: Record<RaceDistance, number[]> = {
    50: [15, 20, 25, 30, 35, 40, 45, 50],
    100: [15, 35, 50, 70, 85, 100],
    200: [15, 50, 75, 100, 125, 150, 175, 200],
    400: [25, 50, 100, 150, 200, 250, 300, 350, 375, 400],
    800: [50, 100, 200, 300, 400, 500, 600, 700, 750, 800],
    1500: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
  };

  return markerMap[raceDistance];
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
 * @param raceDistance - Race distance in meters
 * @param paceType - Type of pacing strategy
 * @returns Array of timesheet rows
 */
export function generateTimesheet(
  startTime: number,
  raceDistance: RaceDistance,
  paceType: PaceType
): TimesheetRow[] {
  const rows: TimesheetRow[] = [];
  const steps = [
      1,
      .99,
      .98,
      .95,
      .9,
      .85,
      .8,
      .75,
      .7,
      .65,
      .6,
      .55,
      .5
  ];

  for (let i = 0; i < steps.length; i++) {
    const rawTarget = startTime * (2 - steps[i]);
    const splits = calculateSplitTimes(rawTarget, raceDistance, paceType);
    rows.push({
      target: [steps[i] * 100, Number(rawTarget.toFixed(1))],
      splits: splits
    });
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
 * Format time for input display (MM:SS for times >= 60s, SS.S otherwise)
 */
export function formatTimeForInput(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return seconds.toFixed(1);
}

/**
 * Parse time from string input (accepts MM:SS or seconds)
 */
export function parseTimeInput(input: string): number {
  if (input.includes(':')) {
    const [mins, secs] = input.split(':').map(Number);
    return mins * 60 + (secs || 0);
  }
  return Number(input);
}

/**
 * Get default time range for a given race distance
 * Returns [startTime, endTime] in seconds
 */
export function getDefaultTimeRange(raceDistance: RaceDistance): [number, number] {
  const ranges: Record<RaceDistance, [number, number]> = {
    50: [20, 27],           // 20s to 27s
    100: [45, 60],          // 45s to 1:00
    200: [100, 150],        // 1:40 to 2:30
    400: [220, 300],        // 3:40 to 5:00
    800: [440, 600],        // 7:20 to 10:00
    1500: [870, 1080],      // 14:30 to 18:00
  };

  return ranges[raceDistance];
}
