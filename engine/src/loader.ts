import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Rule, GameState } from './types.js';
import { logError } from './utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// STATE CACHE - Reduces file I/O for repeated reads
// ═══════════════════════════════════════════════════════════════════════════

interface StateCache {
  state: GameState | null;
  timestamp: number;
  fileModTime: number;
}

const stateCache: StateCache = {
  state: null,
  timestamp: 0,
  fileModTime: 0
};

// Cache TTL in milliseconds (5 seconds default)
const CACHE_TTL_MS = 5000;

/**
 * Invalidate the state cache (call after writes)
 */
export function invalidateStateCache(): void {
  stateCache.state = null;
  stateCache.timestamp = 0;
}

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  if (!stateCache.state) return false;

  const now = Date.now();
  if (now - stateCache.timestamp > CACHE_TTL_MS) return false;

  // Also check if file was modified
  try {
    const stats = fs.statSync('../state.json');
    if (stats.mtimeMs > stateCache.fileModTime) return false;
  } catch {
    return false;
  }

  return true;
}

/**
 * Load all rules from the rules/ directory
 */
export function loadRules(): Rule[] {
  // Use parent directory since engine runs from engine/ subfolder
  const rulesDir = '../rules';
  const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  const rules: Rule[] = [];
  
  for (const file of ruleFiles) {
    const content = fs.readFileSync(`${rulesDir}/${file}`, 'utf8');
    const rule = yaml.load(content) as Rule;
    
    if (rule.enabled) {
      rules.push(rule);
    }
  }
  
  // Sort by priority (higher first)
  return rules.sort((a, b) => b.priority - a.priority);
}

/**
 * Validate state schema
 */
function validateState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Record<string, unknown>;

  // Check required top-level properties
  if (!s.board || typeof s.board !== 'object') {
    return false;
  }
  if (!s.players || typeof s.players !== 'object') {
    return false;
  }
  if (!s.karma || typeof s.karma !== 'object') {
    return false;
  }
  if (!s.levels || typeof s.levels !== 'object') {
    return false;
  }
  if (!s.rules || typeof s.rules !== 'object') {
    return false;
  }

  // Check karma structure
  const karma = s.karma as Record<string, unknown>;
  if (typeof karma.global !== 'number') {
    return false;
  }

  // Check levels structure
  const levels = s.levels as Record<string, unknown>;
  if (typeof levels.current !== 'number') {
    return false;
  }

  // Check rules structure
  const rules = s.rules as Record<string, unknown>;
  if (!Array.isArray(rules.active)) {
    return false;
  }

  return true;
}

/**
 * Load game state with validation and caching
 * @param bypassCache - Set to true to force a fresh read
 */
export function loadState(bypassCache: boolean = false): GameState {
  // Check cache first (unless bypass requested)
  if (!bypassCache && isCacheValid() && stateCache.state) {
    return stateCache.state;
  }

  try {
    const stats = fs.statSync('../state.json');
    const content = fs.readFileSync('../state.json', 'utf8');
    const parsed = JSON.parse(content);

    if (!validateState(parsed)) {
      logError('loadState', new Error('Invalid state.json schema'));
      throw new Error('Invalid state.json schema');
    }

    // Update cache
    stateCache.state = parsed;
    stateCache.timestamp = Date.now();
    stateCache.fileModTime = stats.mtimeMs;

    return parsed;
  } catch (e) {
    logError('loadState', e);
    throw e;
  }
}

/**
 * Save game state with validation and atomic write
 * Uses write-to-temp-then-rename pattern to prevent corruption
 */
export function saveState(state: GameState): void {
  const statePath = '../state.json';
  const tempPath = './state.json.tmp';

  try {
    if (!validateState(state)) {
      logError('saveState', new Error('Attempted to save invalid state'));
      throw new Error('Attempted to save invalid state');
    }

    const content = JSON.stringify(state, null, 2);

    // Write to temporary file first
    fs.writeFileSync(tempPath, content);

    // Validate the temp file is valid JSON before committing
    const verification = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
    if (!validateState(verification)) {
      fs.unlinkSync(tempPath);
      throw new Error('Verification failed: temp file contains invalid state');
    }

    // Atomic rename (prevents corruption if crash during write)
    fs.renameSync(tempPath, statePath);

    // Invalidate cache after successful write
    invalidateStateCache();
  } catch (e) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch { /* ignore cleanup errors */ }
    }
    logError('saveState', e);
    throw e;
  }
}
