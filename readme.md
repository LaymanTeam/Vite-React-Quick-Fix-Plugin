# vite-react-quick-fix-plugin

A lightweight Vite plugin that enhances React development workflow by adding quick-access editor buttons to your components during development.

## 🚀 Features

- Adds a hover-activated "Open in Editor" button to React components in development
- Alt + Click to quickly jump to component source files
- Automatically detects React components
- Supports multiple export types
- Zero impact on production builds
- Minimal runtime overhead

## 📦 Installation

```bash
npm install vite-react-quick-fix-plugin --save-dev
# or
yarn add -D vite-react-quick-fix-plugin
```

## 🔧 Usage

Add to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import reactQuickFix from 'vite-react-quick-fix-plugin'

export default defineConfig({
  plugins: [
    reactQuickFix({
      editor: 'vscode://file', // default
      baseFilePath: process.cwd() // default
    })
  ]
})
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| editor | string | 'vscode://file' | URL protocol for your editor |
| baseFilePath | string | process.cwd() | Base path for resolving component files |

## 🤔 How It's Different

Unlike ClickToComponent and similar tools that modify the React DevTools or require browser extensions, this plugin:
- Works directly in your development environment
- Requires no additional browser extensions
- Integrates seamlessly with Vite's build process
- Has zero configuration needed for basic usage
- Maintains clean production builds with no remnant code

## ⚠️ Limitations

- Only works in development mode
- Currently supports VS Code by default (other editors need custom URL protocols)
- Only detects components with standard React patterns
- May have minor performance impact on large applications with many components
- Does not support source maps in the current version

## 🔍 Requirements

- Vite 2.x or higher
- React 16.8+ or Preact X
- Development environment must support your chosen editor's URL protocol

## 🤝 Contributing

We welcome contributions! We're particularly interested in:

- Adding support for more editors
- Improving component detection
- Adding source map support
- Optimizing performance
- Adding tests

### For Maintainers

To maintain this plugin, you should be familiar with:
- Vite's Plugin API
- React/Preact internals
- AST manipulation
- TypeScript
- Build tooling and bundling

## 📝 License

MIT

## 🙏 Credits

Inspired by tools like ClickToComponent while taking a different approach to enhance React development workflow.
