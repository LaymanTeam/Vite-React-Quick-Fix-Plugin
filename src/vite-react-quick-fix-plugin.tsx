import { Plugin, TransformResult } from 'vite';
import { parse, normalize } from 'path';

interface PluginOptions {
  editor?: string;
  baseFilePath?: string;
}

function isValidFile(file: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(file);
}

function isReactComponent(code: string): boolean {
  const reactPatterns = [
    /import\s+.*\s+from\s+['"]react['"]/,
    /extends\s+React\.Component/,
    /React\.createElement/,
    /jsx/i,
    /<[A-Z][A-Za-z0-9]*/, // JSX component
    /return\s*\(/  // Likely a functional component
  ];
  return reactPatterns.some(pattern => pattern.test(code));
}

export default function vitePluginReactComponentOpener(options: PluginOptions = {}): Plugin {
  const { 
    editor = 'vscode://file',
    baseFilePath = process.cwd()
  } = options;

  return {
    name: 'vite-plugin-react-component-opener',
    apply: 'serve',
    transform(code: string, id: string): TransformResult {
      if (!isValidFile(id) || !import.meta.env.DEV) return null;

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
          map: null, // We're not handling source maps in this simplified version
        };
      } catch (error) {
        console.error(`Error injecting OpenInEditor in ${id}: ${error}`);
        return null;
      }
    },
  };
}