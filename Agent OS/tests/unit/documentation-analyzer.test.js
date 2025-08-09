import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const Analyzer = require(path.resolve(__dirname, '../../tools/analysis/documentation-analyzer.cjs'));

describe('DocumentationAnalyzer', () => {
  it('finds markdown files and computes completeness', () => {
    const a = new Analyzer();
    const files = a.findMarkdownFiles();
    expect(Array.isArray(files)).toBe(true);
    const result = a.analyzeAllDocumentation();
    expect(result.summary).toBeDefined();
    expect(typeof result.summary.totalFiles).toBe('number');
  });
});


