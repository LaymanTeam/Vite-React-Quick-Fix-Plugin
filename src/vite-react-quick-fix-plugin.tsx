import type { Plugin } from 'vite';
import { parse, normalize } from 'path';
import type { PluginOptions, TransformResult } from './types';
import { SourceMapInput } from 'rollup';

/**
 * Checks if a file is a valid JavaScript/TypeScript file
 * @param {string} file - File path to check
 * @returns {boolean} True if file is a valid JS/TS file
 */
function isValidFile(file: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(file);
}

// Create a memoized patterns array at module level
const REACT_PATTERNS: ReadonlyArray<RegExp> = Object.freeze([
  /import\s+.*\s+from\s+['"]react['"]/,
  /extends\s+React\.Component/,
  /React\.createElement/,
  /jsx/i,
  /<[A-Z][A-Za-z0-9]*/, // JSX component
  /return\s*\(/  // Likely a functional component
]);

// Create a simple cache for isReactComponent results
const componentCache = new Map<string, boolean>();

/**
 * Detects if code contains React component patterns with memoization
 * @param {string} code - Source code to analyze
 * @returns {boolean} True if code contains React patterns
 */
function isReactComponent(code: string): boolean {
  // Use cache if available
  const cached = componentCache.get(code);
  if (cached !== undefined) {
    return cached;
  }

  // Check patterns and cache result
  const result = REACT_PATTERNS.some(pattern => pattern.test(code));
  
  // Only cache if the cache isn't too large (prevent memory leaks)
  if (componentCache.size < 1000) {
    componentCache.set(code, result);
  }

  return result;
}

// Add a cleanup function to periodically clear the cache
function clearComponentCache(): void {
  if (componentCache.size > 800) { // Clear when approaching limit
    componentCache.clear();
  }
}

/**
 * Creates a Vite plugin that adds quick-access editor buttons to React components
 * during development.
 * 
 * @param {PluginOptions} options - Plugin configuration options
 * @returns {Plugin} Vite plugin instance
 * 
 * @example
 * ```ts
 * // vite.config.ts
 * import reactQuickFix from 'vite-react-quick-fix-plugin'
 * 
 * export default defineConfig({
 *   plugins: [
 *     reactQuickFix({
 *       editor: 'vscode://file',
 *       baseFilePath: process.cwd()
 *     })
 *   ]
 * })
 * ```
 */
const reactQuickFixPlugin = function(options: PluginOptions = {}): Plugin {
  const { 
    editor = 'vscode://file',
    baseFilePath = process.cwd()
  } = options;

  let isDev = false; // Add this flag

  return {
    name: 'vite-plugin-react-component-opener',
    apply: 'serve', // This already ensures we only run in dev mode

    configResolved(config) {
      isDev = config.command === 'serve'; // Set the flag based on Vite's command
      
      if (isDev) {
        setInterval(clearComponentCache, 300000); // Clear every 5 minutes
      }
    },

    buildEnd() {
      componentCache.clear();
    },
    transform(code: string, id: string): TransformResult | null {
      if (!isValidFile(id) || !isDev) return null; // Use our flag instead of import.meta.env.DEV

      try {
        if (!isReactComponent(code)) {
          return null; // Skip non-React files
        }

        const normalizedId = normalize(id);
        const fullPath = normalizedId.startsWith(baseFilePath) ? normalizedId : `${baseFilePath}/${normalizedId}`;
        const editorUrl = `${editor}/${encodeURIComponent(fullPath)}`;
        const fileName = parse(id).base;

        const injectedCode = `
import React from 'react';
import ReactDOM from 'react-dom';

const OpenInEditorButton = ({ fileName, editorUrl }) => {
  const handleClick = (e) => {
    if (e.altKey) {
      e.preventDefault();
      window.open(editorUrl, '_blank');
    }
  };

  return ReactDOM.createPortal(
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 9999,
        display: 'none',
      }}
    >
      Open {fileName}
    </button>,
    document.body
  );
};

`;

        // Handle different export types
        const exportMatch = code.match(/export\s+(default\s+)?(?:function|class|const|let|var)?\s*(\w+)/);
        if (exportMatch) {
          const isDefault = !!exportMatch[1];
          const componentName = exportMatch[2];
          const newExport = isDefault
            ? `export default (props) => {
                const OriginalComponent = ${componentName};
                return (
                  <div style={{ position: 'relative' }}>
                    <OriginalComponent {...props} />
                    <OpenInEditorButton fileName="${fileName}" editorUrl="${editorUrl}" />
                    <style>{
                      \`div:hover > button { display: block !important; }\`
                    }</style>
                  </div>
                );
              };`
            : `export const ${componentName} = (props) => {
                const OriginalComponent = ${componentName};
                return (
                  <div style={{ position: 'relative' }}>
                    <OriginalComponent {...props} />
                    <OpenInEditorButton fileName="${fileName}" editorUrl="${editorUrl}" />
                    <style>{
                      \`div:hover > button { display: block !important; }\`
                    }</style>
                  </div>
                );
              };`;
          
          code = injectedCode + code + newExport;
        } else {
          console.warn(`No export found in ${fileName}. Skipping OpenInEditor injection.`);
        }

        return {
          code: code,
          map: null as SourceMapInput | null, // explicitly type the map
        };
      } catch (error) {
        console.error(`Error injecting OpenInEditor in ${id}: ${error}`);
        componentCache.delete(code); // Remove failed entries from cache
        return null;
      }
    },
  } as Plugin;
}

export default reactQuickFixPlugin;
