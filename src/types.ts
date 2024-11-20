import type { Plugin } from 'vite';

/**
 * Configuration options for the plugin
 */
export interface PluginOptions {
  /**
   * URL protocol for the editor
   * @default 'vscode://file'
   */
  editor?: string;
  
  /**
   * Base path for resolving component files
   * @default process.cwd()
   */
  baseFilePath?: string;
}

/**
 * Props for the OpenInEditorButton component
 */
export interface OpenInEditorButtonProps {
  /** Name of the file to open */
  fileName: string;
  /** Full URL to open in editor */
  editorUrl: string;
}

/**
 * Plugin factory function type
 */
export type PluginFactory = (options?: PluginOptions) => Plugin;

/**
 * Component transformation result
 */
export interface TransformResult {
  code: string;
  map: null | object;
}
