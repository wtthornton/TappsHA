import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const Analyzer = require(path.resolve(__dirname, '../../tools/analysis/documentation-analyzer.cjs'));

// moved to .agent-os/tests/unit/documentation-analyzer.test.js
export {};


