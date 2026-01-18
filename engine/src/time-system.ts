/**
 * Time System Module for enjoy
 * Provides time-based bonuses, events, and atmosphere throughout the game
 */

// Time periods configuration (CET/GMT+1)
export const TIME_PERIODS = {
  dawn: {
    hours: [5, 6, 7],
    emoji: '🌅',
    name: 'Dawn',
    mood: 'awakening',
    message: 'The void stirs... dawn breaks over the repository.',
    karmaMultiplier: 1.2,  // Early bird bonus
    specialEvent: 'first_light',
    color: '#ffb88c'
  },
  morning: {
    hours: [8, 9, 10, 11],
    emoji: '☀️',
    name: 'Morning',
    mood: 'energetic',
    message: 'Fresh energy flows. Prime contribution time!',
    karmaMultiplier: 1.3,  // Peak productivity bonus
    specialEvent: 'morning_rush',
    color: '#40916c'
  },
  noon: {
    hours: [12, 13, 14],
    emoji: '🌞',
    name: 'Noon',
    mood: 'intense',
    message: 'Peak activity. Maximum karma potential.',
    karmaMultiplier: 1.5,  // Highest bonus
    specialEvent: 'solar_peak',
    color: '#023e8a'
  },
  afternoon: {
    hours: [15, 16, 17],
    emoji: '🌤️',
    name: 'Afternoon',
    mood: 'golden',
    message: 'Golden hour approaches. Wisdom accumulates.',
    karmaMultiplier: 1.25,
    specialEvent: 'golden_hour',
    color: '#c2410c'
  },
  sunset: {
    hours: [18, 19, 20],
    emoji: '🌅',
    name: 'Sunset',
    mood: 'reflective',
    message: "Day's harvest. The contributions are gathered.",
    karmaMultiplier: 1.15,
    specialEvent: 'harvest_time',
    color: '#f77f00'
  },
  night: {
    hours: [21, 22, 23, 0, 1, 2, 3, 4],
    emoji: '🌙',
    name: 'Night',
    mood: 'mysterious',
    message: 'Dreams compile into code. The void watches.',
    karmaMultiplier: 1.4,  // Night owl bonus
    specialEvent: 'night_watch',
    color: '#778da9'
  }
};

// Special time-based events
export const TIME_EVENTS = {
  first_light: {
    name: 'First Light',
    description: 'Be the first contributor after dawn',
    bonus: 50,
    achievement: 'early_bird'
  },
  morning_rush: {
    name: 'Morning Rush',
    description: 'Contribute during peak morning hours',
    bonus: 25,
    achievement: 'productivity_master'
  },
  solar_peak: {
    name: 'Solar Peak',
    description: 'Merge at exactly 12:00 CET',
    bonus: 100,
    achievement: 'solar_aligned',
    condition: (hour: number, minute: number) => hour === 12 && minute === 0
  },
  golden_hour: {
    name: 'Golden Hour',
    description: 'Contribute during the golden afternoon',
    bonus: 30,
    achievement: 'golden_contributor'
  },
  harvest_time: {
    name: 'Harvest Time',
    description: 'Complete a PR during sunset',
    bonus: 35,
    achievement: 'sunset_harvester'
  },
  night_watch: {
    name: 'Night Watch',
    description: 'Contribute while others sleep',
    bonus: 45,
    achievement: 'night_owl'
  },
  // Special rare events
  witching_hour: {
    name: 'Witching Hour',
    description: 'Contribute at exactly 00:00 CET',
    bonus: 200,
    achievement: 'midnight_coder',
    condition: (hour: number, minute: number) => hour === 0 && minute === 0
  },
  triple_time: {
    name: 'Triple Time',
    description: 'Contribute at 11:11 or 22:22',
    bonus: 111,
    achievement: 'time_aligned',
    condition: (hour: number, minute: number) => (hour === 11 && minute === 11) || (hour === 22 && minute === 22)
  }
} as const;

// Daily time challenges
export const TIME_CHALLENGES = {
  dawn_warrior: {
    name: 'Dawn Warrior',
    description: 'Make 3 contributions during dawn hours in one week',
    reward: 150,
    requirement: { period: 'dawn', count: 3, timeframe: 'week' }
  },
  night_shift: {
    name: 'Night Shift',
    description: 'Make 5 contributions during night hours',
    reward: 200,
    requirement: { period: 'night', count: 5, timeframe: 'week' }
  },
  all_hours: {
    name: 'Around the Clock',
    description: 'Contribute in all 6 time periods',
    reward: 500,
    requirement: { all_periods: true }
  },
  noon_master: {
    name: 'Noon Master',
    description: '10 contributions at peak noon',
    reward: 300,
    requirement: { period: 'noon', count: 10, timeframe: 'month' }
  }
};

/**
 * Get current CET hour
 */
export function getCETHour() {
  const now = new Date();
  const cetOffset = 1; // CET is UTC+1
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  return {
    hour: (utcHour + cetOffset) % 24,
    minute: utcMinute,
    timestamp: now.toISOString()
  };
}

/**
 * Get current time period
 */
export function getCurrentPeriod() {
  const { hour } = getCETHour();
  
  for (const [periodId, config] of Object.entries(TIME_PERIODS)) {
    if (config.hours.includes(hour)) {
      return { id: periodId, ...config };
    }
  }
  
  return { id: 'night', ...TIME_PERIODS.night };
}

/**
 * Calculate time-based karma multiplier
 */
export function getTimeKarmaMultiplier() {
  const period = getCurrentPeriod();
  return period.karmaMultiplier;
}

/**
 * Check for special time events
 */
export function checkTimeEvents() {
  const { hour, minute } = getCETHour();
  const period = getCurrentPeriod();
  const events: Array<{ source: string; id?: string; name?: string; bonus?: number }> = [];
  
  // Add period event
  const specialEvent = period.specialEvent as keyof typeof TIME_EVENTS;
  if (TIME_EVENTS[specialEvent]) {
    events.push({
      ...TIME_EVENTS[specialEvent],
      source: 'period'
    });
  }
  
  // Check rare events
  for (const [eventId, event] of Object.entries(TIME_EVENTS)) {
    const evt = event as { condition?: (h: number, m: number) => boolean; name: string; bonus: number };
    if (evt.condition && evt.condition(hour, minute)) {
      events.push({
        id: eventId,
        ...evt,
        source: 'rare'
      });
    }
  }
  
  return events;
}

/**
 * Generate time-aware message for PR/issue response
 */
export function getTimeGreeting(username: string) {
  const period = getCurrentPeriod();
  const greetings = {
    dawn: [
      `🌅 Early bird ${username}! The dawn rewards the dedicated.`,
      `🌅 ${username} rises with the sun. Respect.`,
      `🌅 The void acknowledges your dawn offering, ${username}.`
    ],
    morning: [
      `☀️ Good morning ${username}! Fresh energy for fresh code.`,
      `☀️ ${username} brings morning clarity to the repo.`,
      `☀️ Rise and code, ${username}!`
    ],
    noon: [
      `🌞 ${username} strikes at peak power!`,
      `🌞 Solar alignment achieved, ${username}.`,
      `🌞 Maximum karma potential, ${username}. Well timed.`
    ],
    afternoon: [
      `🌤️ Golden afternoon, ${username}. Wisdom flows.`,
      `🌤️ ${username} catches the golden hour.`,
      `🌤️ The afternoon sun blesses your contribution, ${username}.`
    ],
    sunset: [
      `🌅 ${username} harvests the day's final light.`,
      `🌅 Sunset contributor ${username}. Poetic.`,
      `🌅 As the sun sets, ${username}'s code rises.`
    ],
    night: [
      `🌙 Night owl ${username}! The void sees you.`,
      `🌙 ${username} codes while the world sleeps.`,
      `🌙 The night embraces your contribution, ${username}.`
    ]
  };
  
  const periodGreetings = greetings[period.id as keyof typeof greetings];
  return periodGreetings[Math.floor(Math.random() * periodGreetings.length)];
}

/**
 * Get time-based badge for achievements
 */
export function getTimeBadge() {
  const period = getCurrentPeriod();
  return {
    emoji: period.emoji,
    name: `${period.name} Contributor`,
    period: period.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format time bonus message
 */
export function formatTimeBonus(baseKarma: number) {
  const period = getCurrentPeriod();
  const multiplier = period.karmaMultiplier;
  const bonus = Math.round(baseKarma * (multiplier - 1));
  
  if (bonus > 0) {
    return `${period.emoji} **${period.name} Bonus**: +${bonus} karma (${multiplier}x multiplier)`;
  }
  return null;
}

// Export for Node.js
export default {
  TIME_PERIODS,
  TIME_EVENTS,
  TIME_CHALLENGES,
  getCETHour,
  getCurrentPeriod,
  getTimeKarmaMultiplier,
  checkTimeEvents,
  getTimeGreeting,
  getTimeBadge,
  formatTimeBonus
};
