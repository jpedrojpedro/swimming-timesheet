import { useState, useMemo } from 'react';
import './App.css';
import type { RaceDistance, SwimStyle, PaceType } from './utils/paceCalculator';
import { generateTimesheet, formatTime, getDefaultTimeRange } from './utils/paceCalculator';
import { exportToCSV, exportToExcel, exportToPDF } from './utils/exporters';

function App() {
  const [raceDistance, setRaceDistance] = useState<RaceDistance>(50);
  const [swimStyle, setSwimStyle] = useState<SwimStyle>('Freestyle');
  const [paceType, setPaceType] = useState<PaceType>('average');

  const defaultRange = getDefaultTimeRange(raceDistance);
  const [startTime, setStartTime] = useState(defaultRange[0]);
  const [endTime, setEndTime] = useState(defaultRange[1]);
  const [step, setStep] = useState(0.2);

  // Update time range when race distance changes
  const handleDistanceChange = (distance: RaceDistance) => {
    setRaceDistance(distance);
    const range = getDefaultTimeRange(distance);
    setStartTime(range[0]);
    setEndTime(range[1]);
  };

  const timesheet = useMemo(
    () => generateTimesheet(startTime, endTime, step, raceDistance, paceType),
    [startTime, endTime, step, raceDistance, paceType]
  );

  const splitColumns = useMemo(() => {
    if (timesheet.length > 0) {
      return Object.keys(timesheet[0].splits);
    }
    return [];
  }, [timesheet]);

  return (
    <div className="app">
      {/* Ad Space */}
      <div className="ad-space">
        <p className="ad-placeholder">Advertisement Space</p>
      </div>

      <header>
        <h1>Swimming Pace Calculator</h1>
        <p>Calculate target split times for training</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="race-distance">Race Distance:</label>
          <select
            id="race-distance"
            value={raceDistance}
            onChange={(e) => handleDistanceChange(Number(e.target.value) as RaceDistance)}
          >
            <option value={50}>50m</option>
            <option value={100}>100m</option>
            <option value={200}>200m</option>
            <option value={400}>400m</option>
            <option value={800}>800m</option>
            <option value={1500}>1500m</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="swim-style">Swimming Style:</label>
          <select
            id="swim-style"
            value={swimStyle}
            onChange={(e) => setSwimStyle(e.target.value as SwimStyle)}
          >
            <option value="Freestyle">Freestyle</option>
            <option value="Butterfly">Butterfly</option>
            <option value="Breaststroke">Breaststroke</option>
            <option value="Backstroke">Backstroke</option>
            <option value="IM">IM (Individual Medley)</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="pace-type">Pace Strategy:</label>
          <select
            id="pace-type"
            value={paceType}
            onChange={(e) => setPaceType(e.target.value as PaceType)}
          >
            <option value="average">Average Pace</option>
            <option value="stronger-begin">Stronger Begin</option>
            <option value="stronger-finish">Stronger Finish</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-time">Start Time (s):</label>
          <input
            id="start-time"
            type="number"
            step="0.1"
            value={startTime}
            onChange={(e) => setStartTime(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="end-time">End Time (s):</label>
          <input
            id="end-time"
            type="number"
            step="0.1"
            value={endTime}
            onChange={(e) => setEndTime(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="step">Step (s):</label>
          <input
            id="step"
            type="number"
            step="0.1"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={() => exportToCSV(timesheet, raceDistance, swimStyle, paceType)}>
          Export CSV
        </button>
        <button onClick={() => exportToExcel(timesheet, raceDistance, swimStyle, paceType)}>
          Export Excel
        </button>
        <button onClick={() => exportToPDF(timesheet, raceDistance, swimStyle, paceType)}>
          Export PDF
        </button>
      </div>

      <div className="table-container">
        <table className="timesheet">
          <thead>
            <tr>
              <th>Target ({raceDistance}m)</th>
              {splitColumns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timesheet.map((row) => (
              <tr key={row.target}>
                <td className="target-cell">{formatTime(row.target)}</td>
                {splitColumns.map((col) => (
                  <td key={col}>{formatTime(row.splits[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
