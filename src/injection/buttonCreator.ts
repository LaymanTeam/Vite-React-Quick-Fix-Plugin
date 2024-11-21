import type { ComponentInfo } from '../tracker/types';

export function createEditorButton(componentInfo: ComponentInfo, editorProtocol: string = 'vscode://file'): string {
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
        display: 'none',
        zIndex: 9999,
        padding: '4px 8px',
        backgroundColor: '#007ACC',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
      },
      'data-source-file': '${componentInfo.sourcePath}',
      'data-component-id': '${componentInfo.id}'
    }, 'Open ${componentInfo.fileName}')
  `;
}
