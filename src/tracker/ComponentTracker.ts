import type { ComponentInfo } from './types';

export class ComponentTracker {
  private mountedComponents = new Map<string, ComponentInfo>();
  private disposables: (() => void)[] = [];

  injectTracking(code: string, id: string): { code: string; map: null } {
    const componentInfo: ComponentInfo = {
      id: this.generateComponentId(id),
      sourcePath: id,
      fileName: id.split('/').pop() || '',
      timestamp: Date.now()
    };

    // Store component info
    this.mountedComponents.set(componentInfo.id, componentInfo);

    // Inject tracking code
    const injectedCode = `
      import { createElement, useEffect } from 'react';
      
      const __trackComponent = (componentInfo) => {
        window.__QUICK_FIX_COMPONENTS__ = window.__QUICK_FIX_COMPONENTS__ || new Map();
        window.__QUICK_FIX_COMPONENTS__.set(componentInfo.id, componentInfo);
      };

      ${code}
    `;

    return {
      code: injectedCode,
      map: null
    };
  }

  getSourceInfo(componentId: string): ComponentInfo | undefined {
    return this.mountedComponents.get(componentId);
  }

  dispose(): void {
    this.mountedComponents.clear();
    this.disposables.forEach(dispose => dispose());
    this.disposables = [];
  }

  private generateComponentId(sourcePath: string): string {
    return `${sourcePath}-${Date.now()}`;
  }
}
