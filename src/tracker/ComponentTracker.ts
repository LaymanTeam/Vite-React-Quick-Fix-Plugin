import type { SourceMap } from 'rollup';
import type { ComponentInfo } from './types';
import { injectTrackingCode } from '../injection/codeInjector';
import { generateSourceMap } from '../utils/sourceMapGenerator';

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
      mappings: generateSourceMap(code, injectedCode, id),
      file: id,
      sourcesContent: [code],
      toString() {
        return JSON.stringify(this);
      },
      toUrl() {
        return 'data:application/json;charset=utf-8;base64,' + 
               Buffer.from(this.toString()).toString('base64');
      }
    } as SourceMap : null;

    return { code: injectedCode, map };
  }

  private generateComponentId(sourcePath: string): string {
    return `${sourcePath}-${Date.now()}`;
  }

  dispose(): void {
    // This method exists for cleanup purposes but currently has no implementation
    // as our tracking is file-based rather than runtime-based
  }

  refreshComponents(): void {
    // This method exists for HMR updates but currently has no implementation
    // as our tracking is file-based rather than runtime-based
  }
}
