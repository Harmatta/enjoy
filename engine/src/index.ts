#!/usr/bin/env node
import * as fs from 'fs';
import minimist from 'minimist';
import { loadRules } from './loader.js';
import { parsePR } from './parser.js';
import { validatePR } from './validator.js';
import { executeContribution, ExecutorContext } from './executor.js';

const args = minimist(process.argv.slice(2));
const command = args._[0];

if (command === 'validate') {
  // Validate a PR
  const prNumber = parseInt(args['pr-number'] || '1');

  console.log(`🔍 Validating PR #${prNumber}...`);

  const rules = loadRules();
  console.log(`📋 Loaded ${rules.length} active rule(s)`);

  const pr = parsePR(prNumber);
  console.log(`📁 Files added: ${pr.files_added.join(', ') || 'none'}`);

  const result = validatePR(rules, pr);

  // Write result to file for GitHub Actions
  fs.writeFileSync('validation-result.json', JSON.stringify(result, null, 2));

  if (result.valid) {
    console.log(`✅ VALID! Matched rule(s): ${result.matched_rules.join(', ')}`);
    console.log(`   Points: +${result.points}`);
    process.exit(0);
  } else {
    console.log(`❌ INVALID: ${result.reason}`);
    process.exit(1);
  }

} else if (command === 'apply') {
  // Apply effect (Contribution Execution)
  // We use environment variables for rich context that CLI args might be too simple for

  const ctx: ExecutorContext = {
    prNumber: parseInt(process.env.PR_NUMBER || '0') || parseInt(args['pr-number'] || '0'),
    author: process.env.PR_AUTHOR || 'unknown',
    prTitle: process.env.PR_TITLE || '',
    prLabels: (process.env.PR_LABELS || '').split(',').map(l => l.trim()).filter(Boolean),
    word: process.env.PR_WORD || undefined,
    isMerge: true,
    baseKarma: 10
  };

  if (!ctx.prNumber || ctx.author === 'unknown') {
    console.error('❌ Missing PR_NUMBER or PR_AUTHOR env vars');
    process.exit(1);
  }

  try {
    executeContribution(ctx);
    console.log('✅ Contribution applied successfully');
  } catch (e) {
    console.error('❌ Failed to apply contribution:', e);
    process.exit(1);
  }

} else {
  console.log('Usage:');
  console.log('  validate --pr-number=123');
  console.log('  apply --pr-number=123');
  process.exit(1);
}
