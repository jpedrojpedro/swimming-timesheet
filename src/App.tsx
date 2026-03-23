import { useState, useMemo } from 'react';
import './App.css';
{/* import type { RaceDistance, SwimStyle, PaceType } from './utils/paceCalculator'; */}
import type { RaceDistance, PaceType } from './utils/paceCalculator';
import {
  generateTimesheet,
  formatTime,
  getDefaultTimeRange,
  formatTimeForInput,
  parseTimeInput
} from './utils/paceCalculator';
import { exportToCSV, exportToExcel, exportToPDF } from './utils/exporters';
import AdBanner from './components/AdBanner';

function App() {
  const [raceDistance, setRaceDistance] = useState<RaceDistance>(50);
  {/* const [swimStyle, setSwimStyle] = useState<SwimStyle>('Freestyle'); */}
  const [paceType, setPaceType] = useState<PaceType>('average');

  const defaultRange = getDefaultTimeRange(raceDistance);
  const [startTime, setStartTime] = useState(defaultRange[0]);
  {/* const [endTime, setEndTime] = useState(defaultRange[1]); */}
  {/* const [step, setStep] = useState(0.2); */}

  // Update time range when race distance changes
  const handleDistanceChange = (distance: RaceDistance) => {
    setRaceDistance(distance);
    const range = getDefaultTimeRange(distance);
    setStartTime(range[0]);
    {/* setEndTime(range[1]); */}
  };

  const timesheet = useMemo(
    () => generateTimesheet(startTime, raceDistance, paceType),
    [startTime, raceDistance, paceType]
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
      <AdBanner />

      <header>
        <h1>Race Pace Calculator</h1>
        <p>Set your goal time and let the magic happen.</p>
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

        {/*
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
        */}

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
          <label htmlFor="start-time">
            Goal Time {raceDistance >= 200 ? '(MM:SS)' : '(seconds)'}:
          </label>
          <input
            id="start-time"
            type="text"
            value={formatTimeForInput(startTime)}
            onChange={(e) => setStartTime(parseTimeInput(e.target.value))}
            placeholder={raceDistance >= 200 ? "1:45" : "20.0"}
          />
        </div>

        {/*
        <div className="control-group">
          <label htmlFor="end-time">
            End Time {raceDistance >= 200 ? '(MM:SS)' : '(seconds)'}:
          </label>
          <input
            id="end-time"
            type="text"
            value={formatTimeForInput(endTime)}
            onChange={(e) => setEndTime(parseTimeInput(e.target.value))}
            placeholder={raceDistance >= 200 ? "2:30" : "27.0"}
          />
        </div>
        */}

        {/*
        <div className="control-group">
          <label htmlFor="step">Step (seconds):</label>
          <input
            id="step"
            type="number"
            step="0.1"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </div>
        */}
      </div>

      <div className="export-buttons">
        <button onClick={() => exportToCSV(timesheet, raceDistance, paceType)}>
          Export CSV
        </button>
        <button onClick={() => exportToExcel(timesheet, raceDistance, paceType)}>
          Export Excel
        </button>
        <button onClick={() => exportToPDF(timesheet, raceDistance, paceType)}>
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
            {timesheet.map((row, index) => (
              <tr key={index}>
                <td className="target-cell">{row.target[0]}% → {formatTime(row.target[1])}</td>
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
