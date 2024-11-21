import reactQuickFixPlugin from './vite-react-quick-fix-plugin';

// Export the plugin as both default and named export
export default reactQuickFixPlugin;
export const reactQuickFix = reactQuickFixPlugin;

export type { 
  PluginOptions,
  OpenInEditorButtonProps,
  PluginFactory,
  TransformResult 
} from './types';
