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

  const returnStatementRegex = /return\s*(?:\(\s*)?(?:<[\w\s/>]|React\.createElement|createElement)/g;
  
  if (!returnStatementRegex.test(code)) {
    return code;
  }

  returnStatementRegex.lastIndex = 0;

  let modifiedCode = code.replace(returnStatementRegex, (match) => {
    return `return (
      createElement(
        'div',
        { 
          style: { 
            position: 'relative',
            display: 'inline-block',
            width: '100%',
            height: '100%'
          },
          'data-quick-fix-container': true,
          'data-source-path': '${componentInfo.sourcePath}',
          onMouseEnter: (e) => {
            const btn = e.currentTarget.querySelector('[data-quick-fix-button]');
            if (btn) {
              btn.style.opacity = '1';
              btn.style.visibility = 'visible';
            }
          },
          onMouseLeave: (e) => {
            const btn = e.currentTarget.querySelector('[data-quick-fix-button]');
            if (btn) {
              btn.style.opacity = '0';
              btn.style.visibility = 'hidden';
            }
          }
        },
        [
          ${match.includes('return (') ? match.substring(8) : match.substring(6)},
          ${createEditorButton(componentInfo, editorProtocol)}
        ]
      )
    )`;
  });

  if (!modifiedCode.includes('import { createElement }')) {
    modifiedCode = `
      import { createElement } from 'react';
      ${modifiedCode}
    `;
  }

  return modifiedCode;
}
