# Taxonomy Inspector

A web-based visualization tool for inspecting the taxonomy data stored in `../data/`.

## Features

- **Collapsible tree view** of all categories, specification groups, and specifications
- **Hierarchical display** showing parent-child category relationships
- **Configurable default states** (open/closed) for each node type via `inspector-config.json`
- **Expand/Collapse all** buttons for quick navigation
- **Detailed view** for specifications showing all metadata
- **Visual badges** for required/optional and highlighted specs
- **Color-coded icons** for different node types

## Quick Start

### Development Mode (Recommended) - With Auto-Reload

```bash
cd interface
npm run dev
```

This starts the server with **live reload** - any changes to `../data/*.json` files will automatically refresh the browser.

### Production Mode - Without Auto-Reload

```bash
cd interface
npm start
```

Then open http://localhost:3000 in your browser.

## Configuration

Edit `inspector-config.json` to change default open/closed states:

```json
{
  "defaultStates": {
    "category": "closed",      // or "open"
    "specGroup": "closed",     // or "open"
    "specification": "closed"  // or "open"
  }
}
```

## Data Source

The inspector reads data from:
- `../data/categories.json`
- `../data/specification-groups.json`
- `../data/specifications.json`

## Tree Structure

```
📁 Category (e.g., "Bindery")
  ├── 📁 Child Category (e.g., "Perfect Binding")
  │   ├── 📋 Specification Group (e.g., "Technical Data")
  │   │   ├── 🔧 Specification (e.g., "Max Speed")
  │   │   └── 🔧 Specification (e.g., "Format Range")
  │   └── 📋 Specification Group (e.g., "Equipment")
  │       └── 🔧 Specification (e.g., "Color Control")
  └── 📁 Child Category (e.g., "Stitching Systems")
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).
