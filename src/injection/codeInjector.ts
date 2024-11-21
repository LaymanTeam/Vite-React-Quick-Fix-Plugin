import type { ComponentInfo } from '../tracker/types';
import { createEditorButton } from './buttonCreator';

const componentCache = new WeakMap<string, string>();

export function injectTrackingCode(
  code: string,
  componentInfo: ComponentInfo,
  editorProtocol: string
): string {
  const cacheKey = `${code}-${componentInfo.id}-${editorProtocol}`;
  const cached = componentCache.get(cacheKey);
  if (cached) return cached;

  const buttonCode = createEditorButton(componentInfo, editorProtocol);
  
  const result = `
    import { createElement, Fragment, useEffect } from 'react';
    
    // Original code
    ${code}

    // Inject tracking wrapper
    const __withTracking = (WrappedComponent) => {
      return (props) => {
        useEffect(() => {
          window.__QUICK_FIX_COMPONENTS__ = window.__QUICK_FIX_COMPONENTS__ || new Map();
          window.__QUICK_FIX_COMPONENTS__.set('${componentInfo.id}', ${JSON.stringify(componentInfo)});
          return () => {
            window.__QUICK_FIX_COMPONENTS__.delete('${componentInfo.id}');
          };
        }, []);

        return createElement(
          'div',
          { 
            style: { position: 'relative' },
            'data-quick-fix-container': true
          },
          [
            createElement(WrappedComponent, props),
            ${buttonCode}
          ]
        );
      };
    };
  `;

  componentCache.set(cacheKey, result);
  return result;
}
