// Design tokens. Warm cream surfaces, fresh green accent, charcoal text (per the brief).
export const palette = {
  light: {
    background: '#FFF8EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F6EFE3',
    border: '#EADFCC',
    text: '#2B2B2B',
    textMuted: '#6B665E',
    primary: '#2E7D4F',
    primaryText: '#FFFFFF',
    primarySoft: '#DDEFE3',
    danger: '#B42318',
    dangerSoft: '#FDE8E6',
    success: '#1E7F4C',
    shadow: '#3B2F1E',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    background: '#1A1814',
    surface: '#26231E',
    surfaceAlt: '#302C25',
    border: '#3E3930',
    text: '#F3EEE6',
    textMuted: '#B3AC9F',
    primary: '#6CC28D',
    primaryText: '#10261A',
    primarySoft: '#21382B',
    danger: '#F97066',
    dangerSoft: '#3B1F1D',
    success: '#6CC28D',
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type Colors = { [K in keyof typeof palette.light]: string };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
} as const;
