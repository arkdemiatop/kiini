export const colors = {
  ink: '#1B2A1F',
  inkSoft: '#3C4A3E',
  paper: '#F1E9CE',
  paperSoft: '#FAF6E8',
  paperLine: 'rgba(27, 42, 31, 0.14)',
  chalk: '#2F4538',
  chalkDark: '#202F26',
  chalkSoft: '#3E5A49',
  marigold: '#E8A33D',
  marigoldDark: '#C7842A',
  marigoldTint: '#FBEBCD',
  brick: '#B34A3C',
  brickTint: '#F4DCD6',
  indigo: '#3D4E82',
  indigoTint: '#DEE3F1',
  white: '#FFFDF7',
  avatarA: '#4C6B57',
  avatarB: '#3D4E82',
  avatarC: '#B34A3C',
  avatarD: '#C7842A',
  avatarE: '#6B4C7A',
} as const;

export const fonts = {
  display: '"Fraunces", ui-serif, Georgia, serif',
  body: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
} as const;

export const shadows = {
  card: {
    boxShadow: '0 1px 2px rgba(27,42,31,0.06), 0 6px 18px -10px rgba(27,42,31,0.25)',
    elevation: 2,
  },
  pop: {
    boxShadow: '0 10px 30px -8px rgba(27,42,31,0.35)',
    elevation: 10,
  },
} as const;

export const navHeight = 64;
