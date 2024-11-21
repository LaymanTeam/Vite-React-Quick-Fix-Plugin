import type { ComponentInfo } from '../tracker/types';
import { createEditorButton } from './buttonCreator';

/**
 * Injects tracking code around component return statements
 */
export function injectTrackingCode(
  code: string,
  componentInfo: ComponentInfo,
  editorProtocol: string
): string {
  // Only process files that look like components
  if (!code.includes('return')) {
    return code;
  }

  // Match return statements that use JSX or createElement
  const returnStatementRegex = /return\s*\(\s*(?:<|\w+\.createElement)/g;
  
  if (!returnStatementRegex.test(code)) {
    return code;
  }

  // Reset regex lastIndex
  returnStatementRegex.lastIndex = 0;

  // Replace each return statement with wrapped version using createElement
  let modifiedCode = code.replace(returnStatementRegex, (match) => {
    return `return createElement(
      'div',
      { 
        style: { position: 'relative' },
        'data-quick-fix-container': true,
        'data-source-path': '${componentInfo.sourcePath}'
      },
      [
        ${match.substring(6)},
        ${createEditorButton(componentInfo, editorProtocol)}
      ]
    )`;
  });

  // Add necessary imports at the start
  modifiedCode = `
    import { createElement, Fragment } from 'react';
    ${modifiedCode}
  `;

  return modifiedCode;
}
import type { ComponentInfo } from '../tracker/types';
import { createEditorButton } from './buttonCreator';

/**
 * Injects tracking code around component return statements
 */
export function injectTrackingCode(
  code: string, 
  componentInfo: ComponentInfo, 
  editorProtocol: string
): string {
  // Match return statements in components
  const returnStatementRegex = /return\s*\(\s*(?:<|\w+\.createElement)/g;
  
  // Create the wrapper code
  const wrapperStart = `
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
  `;

  const wrapperEnd = `,
            ${createEditorButton(componentInfo, editorProtocol)}
          ]
        );
      };
    };
  `;

  // Only inject if we find a component return statement
  if (returnStatementRegex.test(code)) {
    // Reset regex lastIndex
    returnStatementRegex.lastIndex = 0;
    
    // Replace each return statement with wrapped version
    let modifiedCode = code.replace(returnStatementRegex, (match) => {
      return `return __withTracking((props) => ${match})(props)`;
    });

    // Add necessary imports and wrapper function
    modifiedCode = `
      import { createElement, Fragment, useEffect } from 'react';
      ${modifiedCode}
    `;

    return modifiedCode;
  }

  // Return original code if no component return statement found
  return code;
}
