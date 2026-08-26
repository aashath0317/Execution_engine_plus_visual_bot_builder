# Fydblock Visual Bot Builder Documentation

This document serves as the technical reference for the Visual Bot Builder engine. It outlines the purpose of each component, how state is managed, and how the entire system connects together so you can easily add features or improve the code later.

---

## 1. System Architecture Overview

The visual builder is an entirely custom-built SVG-based node engine running on React state. It does not rely on heavy third-party node libraries (like React Flow), making it extremely lightweight, highly customizable, and perfectly styled to match Fydblock's premium glassmorphic aesthetic.

### File Structure
All builder code is located in `src/pages/landing/visual-builder/`:
- `VisualBuilder.jsx` — The main layout wrapper.
- `useCanvasState.js` — The core state engine (the "brain").
- `Canvas.jsx` — The interactive SVG rendering engine.
- `NodeLibrary.jsx` — The left sidebar for dragging new nodes.
- `PropertiesPanel.jsx` — The right sidebar for configuring the selected node(s).
- `nodeTypes.js` — The central registry defining every node's behavior.

---

## 2. Component Details

### `nodeTypes.js` (The Node Registry)
This file is the single source of truth for every type of block you can place on the canvas. 
- **Purpose:** If you want to add a new indicator, data source, or logic controller, you simply add an object here.
- **What it does:** Defines the node's `category`, `label`, `color`, `icon`, `inputs` (array of ports), `outputs` (array of ports), and `defaults` (the default configuration data like pair, time interval, thresholds).
- **Extensibility:** To add a new "RSI" node, you just append it to the `NODE_REGISTRY` object here, and it will instantly appear in the library and be renderable on the canvas.

### `useCanvasState.js` (The Core Engine)
This is a massive custom React Hook (`useCanvasState`) that holds the entire state of the bot builder in memory.
- **State Stored:**
  - `nodes`: Array of objects (ID, X/Y coordinates, type, and config).
  - `connections`: Array of links between node ports.
  - `selectedNodeIds`: Array of IDs that the user currently has selected.
  - `pan` and `zoom`: For the infinite canvas camera.
  - `connecting`: Tracks temporary drag state when drawing a wire between ports.
- **Actions Provided:** `addNode`, `moveNodes`, `deleteNodes`, `selectNode`, `startConnect`, `finishConnect`, `zoomIn`, `zoomOut`.
- **Extensibility:** If you ever need to add "Undo/Redo" functionality or "Copy/Paste", you would implement it inside this hook by keeping a history array of the `nodes` and `connections` states.

### `Canvas.jsx` (The Rendering Engine)
This is the most complex visual component. It renders the nodes and wires using standard HTML and SVG.
- **How it works:** 
  - It renders a massive `<svg>` container. 
  - Inside the SVG, it creates a `<g>` (group) tag that has a CSS `transform` applied to it based on the `pan` and `zoom` state. This gives you the infinite zooming canvas.
  - Wires are drawn using `<path d="...">` with cubic bezier math to make them curve beautifully.
  - Nodes (`<CanvasNode>`) are drawn using `<foreignObject>`, which allows us to inject normal HTML/Tailwind `<div>` elements inside an SVG context. This is how we get nice glassmorphism and drop shadows inside the SVG.
- **Multi-select:** Contains the math to detect bounding boxes when dragging a `Shift+Click` Marquee over nodes.
- **Extensibility:** If you want to add an auto-layout "Snap to Grid" feature, you would modify the drag logic here to round the `X/Y` coordinates to the nearest multiple of the `GRID_SPACING`.

### `VisualBuilder.jsx` (The Layout Wrapper)
This is just the UI skeleton.
- **Purpose:** It initializes `const state = useCanvasState()` and passes all the state variables down to the UI panels. 
- **What it does:** Renders the Fydblock top toolbar (Save, Load, Clear, Zoom) and creates the 3-column flex layout (Library, Canvas, Properties).

### `NodeLibrary.jsx` (The Left Sidebar)
- **Purpose:** Renders the list of available blocks.
- **How it works:** Iterates over `Object.entries(NODE_REGISTRY)` and renders a draggable block for each one using the HTML5 Drag-and-Drop API (`onDragStart`). 

### `PropertiesPanel.jsx` (The Right Sidebar)
- **Purpose:** Dynamically renders inputs so the user can configure their selected node.
- **How it works:** When a node is selected, it looks at the `node.config` object. It iterates over the keys and generates UI inputs.
  - If a key has predefined options (e.g., `pair` has hundreds of Fydblock coins, `interval` has 1m, 5m, 1h), it renders our **Custom Glassmorphic Searchable Dropdown**.
  - If multiple nodes are selected, it hides the individual config and shows a bulk "Delete Nodes" button.
- **Extensibility:** If you ever add a new data type to a node (like a "date range"), you would update the `ConfigField` component here to render a Date Picker.

---

## 3. Data Integration

### `src/data/pairs.js`
The Visual Builder does not use a hardcoded list of crypto pairs. It imports `getSortedPairs()` from your main project data. This guarantees that if you add a new coin to Fydblock in the future, the Bot Builder's dropdowns will automatically update without any changes to the builder code.
