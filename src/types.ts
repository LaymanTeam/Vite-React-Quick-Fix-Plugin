import type { Plugin } from 'vite';
import type { SourceMapInput } from 'rollup';
import type { ComponentInfo } from './tracker/types';

export type { ComponentInfo };  // Re-export for convenience

/**
 * Configuration options for the plugin
 */
export interface PluginOptions {
  /**
   * URL protocol for the editor
   * Can be a string (e.g. 'vscode://file') or an object with protocol and args
   * @default 'vscode://file'
   */
  editor?: string | {
    protocol: string;
    args?: Record<string, string>;
  };
  
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
  map: SourceMapInput | null;
}

/**
 * Function to validate file extensions
 */
export type FileValidator = (file: string) => boolean;

/**
 * Function to detect React components
 */
export type ComponentDetector = (code: string) => boolean;

/**
 * Pattern for detecting React components
 */
export type ReactPattern = RegExp;

/**
 * Transform function type
 */
export type TransformFunction = (
  code: string, 
  id: string, 
  options?: { ssr?: boolean }
) => Promise<TransformResult | null> | TransformResult | null;

declare global {
  interface Window {
    __QUICK_FIX_COMPONENTS__?: Map<string, ComponentInfo>;
  }
}
