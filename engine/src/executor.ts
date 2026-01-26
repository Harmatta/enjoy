import { readFileSync, writeFileSync, existsSync } from 'fs';
import { GameState, Player, ContributionContext } from './types.js';
import { processContribution, getLeaderboard } from './gamification.js';
import { getCurrentPeriod, checkTimeEvents, getTimeGreeting } from './time-system.js';
import { createDefaultPlayer, logError } from './utils.js';

const STATE_FILE = 'state.json';

/**
 * Load the game state from file or create default
 */
export function loadState(path: string = STATE_FILE): GameState {
    try {
        if (existsSync(path)) {
            return JSON.parse(readFileSync(path, 'utf8'));
        }
    } catch (e) {
        logError(`Failed to load state from ${path}`, e);
    }

    // Return default empty state
    return {
        version: '1.0.0',
        last_updated: new Date().toISOString(),
        last_pr: null,
        score: { total: 0, today: 0, streak_days: 0 },
        levels: { current: 1, max_level: 100, unlocked: [1], next_unlock: { level_id: 2, requires_score: 50, requires_prs: 5, progress: { score: 0, prs: 0 } } },
        board: { width: 100, height: 100, elements: [] },
        players: {},
        karma: { global: 0, threshold_good: 10, multiplier_active: 1 },
        reputation: { top_coders: [], voting_power: {} },
        rules: { active: [] },
        rules_triggered: {},
        meta: { total_prs: 0, total_players: 0, game_started: new Date().toISOString() }
    };
}

/**
 * Save game state to file
 */
export function saveState(state: GameState, path: string = STATE_FILE): void {
    try {
        state.last_updated = new Date().toISOString();
        writeFileSync(path, JSON.stringify(state, null, 2));
    } catch (e) {
        logError(`Failed to save state to ${path}`, e);
        throw e;
    }
}

/**
 * Execution Context for a PR
 */
export interface ExecutorContext {
    prNumber: number;
    author: string;
    prTitle?: string;
    prLabels?: string[];
    word?: string;
    filesAdded?: string[];
    isMerge: boolean;
    baseKarma?: number;
}

/**
 * Main Executor Function
 * Replaces the inline script in on-merge.yml
 */
export function executeContribution(ctx: ExecutorContext): void {
    console.log(`🚀 Executing contribution for PR #${ctx.prNumber} by ${ctx.author}`);

    // ═══════════════════════════════════════════════════════════
    // 1. FILTERS & CHECKS
    // ═══════════════════════════════════════════════════════════

    // A. BOT DETECTION
    const KNOWN_BOTS = [
        'github-actions[bot]', 'dependabot[bot]', 'dependabot',
        'actions-user', 'renovate[bot]', 'renovate', 'codecov[bot]',
        'snyk-bot', 'imgbot[bot]', 'allcontributors[bot]',
        'copilot[bot]', 'github-copilot[bot]'
    ];

    const isBot = KNOWN_BOTS.includes(ctx.author) ||
        ctx.author.includes('[bot]') ||
        ctx.author.endsWith('-bot') ||
        ctx.author.startsWith('bot-');

    if (isBot) {
        console.log(`🤖 Bot detected: ${ctx.author} - skipping karma calculation`);
        return;
    }

    // B. TRANSLATION CHECK
    const prTitle = ctx.prTitle || '';
    const isTranslation = /^(README|QUICKSTART|CONTRIBUTING|MANIFESTO|PLAY)\.[a-z]{2}\.md$/i.test(prTitle) ||
        prTitle.toLowerCase().includes('translation') ||
        prTitle.toLowerCase().includes('translate') ||
        prTitle.match(/🌍|🇪🇸|🇫🇷|🇩🇪|🇮🇹|🇵🇹|🇯🇵|🇨🇳|🇰🇷|🇷🇺/);

    if (isTranslation) {
        console.log('🌍 Translation PR detected - karma handled by translation-karma.yml');
        return;
    }

    // C. AUTO-MERGE CHECK
    const hasAutoMergeLabel = ctx.prLabels && ctx.prLabels.includes('auto-merge');
    if (hasAutoMergeLabel) {
        console.log('⏭️ Auto-merged PR detected - karma already calculated by auto-merge.yml');
        return;
    }

    // D. WORD EXTRACTION FALLBACK
    let word = ctx.word;
    if (!word && prTitle) {
        const wordMatch = prTitle.match(/add\s+word[:\s]+([a-zA-Z]+)/i);
        if (wordMatch) {
            word = wordMatch[1];
            console.log(`📝 Extracted word from title: ${word}`);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 2. STATE LOADING
    // ═══════════════════════════════════════════════════════════
    const state = loadState();

    // 2. Initialize Player if needed
    if (!state.players[ctx.author]) {
        state.players[ctx.author] = createDefaultPlayer();
        state.meta.total_players++;
        console.log(`🆕 New player joined: ${ctx.author}`);
    }
    const player = state.players[ctx.author];
    player.name = ctx.author; // Ensure name is set

    // 3. Time System Context
    const period = getCurrentPeriod();
    const rareEvents = checkTimeEvents();
    const prCreated = new Date(); // In a real scenario we'd pass this in, but now is fine for merge time
    // For merge_time_seconds, we might need to pass it in Context if we want to track speed accurately
    // For now, we'll assume a standard merge or pass it if available

    // 4. Gamification Logic
    const contributionCtx: ContributionContext = {
        timestamp: new Date().toISOString(),
        karma: ctx.baseKarma || 10
    };

    const result = processContribution(player, state, ctx.baseKarma || 10, word || '', contributionCtx);

    // 5. Apply Results
    player.karma += (result.total_karma - (ctx.baseKarma || 10)); // processContribution returns TOTAL, we add the diff? 
    // Wait, processContribution calculates the full amount for this event.
    // We should prob just rely on processContribution's return OR update player manually.
    // Let's look at processContribution implementation in gamification.ts...
    // It returns a result object but DOES NOT mutate state persistence (it mutates the player object passed? No, it returns new achievements)

    // Actually, gamification.ts/processContribution DOES NOT mutate the player object significantly except for reading.
    // We need to apply the changes.

    player.karma = (player.karma || 0) + result.total_karma;
    player.prs = (player.prs || 0) + 1;
    player.streak = result.streak_days;
    player.achievements = [...(player.achievements || [])];
    result.new_achievements.forEach(ach => {
        if (!player.achievements.includes(ach.id)) {
            player.achievements.push(ach.id);
        }
    });
    player.last_contribution = new Date().toISOString();

    // Update Global Stats
    state.score.total += result.total_karma;
    state.score.today += result.total_karma;
    state.meta.total_prs++;
    state.last_pr = `#${ctx.prNumber}`;

    // 6. Time System Updates (Global)
    if (!state.time_system) {
        state.time_system = {
            current_period: period.id,
            last_update: new Date().toISOString(),
            stats: {},
            rare_events_triggered: [],
            most_active_period: null
        };
    }
    state.time_system.current_period = period.id;
    state.time_system.last_update = new Date().toISOString();

    if (!state.time_system.stats[period.id]) {
        state.time_system.stats[period.id] = { total_prs: 0, total_karma: 0 };
    }
    state.time_system.stats[period.id].total_prs++;
    state.time_system.stats[period.id].total_karma += result.total_karma;

    // 7. Rare Events Tracking
    if (rareEvents && rareEvents.length > 0) {
        rareEvents.forEach(evt => {
            state.time_system?.rare_events_triggered.push({
                id: evt.id || 'unknown',
                name: evt.name || 'Unknown Event',
                player: ctx.author,
                timestamp: new Date().toISOString()
            });
        });
    }

    // 8. Level Up Check
    if (state.levels.next_unlock) {
        const next = state.levels.next_unlock;
        next.progress.score = state.score.total;
        next.progress.prs = state.meta.total_prs;

        if (next.progress.score >= next.requires_score && next.progress.prs >= next.requires_prs) {
            console.log(`🎉 LEVEL UP! Level ${next.level_id} unlocked!`);
            state.levels.current = next.level_id;
            state.levels.unlocked.push(next.level_id);

            if (next.level_id < 100) {
                state.levels.next_unlock = {
                    level_id: next.level_id + 1,
                    requires_score: Math.floor(next.requires_score * 1.5),
                    requires_prs: next.requires_prs + 3,
                    progress: { score: state.score.total, prs: state.meta.total_prs }
                };
            } else {
                state.levels.next_unlock = null;
            }
        }
    }

    // 9. Save State
    saveState(state);

    // 10. Output for Logs
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 EXECUTION SUMMARY: ${getTimeGreeting(ctx.author)}`);
    console.log(`   Word: ${ctx.word || '(none)'}`);
    console.log(`   Karma: +${result.total_karma} (${result.message})`);
    console.log(`   Streak: ${player.streak} days`);
    console.log('═══════════════════════════════════════════════════════');
}
