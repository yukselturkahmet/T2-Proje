// Design tokens in T2's own blue and green (taken from the company logo).
// Components read colours only from here, so the palette changes in one place.
export const t = {
  bg: '#F2F5F8',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F9FB',
  line: '#DCE3EA',
  lineStrong: '#BAC7D3',

  text: '#13293D',
  textSoft: '#3B4F63',
  textMuted: '#687A8C',

  blue: '#0B5181',
  blueHover: '#083F66',
  blueTint: '#E7EFF6',
  blueText: '#0B5181',

  green: '#7DB543',
  greenDeep: '#4E7F22',
  greenTint: '#EEF6E4',

  // Status colours: text, background, border.
  status: {
    green: { fg: '#3E6B17', bg: '#EEF6E4', border: '#CFE3B6' },
    amber: { fg: '#8A5A00', bg: '#FDF4E2', border: '#F1D9A6' },
    red: { fg: '#A3321F', bg: '#FBEDEA', border: '#F0C9C1' },
    blue: { fg: '#0B5181', bg: '#E7EFF6', border: '#C3D6E7' },
    gray: { fg: '#5E6E7E', bg: '#F0F3F6', border: '#D6DEE6' },
  },

  hover: 'rgba(19, 41, 61, 0.05)',
  overlay: 'rgba(19, 41, 61, 0.45)',
  shadow: '0 1px 2px rgba(19, 41, 61, 0.04), 0 8px 24px rgba(19, 41, 61, 0.06)',
  shadowPop: '0 24px 60px rgba(19, 41, 61, 0.18)',

  font: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  radius: { card: '20px', control: '12px', pill: '100px' },
  maxWidth: '1180px',
  ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
