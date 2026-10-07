// oxlint-disable twenty/no-hardcoded-colors
// The medal palette is part of the leaderboard design and does not change with
// the theme, so it is kept here instead of in the design tokens.
export const PODIUM_RANK_STYLES = {
  1: {
    background:
      'radial-gradient(ellipse at top, rgba(255, 236, 170, 0.2) 0%, transparent 60%), linear-gradient(180deg, #c89a1c 0%, #b88912 60%, #a87a0c 100%)',
    boxShadow:
      '0 24px 70px rgba(200, 150, 30, 0.42), 0 0 60px rgba(255, 210, 90, 0.18), 0 0 0 1px rgba(255, 236, 170, 0.2) inset',
    numberColor: '#fff3c4',
    accentColor: '#fbe9a3',
    badge: '👑',
    heightPercentage: 100,
  },
  2: {
    background:
      'linear-gradient(180deg, #4f6c8a 0%, #34526e 70%, #2a445e 100%)',
    boxShadow: '0 14px 38px rgba(30, 55, 80, 0.26)',
    numberColor: '#9ec5e7',
    accentColor: '#9ec5e7',
    badge: '🥈',
    heightPercentage: 84,
  },
  3: {
    background:
      'linear-gradient(180deg, #6e4a32 0%, #4f321f 70%, #3e2716 100%)',
    boxShadow: '0 14px 38px rgba(60, 35, 15, 0.28)',
    numberColor: '#d9a980',
    accentColor: '#d9a980',
    badge: '🥉',
    heightPercentage: 76,
  },
} as const;
