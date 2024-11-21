import type { ComponentInfo } from './types';
import { injectTrackingCode } from '../injection/codeInjector';

export class ComponentTracker {
  injectTracking(code: string, id: string, editorProtocol: string): { code: string; map: SourceMap | null } {
    const componentInfo: ComponentInfo = {
      id: this.generateComponentId(id),
      sourcePath: id,
      fileName: id.split('/').pop() || '',
      timestamp: Date.now()
    };

    const injectedCode = injectTrackingCode(code, componentInfo, editorProtocol);

    const map = code !== injectedCode ? {
      version: 3,
      sources: [id],
      names: [],
      mappings: '', // Would need proper sourcemap generation
      file: id,
      sourcesContent: [code]
    } : null;

    return { code: injectedCode, map };
  }

  private generateComponentId(sourcePath: string): string {
    return `${sourcePath}-${Date.now()}`;
  }

  dispose(): void {} // Cleanup if needed
}
