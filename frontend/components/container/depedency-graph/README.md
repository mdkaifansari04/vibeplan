# Dependency Graph Visualization Component

A React Flow-based dependency graph visualization component for displaying repository structure and file dependencies.

## Features

- 📊 **Visual Dependency Graph**: Display files and their dependencies in an interactive graph
- 🎨 **Custom Node Types**: File nodes with metadata (language, functions, classes, lines)
- 🔍 **Interactive Navigation**: Pan, zoom, and explore the graph
- 📈 **Statistics Panel**: View repository statistics at a glance
- 🎯 **Type-Safe**: Full TypeScript support
- 🚀 **Performance**: Optimized for large codebases

## Components

### DependencyGraphSection

Main component that renders the dependency graph.

```tsx
import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";

<DependencyGraphSection data={dependencyGraphData} />;
```

### FileNode

Custom node component for displaying file information.

### FolderNode

Custom node component for displaying folder information (future enhancement).

## Data Structure

The component expects data in the following format:

```typescript
interface DependencyGraphData {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  stats: DependencyGraphStats;
}

interface DependencyGraphNode {
  id: string;
  type: "input" | "default" | "output";
  position: { x: number; y: number };
  data: {
    label: string;
    language: string;
    functions: number;
    classes: number;
    lines: number;
    fileType: string;
  };
  sourcePosition?: "left" | "right" | "top" | "bottom";
  targetPosition?: "left" | "right" | "top" | "bottom";
}

interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  type?: "smoothstep" | "default" | "straight";
  animated?: boolean;
}
```

## Usage Example

```tsx
const dependencyData = {
  nodes: [
    {
      id: "frontend/components/ui/button.tsx",
      type: "input",
      position: { x: 0, y: 0 },
      data: {
        label: "button.tsx",
        language: "typescript",
        functions: 1,
        classes: 0,
        lines: 60,
        fileType: "function",
      },
      sourcePosition: "right",
      targetPosition: "left",
    },
    // ... more nodes
  ],
  edges: [
    {
      id: "app->button",
      source: "frontend/app/page.tsx",
      target: "frontend/components/ui/button.tsx",
      type: "smoothstep",
      animated: false,
    },
    // ... more edges
  ],
  stats: {
    totalFiles: 120,
    totalDependencies: 36,
    languages: ["typescript", "javascript", "json"],
    entryPoints: ["README.md", "frontend/app/page.tsx"],
  },
};

function MyComponent() {
  return <DependencyGraphSection data={dependencyData} />;
}
```

## Styling

The component uses custom CSS classes defined in `index.css`. Key classes:

- `.file-node` - File node container
- `.file-node-header` - File node header with icon and label
- `.file-node-body` - File node body with stats
- `.file-node-language` - Language badge
- `.stat-item` - Individual stat display

## Utilities

The `graph-utils.ts` file provides helper functions:

- `extractFolderStructure()` - Extract folder hierarchy from file paths
- `calculateGraphStats()` - Calculate statistics from the graph
- `filterNodesByLanguage()` - Filter nodes by programming language
- `filterNodesByFileType()` - Filter nodes by file type
- `searchNodes()` - Search nodes by label or path
- `getEntryPointNodes()` - Get nodes with no incoming edges
- `getLeafNodes()` - Get nodes with no outgoing edges

## Customization

### Node Colors

Language colors are defined in the `getLanguageColor()` function in `file-node.tsx`. Add more languages:

```tsx
const colors: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f7df1e",
  python: "#3776ab",
  // Add your languages here
};
```

### File Type Icons

File type icons are defined in the `getFileTypeIcon()` function:

```tsx
const icons: Record<string, string> = {
  function: "ƒ",
  config: "⚙",
  component: "◆",
  // Add your file types here
};
```

## Features

- **Read-only View**: Nodes are not draggable or connectable by default
- **Zoom Controls**: Built-in zoom and pan controls
- **Mini Map**: Overview of the entire graph
- **Dotted Background**: Visual grid for better orientation
- **Statistics Panel**: Displays key metrics in the top-left corner

## Future Enhancements

- [ ] Expandable/collapsible folder nodes
- [ ] Search and filter functionality
- [ ] Different layout algorithms (hierarchical, circular, etc.)
- [ ] Export graph as image
- [ ] Click to view file content
- [ ] Highlight dependency paths
- [ ] Color coding by file size or complexity
