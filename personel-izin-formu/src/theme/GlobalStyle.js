import { createGlobalStyle } from 'styled-components';
import { t } from './tokens';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html { color-scheme: light; }
  html, body, #root { margin: 0; min-height: 100%; }

  body {
    font-family: ${t.font};
    font-size: 16px;
    line-height: 1.6;
    color: ${t.textSoft};
    background: ${t.bg};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'cv11', 'ss01';
  }

  h1, h2, h3 {
    margin: 0;
    color: ${t.text};
    font-weight: 600;
    line-height: 1.12;
    letter-spacing: -0.025em;
  }
  p { margin: 0; }
  a { color: ${t.blue}; }

  button, input, select, textarea { font: inherit; color: inherit; }

  :focus-visible {
    outline: 2px solid ${t.green};
    outline-offset: 3px;
  }

  ::selection { background: ${t.blue}; color: ${t.surface}; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
