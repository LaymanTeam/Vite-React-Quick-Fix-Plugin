import type { ComponentInfo } from '../tracker/types';

/**
 * Creates a React element string representation of an editor button
 * @param componentInfo Information about the component to open
 * @param editorProtocol The editor protocol URL (e.g. 'vscode://file')
 * @returns A string containing the React createElement call for the button
 */
export function createEditorButton(
  componentInfo: ComponentInfo,
  editorProtocol: string
): string {
  const editorUrl = `${editorProtocol}/${encodeURIComponent(componentInfo.sourcePath)}`;
  
  return `
    createElement('button', {
      onClick: (e) => {
        if (e.altKey || e.metaKey) {  // Support both Alt and Cmd/Ctrl
          e.preventDefault();
          e.stopPropagation();
          window.open('${editorUrl}', '_blank');
        }
      },
      'data-quick-fix-button': true,
      style: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        opacity: '0',
        visibility: 'hidden',
        zIndex: '9999',
        padding: '4px 8px',
        backgroundColor: '#007ACC',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        userSelect: 'none',
        pointerEvents: 'auto'
      },
      'data-source-file': '${componentInfo.sourcePath}',
      'data-component-id': '${componentInfo.id}'
    }, 'Open ${componentInfo.fileName.replace(/['"\\]/g, '\\$&')}')
  `;
}
