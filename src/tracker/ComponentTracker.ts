import type { ComponentInfo } from './types';
import { injectTrackingCode } from '../injection/codeInjector';

export class ComponentTracker {
  private mountedComponents = new Map<string, ComponentInfo>();
  private disposables: (() => void)[] = [];
  constructor() {
  }

  injectTracking(code: string, id: string, editorProtocol: string): { code: string; map: null } {
    const componentInfo: ComponentInfo = {
      id: this.generateComponentId(id),
      sourcePath: id,
      fileName: id.split('/').pop() || '',
      timestamp: Date.now()
    };

    return {
      code: injectTrackingCode(code, componentInfo, editorProtocol),
      map: null
    };
  }

  refreshComponents(): void {
    if (typeof window !== 'undefined') {
      window.__QUICK_FIX_COMPONENTS__?.forEach((info) => {
        this.mountedComponents.set(info.id, info);
      });
    }
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
