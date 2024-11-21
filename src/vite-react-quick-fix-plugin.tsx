import type { Plugin } from 'vite';
import { normalize } from 'path';
import type { PluginOptions, TransformResult } from './types';
import { ComponentTracker } from './tracker/ComponentTracker';

/**
 * Validates if a file should be processed by the plugin
 */
const isValidFile = (file: string): boolean => /\.(js|jsx|ts|tsx)$/.test(file);

/**
 * Resolves editor protocol from plugin options
 */
function resolveEditorProtocol(editor: PluginOptions['editor']): string {
  if (typeof editor === 'string') {
    return editor;
  }
  
  if (editor && typeof editor === 'object') {
    const { protocol, args } = editor;
    if (args) {
      const queryString = Object.entries(args)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      return `${protocol}?${queryString}`;
    }
    return protocol;
  }
  
  return 'vscode://file'; // default fallback
}

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
  
  // Resolve editor protocol once during initialization
  const editorProtocol = resolveEditorProtocol(editor);

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
        return tracker.injectTracking(code, fullPath, editorProtocol);
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
