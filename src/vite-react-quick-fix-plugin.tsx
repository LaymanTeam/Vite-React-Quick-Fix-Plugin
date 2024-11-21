import type { Plugin } from 'vite';
import { parse, normalize } from 'path';
import type { PluginOptions, TransformResult } from './types';
import { ComponentTracker } from './tracker/ComponentTracker';

/**
 * Checks if a file is a valid JavaScript/TypeScript file
 * @param {string} file - File path to check
 * @returns {boolean} True if file is a valid JS/TS file
 */
function isValidFile(file: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(file);
}

/**
 * Creates a Vite plugin that adds quick-access editor buttons to React components
 * during development.
 */
const reactQuickFixPlugin = function(options: PluginOptions = {}): Plugin {
  const { 
    editor = 'vscode://file',
    baseFilePath = process.cwd()
  } = options;

  const tracker = new ComponentTracker();

  return {
    name: 'vite-react-quick-fix-plugin',
    apply: 'serve', // Only apply in dev mode

    configureServer(server) {
      // Setup HMR handling
      server.ws.on('quick-fix:component-update', () => {
        tracker.refreshComponents();
      });

      // Cleanup on server close
      server.httpServer?.on('close', () => {
        tracker.dispose();
      });
    },

    transform(code: string, id: string): TransformResult | null {
      if (!isValidFile(id)) return null;

      try {
        const normalizedId = normalize(id);
        const fullPath = normalizedId.startsWith(baseFilePath) 
          ? normalizedId 
          : `${baseFilePath}/${normalizedId}`;
        
        return tracker.injectTracking(code, fullPath, editor);
      } catch (error) {
        console.error(`Error processing ${id}:`, error);
        return null;
      }
    },

    // Cleanup when build ends
    buildEnd() {
      tracker.dispose();
    }
  };
};

export default reactQuickFixPlugin;

`;

        // Handle different export types
        const exportMatch = code.match(/export\s+(default\s+)?(?:function|class|const|let|var)?\s*(\w+)/);
        if (exportMatch) {
          const isDefault = !!exportMatch[1];
          const componentName = exportMatch[2];
          const newExport = isDefault
            ? `export default (props) => {
                const OriginalComponent = ${componentName};
                return createElement(
                  'div',
                  { style: { position: 'relative' } },
                  [
                    createElement(OriginalComponent, props),
                    createElement(OpenInEditorButton, {
                      fileName: "${fileName}",
                      editorUrl: "${editorUrl}"
                    }),
                    createElement('style', null, 
                      'div:hover > button { display: block !important; }'
                    )
                  ].filter(Boolean)
                );
              };`
            : `export const ${componentName} = (props) => {
                const OriginalComponent = ${componentName};
                return createElement(
                  'div',
                  { style: { position: 'relative' } },
                  [
                    createElement(OriginalComponent, props),
                    createElement(OpenInEditorButton, {
                      fileName: "${fileName}",
                      editorUrl: "${editorUrl}"
                    }),
                    createElement('style', null, 
                      'div:hover > button { display: block !important; }'
                    )
                  ].filter(Boolean)
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
