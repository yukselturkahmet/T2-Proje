import React, { useId } from 'react';
import styled from 'styled-components';
import { t } from '../theme/tokens';

// The T2 company logo as vector shapes, traced from the original artwork:
// a blue circle with "T", a green circle with "2", and a gap between them.
// Being an SVG it has no background, stays sharp at any size and can be
// recoloured for dark or light surfaces.
const T_PATH = 'M321.2 87.0L113.5 87.5L113.8 149.2L180.5 149.5L181.2 150.2L181.0 351.2L181.5 351.8L252.8 351.5L252.8 150.2L253.5 149.5L321.2 149.5Z';
const TWO_PATH = 'M494.5 109.8L492.0 112.0L492.0 113.0L513.5 166.8L514.8 166.5L526.8 157.2L533.5 153.0L546.2 146.8L552.2 144.8L560.5 143.0L575.8 142.8L581.2 143.8L587.0 145.8L592.0 148.8L595.8 152.2L600.0 160.0L601.0 164.5L601.0 173.8L598.8 183.5L594.8 192.0L590.5 199.2L577.5 215.8L566.5 227.5L550.0 243.5L490.8 296.8L490.2 298.0L490.5 342.0L491.2 342.5L677.2 342.5L677.8 341.8L677.8 281.5L677.2 280.8L600.2 281.0L599.8 280.5L625.2 257.2L636.5 245.5L645.2 235.2L654.2 223.0L663.5 207.0L669.5 191.5L671.8 182.2L673.2 169.2L673.2 160.5L671.8 147.5L669.8 139.2L666.5 130.2L662.0 121.5L655.8 112.5L650.0 106.5L642.8 100.2L633.0 94.0L625.2 90.2L616.2 87.0L609.0 85.0L606.5 85.0L604.2 84.0L585.8 82.0L575.2 82.0L560.2 83.2L549.8 85.0L537.8 88.0L525.5 92.2L511.0 99.0Z';

const VIEW_HEIGHT = 412;
const GREEN_RADIUS = 206.5;
const ARTWORK_GAP = 14.8;

const VARIANTS = {
  // Original colours, for light surfaces.
  color: { first: t.brandBlue, firstText: '#FFFFFF', second: t.green, secondText: '#FFFFFF' },
  // On T2 blue: the blue circle turns white so it stays visible.
  reversed: { first: '#FFFFFF', firstText: t.blue, second: t.green, secondText: '#FFFFFF' },
  // Large decorative version on T2 blue.
  decor: { first: 'rgba(255, 255, 255, 0.14)', firstText: 'rgba(255, 255, 255, 0.92)', second: t.green, secondText: '#FFFFFF' },
};

const Svg = styled.svg`
  display: block;
  shape-rendering: geometricPrecision;
  height: ${(p) => (p.$height ? `${p.$height}px` : 'auto')};
  width: ${(p) => (p.$height ? 'auto' : '100%')};
  flex: none;
`;

/** The T2 logo. variant: "color" (default), "reversed" or "decor". */
export function Logo({ variant = 'color', height, className, decorative = false }) {
  const colors = VARIANTS[variant];
  const gapId = `t2-gap-${useId().replace(/:/g, '')}`;
  // The gap between the circles is ~15 units in the artwork. At small sizes
  // that is under a pixel and the circles look like they collide, so keep
  // it about 1.8px wide on screen. (Wider makes the blue circle's cut
  // corners look like sharp spikes.)
  const gap = height ? Math.max(ARTWORK_GAP, (1.8 * VIEW_HEIGHT) / height) : ARTWORK_GAP;
  return (
    <Svg
      viewBox="14 14 772 412"
      $height={height}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'T2'}
      aria-hidden={decorative || undefined}
    >
      <defs>
        {/* Cuts the gap around the green circle out of the blue one. */}
        <mask id={gapId}>
          <rect x="0" y="0" width="800" height="440" fill="#fff" />
          <circle cx="578.2" cy="219.5" r={GREEN_RADIUS + gap} fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${gapId})`}>
        <circle cx="219.5" cy="219.5" r="205" fill={colors.first} />
        <path d={T_PATH} fill={colors.firstText} />
      </g>
      <circle cx="578.2" cy="219.5" r={GREEN_RADIUS} fill={colors.second} />
      <path d={TWO_PATH} fill={colors.secondText} />
    </Svg>
  );
}

const Backdrop = styled.div.attrs({ 'aria-hidden': true })`
  position: absolute;
  z-index: 0;
  width: ${(p) => p.$width}px;
  max-width: 90%;
  right: ${(p) => p.$right};
  bottom: ${(p) => p.$bottom};
  pointer-events: none;
`;

/** Large logo used as a backdrop on the blue brand panels. */
export function BigLogo({ width = 560, right = '-60px', bottom = '-40px' }) {
  return (
    <Backdrop $width={width} $right={right} $bottom={bottom}>
      <Logo variant="decor" decorative />
    </Backdrop>
  );
}
