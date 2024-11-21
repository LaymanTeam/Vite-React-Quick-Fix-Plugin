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
        if (e.altKey) {
          e.preventDefault();
          window.open('${editorUrl}', '_blank');
        }
      },
      style: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        opacity: 0,
        visibility: 'hidden',
        zIndex: 9999,
        padding: '4px 8px',
        backgroundColor: '#007ACC',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'opacity 0.2s, visibility 0.2s',
        ':hover': {
          backgroundColor: '#005999'
        }
      },
      onMouseOver: (e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.visibility = 'visible';
      },
      onMouseOut: (e) => {
        e.currentTarget.style.opacity = '0';
        e.currentTarget.style.visibility = 'hidden';
      },
      'data-source-file': '${componentInfo.sourcePath}',
      'data-component-id': '${componentInfo.id}'
    }, 'Open ${componentInfo.fileName.replace(/['"\\]/g, '\\$&')}')
  `;
}
