import { SourceMapGenerator } from 'source-map';

export function generateSourceMap(
  originalCode: string,
  transformedCode: string,
  filename: string
): string {
  const generator = new SourceMapGenerator({
    file: filename,
    sourceRoot: ''
  });

  const originalLines = originalCode.split('\n');
  
  // Basic mapping - maps each line to corresponding line
  originalLines.forEach((_, index) => {
    generator.addMapping({
      source: filename,
      original: { line: index + 1, column: 0 },
      generated: { line: index + 1, column: 0 }
    });
  });

  generator.setSourceContent(filename, originalCode);
  
  return generator.toString();
}
