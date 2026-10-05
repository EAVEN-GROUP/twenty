import { COLOR_TOKENS } from './color';
import { token } from './token';

// Light mode uses a navy scale; dark mode keeps the blue scale because the
// navy solid has no contrast on dark surfaces.
const ACCENT_SCALE = {
  accent1: token({ light: '#fbfcfe', dark: COLOR_TOKENS.blue1.dark }),
  accent2: token({ light: '#f4f8fc', dark: COLOR_TOKENS.blue2.dark }),
  accent3: token({ light: '#e8f0f8', dark: COLOR_TOKENS.blue3.dark }),
  accent4: token({ light: '#dbe7f3', dark: COLOR_TOKENS.blue4.dark }),
  accent5: token({ light: '#c9dbec', dark: COLOR_TOKENS.blue5.dark }),
  accent6: token({ light: '#b2cbe2', dark: COLOR_TOKENS.blue6.dark }),
  accent7: token({ light: '#93b3d3', dark: COLOR_TOKENS.blue7.dark }),
  accent8: token({ light: '#6a93bc', dark: COLOR_TOKENS.blue8.dark }),
  accent9: token({ light: '#001e3c', dark: COLOR_TOKENS.blue9.dark }),
  accent10: token({ light: '#0a2d4a', dark: COLOR_TOKENS.blue10.dark }),
  accent11: token({ light: '#0a2d4a', dark: COLOR_TOKENS.blue11.dark }),
  accent12: token({ light: '#001428', dark: COLOR_TOKENS.blue12.dark }),
};

export const ACCENT_TOKENS = {
  primary: ACCENT_SCALE.accent5,
  secondary: ACCENT_SCALE.accent5,
  tertiary: ACCENT_SCALE.accent3,
  quaternary: ACCENT_SCALE.accent2,
  accent3570: ACCENT_SCALE.accent8,
  accent4060: ACCENT_SCALE.accent8,
  ...ACCENT_SCALE,
};
