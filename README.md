# diveXploreGroundTruthChecker

Interactive web application for visualizing and filtering query results from ground truth data.

## Sources

Ground truth data from:
https://www-nlpir.nist.gov/projects/trecvid/trecvid.data.html#tv21

## Getting Started

To run the web application:

1. Start a local web server in the project directory:
   ```bash
   python3 -m http.server 8000
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

**Note:** The application requires a web server due to CORS restrictions when loading TSV files. Simply opening `index.html` directly in your browser will not work.

## Usage

1. **Select Dataset**: Choose between "Ad Hoc Main Task Queries" or "Ad Hoc Progress Task Queries"
2. **Select Query**: Pick a specific query from the dropdown to view its results
3. **Filter Results**: Use the checkboxes to filter by:
   - Judgement values: -1, 0, 1
   - Sampling-Stratum: 1, 2, 3
4. View filtered results in the table below

## Thumbnail Setup

The application displays thumbnails for each shot in the results table. To enable thumbnails, organize them in the following directory structure:

```
thumbnails/
├── 00001/
│   ├── shot00001_1.png
│   ├── shot00001_2.png
│   └── ...
├── 00002/
│   ├── shot00002_1.png
│   ├── shot00002_2.png
│   └── ...
└── XXXXX/
    ├── shotXXXXX_N.png
    └── ...
```

**Naming Convention:**
- Extract the number between `shot` and `_` from the shot ID
- Create a folder with that number (e.g., `shot00042_119` → folder `00042`)
- Place the thumbnail PNG file with the full shot ID name inside that folder
- Example: `shot00042_119` → `thumbnails/00042/shot00042_119.png`

**Notes:**
- Thumbnails must be in PNG format
- Thumbnails are lazy-loaded only when visible (performance optimized)
- Missing thumbnails will show a placeholder image
- Hover over thumbnails to zoom in for detailed viewing

## Features

- Dynamic query loading from TSV files
- Real-time result filtering
- Result count display
- Thumbnail preview with lazy loading
- Responsive design for mobile devices
- Clean, modern interface
