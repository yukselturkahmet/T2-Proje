import styled from 'styled-components';
import logo from '../assets/logo.jpg';
import { t } from '../theme/tokens';

/** The T2 company logo. */
export const Logo = styled.img.attrs({ src: logo, alt: 'T2' })`
  display: block;
  height: ${(p) => p.$height || 36}px;
  width: auto;
  user-select: none;
  -webkit-user-drag: none;
`;

// The two overlapping circles of the T2 logo, enlarged as a backdrop.
// Purely decorative: ignored by screen readers and pointer events.
export const BrandCircles = styled.div.attrs({ 'aria-hidden': true })`
  position: absolute;
  right: ${(p) => p.$right ?? '-120px'};
  bottom: ${(p) => p.$bottom ?? '-140px'};
  width: ${(p) => p.$size * 1.55 || 620}px;
  height: ${(p) => p.$size || 400}px;
  pointer-events: none;
  z-index: 0;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    width: ${(p) => p.$size || 400}px;
    height: ${(p) => p.$size || 400}px;
    border-radius: 50%;
  }
  &::before {
    left: 0;
    background: ${(p) => p.$first || 'rgba(255, 255, 255, 0.08)'};
  }
  &::after {
    left: ${(p) => (p.$size || 400) * 0.55}px;
    background: ${t.green};
    box-shadow: 0 0 0 ${(p) => Math.round((p.$size || 400) * 0.035)}px ${(p) => p.$gap || t.blue};
  }
`;
