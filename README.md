# Swimming Pace Calculator

A web application for swimming coaches and athletes to calculate target split times for training sessions.

## Features

- **Multiple Race Distances**: 50m, 100m, 200m, 400m, 800m, 1500m
- **Swimming Styles**: Freestyle, Butterfly, Breaststroke, Backstroke, IM (Individual Medley)
- **Pace Strategies**:
  - Average Pace: Equal speed throughout
  - Stronger Begin: Faster start, slower finish
  - Stronger Finish: Slower start, faster finish
- **Customizable Time Ranges**: Set start/end times and step increments
- **Export Options**:
  - CSV format
  - Excel (.xlsx)
  - Printable PDF

## Usage

1. Select your race distance (e.g., 50m, 100m, 200m)
2. Choose swimming style
3. Select pace strategy
4. Adjust time range and step size
5. View the generated timesheet with split times
6. Export to CSV, Excel, or PDF

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for automatic deployment to GitHub Pages. Push to the `main` branch to trigger deployment.

### Setup GitHub Pages:

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. The workflow will automatically build and deploy on push

## Technology Stack

- **Vite** - Build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **XLSX** - Excel export
- **jsPDF** - PDF generation

## License

MIT
