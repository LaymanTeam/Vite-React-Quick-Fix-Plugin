import vitePluginReactComponentOpener from '../src/vite-react-quick-fix-plugin';
import { Plugin } from 'vite';
import type { TransformPluginContext } from 'rollup';
import type { TransformResult } from '../src/types';

describe('vite-react-quick-fix-plugin', () => {
  let plugin: Plugin;
  let transform: (code: string, id: string) => TransformResult | null;

  beforeEach(() => {
    plugin = vitePluginReactComponentOpener();
    if (!plugin.transform || typeof plugin.transform !== 'function') {
      throw new Error('transform is not a function');
    }
    transform = plugin.transform.bind({ ...plugin } as unknown as TransformPluginContext);
  });

  it('should create plugin with default options', () => {
    expect(plugin.name).toBe('vite-plugin-react-component-opener');
    expect(plugin.apply).toBe('serve');
  });

  it('should accept custom options', () => {
    const customPlugin = vitePluginReactComponentOpener({
      editor: 'webstorm://open',
      baseFilePath: '/custom/path'
    });
    expect(customPlugin.name).toBe('vite-plugin-react-component-opener');
  });

  describe('transform', () => {

    it('should skip non-react files', () => {
      const result = transform(
        'console.log("hello")', 
        'test.js'
      );
      expect(result).toBeNull();
    });

    it('should skip production mode', () => {
      // Mock import.meta.env.DEV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const result = transform(
        'import React from "react";\nexport default () => <div>Hello</div>;', 
        'Component.tsx'
      );
      
      expect(result).toBeNull();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should transform valid React component files', () => {
      const code = `
        import React from 'react';
        export default function TestComponent() {
          return <div>Test</div>;
        }
      `;

      const result = transform(code, 'TestComponent.tsx');
      
      expect(result).not.toBeNull();
      const transformResult = result as TransformResult;
      expect(transformResult.code).toContain('OpenInEditorButton');
      expect(transformResult.code).toContain('TestComponent.tsx');
      expect(transformResult.code).toContain('vscode://file');
    });

    it('should handle different export types', () => {
      const defaultExport = `
        import React from 'react';
        export default function Test() {
          return <div>Test</div>;
        }
      `;

      const namedExport = `
        import React from 'react';
        export const Test = () => <div>Test</div>;
      `;

      const defaultResult = transform(defaultExport, 'Test.tsx');
      const namedResult = transform(namedExport, 'Test.tsx');

      expect(defaultResult).not.toBeNull();
      expect(namedResult).not.toBeNull();
    });

    it('should handle invalid files gracefully', () => {
      const result = transform(
        'this is not valid javascript', 
        'invalid.tsx'
      );
      expect(result).toBeNull();
    });
  });

  describe('isReactComponent detection', () => {
    if (!plugin.transform || typeof plugin.transform !== 'function') {
      throw new Error('transform is not a function');
    }
    const transform = plugin.transform;

    it('should detect React import', () => {
      const code = `
        import React from 'react';
        export const Test = () => <div>Test</div>;
      `;
      const boundTransform = transform.bind({ ...plugin } as unknown as TransformPluginContext);
      expect(boundTransform(code, 'test.tsx')).not.toBeNull();
    });

    it('should detect JSX syntax', () => {
      const code = `
        export const Test = () => <div>Test</div>;
      `;
      const boundTransform = transform.bind({ ...plugin } as unknown as TransformPluginContext);
      expect(boundTransform(code, 'test.tsx')).not.toBeNull();
    });

    it('should detect React.createElement', () => {
      const code = `
        export const Test = () => React.createElement('div', null, 'Test');
      `;
      const boundTransform = transform.bind({ ...plugin } as unknown as TransformPluginContext);
      expect(boundTransform(code, 'test.tsx')).not.toBeNull();
    });
  });
});
