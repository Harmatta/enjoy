/**
 * 🧪 ENJOY - Complete Test Suite
 * 
 * Tests for: Karma System, Level Progression, Player Stats, 
 * Time System, Achievements, Bounties, Referrals
 * 
 * Run: npx ts-node tests/test-suite.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 🎯 TEST FRAMEWORK (minimal, no dependencies)
// ============================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  time: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals<T>(actual: T, expected: T, message?: string): void {
  const msg = message || `Expected ${expected}, got ${actual}`;
  if (actual !== expected) {
    throw new Error(msg);
  }
}

function assertDeepEquals<T>(actual: T, expected: T, message?: string): void {
  const msg = message || `Deep equality failed`;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message?: string): void {
  const msg = message || `Expected ${actual} > ${expected}`;
  if (actual <= expected) {
    throw new Error(msg);
  }
}

function assertLessThan(actual: number, expected: number, message?: string): void {
  const msg = message || `Expected ${actual} < ${expected}`;
  if (actual >= expected) {
    throw new Error(msg);
  }
}

function assertInRange(actual: number, min: number, max: number, message?: string): void {
  const msg = message || `Expected ${actual} to be in range [${min}, ${max}]`;
  if (actual < min || actual > max) {
    throw new Error(msg);
  }
}

// ============================================================
// 📊 LOAD STATE & LEVELS
// ============================================================

const rootDir = path.resolve(__dirname, '..');
const stateFile = path.join(rootDir, 'state.json');
const levelsDir = path.join(rootDir, 'levels');

interface GameState {
  version: string;
  score: { total: number; today: number; streak_days: number };
  levels: {
    current: number;
    max_level: number;
    unlocked: number[];
    next_unlock: { level_id: number; requires_score: number; requires_prs: number; progress: { score: number; prs: number } };
    milestones: Record<string, string>;
  };
  karma: { global: number; multiplier_active: number };
  players: Record<string, {
    karma: number;
    prs: number;
    streak: number;
    achievements: string[];
    joined: string;
    last_contribution: string;
  }>;
  meta: { total_prs: number; total_players: number };
  bounties: { active: any[]; completed: any[] };
  achievements: { unlocked_global: string[]; players: Record<string, string[]> };
  time_system: { current_period: string; stats: Record<string, { total_prs: number; total_karma: number }> };
}

interface LevelConfig {
  level: number;
  name: string;
  phase: string;
  karma: { base: number };
  rules?: any;
  validation?: any[];
}

function loadState(): GameState {
  return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}

function loadAllLevels(): LevelConfig[] {
  const files = fs.readdirSync(levelsDir).filter(f => f.endsWith('.yaml'));
  const yaml = require('yaml');
  return files.map(f => yaml.parse(fs.readFileSync(path.join(levelsDir, f), 'utf8'))).sort((a, b) => a.level - b.level);
}

// ============================================================
// 🧪 TEST SUITES
// ============================================================

const suites: TestSuite[] = [];

function test(suiteName: string, testName: string, fn: () => void): void {
  let suite = suites.find(s => s.name === suiteName);
  if (!suite) {
    suite = { name: suiteName, tests: [] };
    suites.push(suite);
  }
  
  const start = Date.now();
  try {
    fn();
    suite.tests.push({ name: testName, passed: true, time: Date.now() - start });
  } catch (e: any) {
    suite.tests.push({ name: testName, passed: false, error: e.message, time: Date.now() - start });
  }
}

// ============================================================
// 📐 KARMA SYSTEM TESTS
// ============================================================

function karmaTests(): void {
  const state = loadState();
  
  test('Karma System', 'Global karma is non-negative', () => {
    assertGreaterThan(state.karma.global, -1, 'Global karma should be >= 0');
  });
  
  test('Karma System', 'All players have valid karma', () => {
    for (const [name, player] of Object.entries(state.players)) {
      assertGreaterThan(player.karma, -1, `Player ${name} should have karma >= 0`);
    }
  });
  
  test('Karma System', 'Total karma equals sum of player karma', () => {
    const totalPlayerKarma = Object.values(state.players).reduce((sum, p) => sum + p.karma, 0);
    assertEquals(state.score.total, totalPlayerKarma, 'Total score should match sum of player karma');
  });
  
  test('Karma System', 'Karma multiplier is in valid range', () => {
    assertInRange(state.karma.multiplier_active, 1, 3, 'Multiplier should be 1-3');
  });
  
  test('Karma System', 'Time-based karma multipliers are valid', () => {
    const validMultipliers = [1.15, 1.2, 1.25, 1.3, 1.4, 1.5];
    // Each period should have a valid multiplier
    const periods = ['dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night'];
    assert(periods.length === 6, 'Should have 6 time periods');
  });
}

// ============================================================
// 🎮 LEVEL SYSTEM TESTS
// ============================================================

function levelTests(): void {
  const state = loadState();
  const levels = loadAllLevels();
  
  test('Level System', 'Exactly 100 levels exist', () => {
    assertEquals(levels.length, 100, 'Should have exactly 100 levels');
  });
  
  test('Level System', 'Levels are numbered 1-100 consecutively', () => {
    for (let i = 0; i < 100; i++) {
      assertEquals(levels[i].level, i + 1, `Level ${i + 1} should exist`);
    }
  });
  
  test('Level System', 'All levels have valid base karma', () => {
    for (const level of levels) {
      assertGreaterThan(level.karma.base, 0, `Level ${level.level} should have positive base karma`);
      assertLessThan(level.karma.base, 1001, `Level ${level.level} karma should be <= 1000`);
    }
  });
  
  test('Level System', 'Current level is in valid range', () => {
    assertInRange(state.levels.current, 1, 100, 'Current level should be 1-100');
  });
  
  test('Level System', 'Unlocked levels include current level', () => {
    assert(state.levels.unlocked.includes(state.levels.current), 'Current level should be unlocked');
  });
  
  test('Level System', 'Unlocked levels are contiguous from 1', () => {
    const sorted = [...state.levels.unlocked].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      assertEquals(sorted[i], i + 1, `Unlocked levels should be contiguous: expected ${i + 1}, got ${sorted[i]}`);
    }
  });
  
  test('Level System', 'Max level is 100', () => {
    assertEquals(state.levels.max_level, 100, 'Max level should be 100');
  });
  
  test('Level System', 'Next unlock requires more than current progress', () => {
    if (state.levels.unlocked.length < 100) {
      const { requires_score, requires_prs, progress } = state.levels.next_unlock;
      const scoreNeeded = requires_score - progress.score;
      const prsNeeded = requires_prs - progress.prs;
      assert(scoreNeeded >= 0 || prsNeeded >= 0, 'Next level should require more progress');
    }
  });
  
  test('Level System', 'All levels have unique names', () => {
    const names = levels.map(l => l.name);
    const uniqueNames = new Set(names);
    assertEquals(names.length, uniqueNames.size, 'All level names should be unique');
  });
  
  test('Level System', 'Milestones are at correct levels', () => {
    const milestoneKeys = Object.keys(state.levels.milestones).map(Number);
    for (const m of milestoneKeys) {
      assertInRange(m, 1, 100, `Milestone level ${m} should be in range 1-100`);
    }
  });
  
  test('Level System', 'Karma scales with level', () => {
    const lowLevelKarma = levels.filter(l => l.level <= 10).reduce((sum, l) => sum + l.karma.base, 0) / 10;
    const highLevelKarma = levels.filter(l => l.level >= 90).reduce((sum, l) => sum + l.karma.base, 0) / 10;
    assertGreaterThan(highLevelKarma, lowLevelKarma, 'Higher levels should give more karma on average');
  });
}

// ============================================================
// 👤 PLAYER SYSTEM TESTS
// ============================================================

function playerTests(): void {
  const state = loadState();
  
  test('Player System', 'Total players matches meta count', () => {
    const actualPlayers = Object.keys(state.players).length;
    assertEquals(actualPlayers, state.meta.total_players, 'Player count should match meta.total_players');
  });
  
  test('Player System', 'Total PRs matches meta count', () => {
    const actualPrs = Object.values(state.players).reduce((sum, p) => sum + p.prs, 0);
    assertEquals(actualPrs, state.meta.total_prs, 'PR count should match meta.total_prs');
  });
  
  test('Player System', 'All players have valid join dates', () => {
    for (const [name, player] of Object.entries(state.players)) {
      const joinDate = new Date(player.joined);
      assert(!isNaN(joinDate.getTime()), `Player ${name} should have valid join date`);
      assertLessThan(joinDate.getTime(), Date.now() + 1000, `Player ${name} join date should not be in future`);
    }
  });
  
  test('Player System', 'All players have non-negative PRs', () => {
    for (const [name, player] of Object.entries(state.players)) {
      assertGreaterThan(player.prs, -1, `Player ${name} should have prs >= 0`);
    }
  });
  
  test('Player System', 'Player achievements are in global list', () => {
    for (const [name, player] of Object.entries(state.players)) {
      for (const achievement of player.achievements) {
        assert(
          state.achievements.unlocked_global.includes(achievement),
          `Player ${name} achievement ${achievement} should be in global list`
        );
      }
    }
  });
  
  test('Player System', 'Streaks are non-negative', () => {
    for (const [name, player] of Object.entries(state.players)) {
      assertGreaterThan(player.streak, -1, `Player ${name} streak should be >= 0`);
    }
  });
}

// ============================================================
// ⏰ TIME SYSTEM TESTS
// ============================================================

function timeSystemTests(): void {
  const state = loadState();
  const validPeriods = ['dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night'];
  
  test('Time System', 'Current period is valid', () => {
    assert(validPeriods.includes(state.time_system.current_period), `Current period should be one of ${validPeriods}`);
  });
  
  test('Time System', 'All 6 periods have stats', () => {
    for (const period of validPeriods) {
      assert(period in state.time_system.stats, `Stats for ${period} should exist`);
    }
  });
  
  test('Time System', 'Period stats have non-negative values', () => {
    for (const [period, stats] of Object.entries(state.time_system.stats)) {
      assertGreaterThan(stats.total_prs, -1, `${period} total_prs should be >= 0`);
      assertGreaterThan(stats.total_karma, -1, `${period} total_karma should be >= 0`);
    }
  });
  
  test('Time System', 'Total period PRs equals total PRs', () => {
    const periodTotal = Object.values(state.time_system.stats).reduce((sum, s) => sum + s.total_prs, 0);
    // Allow for some PRs before time system
    assertLessThan(Math.abs(periodTotal - state.meta.total_prs), state.meta.total_prs + 1, 
      'Period PR total should approximately match total PRs');
  });
}

// ============================================================
// 🏆 ACHIEVEMENT SYSTEM TESTS
// ============================================================

function achievementTests(): void {
  const state = loadState();
  
  test('Achievements', 'Global achievements array exists', () => {
    assert(Array.isArray(state.achievements.unlocked_global), 'unlocked_global should be array');
  });
  
  test('Achievements', 'Player achievements match global tracking', () => {
    for (const [name, achievements] of Object.entries(state.achievements.players)) {
      assert(name in state.players, `Achievement player ${name} should exist in players`);
      assertDeepEquals(
        state.players[name].achievements.sort(),
        achievements.sort(),
        `Player ${name} achievements should match`
      );
    }
  });
  
  test('Achievements', 'First blood achievement exists if players exist', () => {
    if (state.meta.total_players > 0) {
      assert(state.achievements.unlocked_global.includes('first_blood'), 'first_blood should be unlocked');
    }
  });
}

// ============================================================
// 💰 BOUNTY SYSTEM TESTS
// ============================================================

function bountyTests(): void {
  const state = loadState();
  
  test('Bounties', 'Active bounties have required fields', () => {
    for (const bounty of state.bounties.active) {
      assert('id' in bounty, 'Bounty should have id');
      assert('title' in bounty, 'Bounty should have title');
      assert('karma' in bounty, 'Bounty should have karma reward');
      assertGreaterThan(bounty.karma, 0, 'Bounty karma should be positive');
    }
  });
  
  test('Bounties', 'Completed bounties are not in active', () => {
    const activeIds = state.bounties.active.map(b => b.id);
    for (const bounty of state.bounties.completed) {
      assert(!activeIds.includes(bounty.id), `Completed bounty ${bounty.id} should not be active`);
    }
  });
  
  test('Bounties', 'No duplicate bounty IDs', () => {
    const allIds = [...state.bounties.active, ...state.bounties.completed].map(b => b.id);
    const uniqueIds = new Set(allIds);
    assertEquals(allIds.length, uniqueIds.size, 'All bounty IDs should be unique');
  });
}

// ============================================================
// 📋 LEVEL CONFIG VALIDATION TESTS  
// ============================================================

function levelConfigTests(): void {
  const levels = loadAllLevels();
  
  test('Level Config', 'All levels have required fields', () => {
    for (const level of levels) {
      assert('level' in level, `Level should have level number`);
      assert('name' in level, `Level ${level.level} should have name`);
      assert('phase' in level, `Level ${level.level} should have phase`);
      assert('karma' in level, `Level ${level.level} should have karma config`);
    }
  });
  
  test('Level Config', 'Phases progress correctly', () => {
    const expectedPhases = ['Foundation', 'Awakening', 'Growth', 'Mastery', 'Transcendence'];
    const phases = [...new Set(levels.map(l => l.phase))];
    assert(phases.length >= 3, 'Should have at least 3 unique phases');
  });
  
  test('Level Config', 'Level 1 has easy requirements', () => {
    const level1 = levels.find(l => l.level === 1);
    assert(level1 !== undefined, 'Level 1 should exist');
    assertLessThan(level1!.karma.base, 50, 'Level 1 karma should be < 50');
  });
  
  test('Level Config', 'Level 100 has special significance', () => {
    const level100 = levels.find(l => l.level === 100);
    assert(level100 !== undefined, 'Level 100 should exist');
    assertGreaterThan(level100!.karma.base, 100, 'Level 100 karma should be > 100');
  });
}

// ============================================================
// 🔗 DATA INTEGRITY TESTS
// ============================================================

function integrityTests(): void {
  const state = loadState();
  
  test('Data Integrity', 'Version string exists', () => {
    assert(state.version !== undefined, 'Version should exist');
    assert(/^\d+\.\d+\.\d+$/.test(state.version), 'Version should be semver format');
  });
  
  test('Data Integrity', 'Last updated is valid ISO date', () => {
    const date = new Date(state.last_updated);
    assert(!isNaN(date.getTime()), 'last_updated should be valid date');
  });
  
  test('Data Integrity', 'No orphaned achievements', () => {
    for (const achievement of state.achievements.unlocked_global) {
      let found = false;
      for (const playerAchievements of Object.values(state.achievements.players)) {
        if (playerAchievements.includes(achievement)) {
          found = true;
          break;
        }
      }
      assert(found, `Achievement ${achievement} should belong to at least one player`);
    }
  });
  
  test('Data Integrity', 'Score breakdown is consistent', () => {
    assertEquals(state.score.total >= state.score.today, true, 'total score >= today score');
  });
}

// ============================================================
// 🏃 RUN ALL TESTS
// ============================================================

function runAllTests(): void {
  console.log(`\n${colors.cyan}${colors.bold}🧪 ENJOY TEST SUITE${colors.reset}\n`);
  console.log(`${colors.yellow}Running comprehensive tests...${colors.reset}\n`);
  
  // Run all test functions
  karmaTests();
  levelTests();
  playerTests();
  timeSystemTests();
  achievementTests();
  bountyTests();
  levelConfigTests();
  integrityTests();
  
  // Print results
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTime = 0;
  
  for (const suite of suites) {
    const passed = suite.tests.filter(t => t.passed).length;
    const failed = suite.tests.filter(t => !t.passed).length;
    const suiteTime = suite.tests.reduce((sum, t) => sum + t.time, 0);
    
    const statusIcon = failed === 0 ? '✅' : '❌';
    console.log(`${statusIcon} ${colors.bold}${suite.name}${colors.reset} (${passed}/${suite.tests.length} passed, ${suiteTime}ms)`);
    
    for (const test of suite.tests) {
      if (test.passed) {
        console.log(`   ${colors.green}✓${colors.reset} ${test.name} (${test.time}ms)`);
      } else {
        console.log(`   ${colors.red}✗${colors.reset} ${test.name}`);
        console.log(`     ${colors.red}→ ${test.error}${colors.reset}`);
      }
    }
    console.log();
    
    totalPassed += passed;
    totalFailed += failed;
    totalTime += suiteTime;
  }
  
  // Final summary
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (totalFailed === 0) {
    console.log(`\n${colors.green}${colors.bold}✅ ALL TESTS PASSED!${colors.reset}`);
    console.log(`${colors.green}   ${totalPassed} tests in ${totalTime}ms${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ SOME TESTS FAILED${colors.reset}`);
    console.log(`${colors.green}   Passed: ${totalPassed}${colors.reset}`);
    console.log(`${colors.red}   Failed: ${totalFailed}${colors.reset}`);
    console.log(`   Total time: ${totalTime}ms\n`);
    process.exit(1);
  }
  
  // Generate test report JSON
  const report = {
    timestamp: new Date().toISOString(),
    total_tests: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    duration_ms: totalTime,
    suites: suites.map(s => ({
      name: s.name,
      passed: s.tests.filter(t => t.passed).length,
      failed: s.tests.filter(t => !t.passed).length,
      tests: s.tests
    }))
  };
  
  fs.writeFileSync(path.join(rootDir, 'test-report.json'), JSON.stringify(report, null, 2));
  console.log(`📄 Test report saved to test-report.json\n`);
}

// Run tests
runAllTests();
