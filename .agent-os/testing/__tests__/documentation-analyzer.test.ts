import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
// Use CJS require path from test root .agent-os
// eslint-disable-next-line @typescript-eslint/no-var-requires
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Analyzer = require(path.resolve(__dirname, '../../tools/analysis/documentation-analyzer.js'));

// Converted to JS version to avoid ESM interop issues; see documentation-analyzer.test.js
export {};


