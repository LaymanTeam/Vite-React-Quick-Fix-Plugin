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
  if (!code.includes('return')) {
    return code;
  }

  const returnStatementRegex = /return\s*\(\s*(?:<|\w+\.createElement)/g;
  
  if (!returnStatementRegex.test(code)) {
    return code;
  }

  returnStatementRegex.lastIndex = 0;

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

  modifiedCode = `
    import { createElement, Fragment } from 'react';
    ${modifiedCode}
  `;

  return modifiedCode;
}
