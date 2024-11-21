import type { Plugin } from 'vite';
import { normalize } from 'path';
import type { PluginOptions, TransformResult } from './types';
import { ComponentTracker } from './tracker/ComponentTracker';

/**
 * Validates if a file should be processed by the plugin
 */
const isValidFile = (file: string): boolean => /\.(js|jsx|ts|tsx)$/.test(file);

/**
 * Creates a Vite plugin that adds quick-access editor buttons to React components
 * during development.
 * 
 * @param options - Plugin configuration options
 * @returns Vite plugin instance
 */
export function reactQuickFixPlugin(options: PluginOptions = {}): Plugin {
  const {
    editor = 'vscode://file',
    baseFilePath = process.cwd()
  } = options;

  // Initialize component tracker
  const tracker = new ComponentTracker();

  return {
    name: 'vite-react-quick-fix-plugin',
    apply: 'serve', // Only active during development

    configureServer(server) {
      // Handle HMR updates
      server.ws.on('quick-fix:component-update', () => {
        tracker.refreshComponents();
      });

      // Cleanup on server shutdown
      server.httpServer?.on('close', () => {
        tracker.dispose();
      });
    },

    /**
     * Transform React components to include editor buttons
     */
    transform(code: string, id: string): TransformResult | null {
      // Skip non-React files
      if (!isValidFile(id)) {
        return null;
      }

      try {
        // Normalize file path for consistent handling
        const normalizedId = normalize(id);
        const fullPath = normalizedId.startsWith(baseFilePath)
          ? normalizedId
          : `${baseFilePath}/${normalizedId}`;

        // Inject tracking code
        return tracker.injectTracking(code, fullPath, editor);
      } catch (error) {
        console.error(`[vite-react-quick-fix] Error processing ${id}:`, error);
        return null;
      }
    },

    /**
     * Cleanup when Vite build ends
     */
    buildEnd() {
      tracker.dispose();
    }
  };
}

// Default export for convenience
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
