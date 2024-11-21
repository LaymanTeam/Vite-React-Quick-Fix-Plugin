export interface ComponentInfo {
  id: string;
  sourcePath: string;
  fileName: string;
  timestamp: number;
}

export interface TrackerOptions {
  debug?: boolean;
  cleanupInterval?: number;
}
