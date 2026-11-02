import styled from 'styled-components';

// The slanted blue light planes from the T2 website, drawn with CSS.
// Purely decorative: positioned behind the content, ignored by screen readers.
export const Beams = styled.div.attrs({ 'aria-hidden': true })`
  position: ${(p) => (p.$fixed ? 'fixed' : 'absolute')};
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;

  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 6px;
    transform: skewY(-24deg) rotate(-18deg);
    filter: blur(1px);
  }

  &::before {
    width: 46%;
    height: 70%;
    right: ${(p) => p.$right ?? '-6%'};
    top: ${(p) => p.$top ?? '18%'};
    background: linear-gradient(150deg, rgba(0, 0, 0, 0) 10%, #0751BF 75%, #3183FF);
    opacity: 0.85;
  }

  &::after {
    width: 38%;
    height: 58%;
    right: ${(p) => p.$right2 ?? '14%'};
    top: ${(p) => p.$top2 ?? '42%'};
    background: linear-gradient(160deg, rgba(49, 131, 255, 0), rgba(49, 131, 255, 0.45));
    filter: blur(18px);
  }
`;
