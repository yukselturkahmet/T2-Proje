import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { t } from '../theme/tokens';

/**
 * Measures the active item inside `ref` (found with `selector`) and returns
 * a style that places a highlight behind it. When the active item changes,
 * the highlight slides to it.
 */
export function useSlidingIndicator(ref, selector, deps) {
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return undefined;
    const measure = () => {
      const active = container.querySelector(selector);
      setBox(active
        ? { x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight }
        : null);
    };
    measure();
    // Re-measure when fonts load or the layout changes size.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // The first placement happens without animation; later moves slide.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!box || animate) return undefined;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [box, animate]);

  if (!box) return { opacity: 0 };
  return {
    width: box.w,
    height: box.h,
    transform: `translate(${box.x}px, ${box.y}px)`,
    transition: animate ? undefined : 'none',
  };
}

export const Indicator = styled.span.attrs({ 'aria-hidden': true })`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  border-radius: ${t.radius.pill};
  background: ${(p) => p.$color || t.blue};
  box-shadow: ${(p) => (p.$flat ? 'none' : '0 2px 8px rgba(11, 81, 129, 0.25)')};
  transition: transform 0.38s ${t.ease}, width 0.38s ${t.ease}, height 0.38s ${t.ease}, opacity 0.2s ease;
  pointer-events: none;
`;

const Track = styled.div`
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px;
  border-radius: ${t.radius.pill};
  border: 1px solid ${t.line};
  background: ${t.surface};

  button {
    position: relative;
    z-index: 1;
    border: 0;
    padding: ${(p) => (p.$small ? '4px 10px' : '8px 18px')};
    border-radius: ${t.radius.pill};
    background: transparent;
    color: ${t.textSoft};
    font-size: ${(p) => (p.$small ? '12px' : '14px')};
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.25s ease;
    &:hover { color: ${t.text}; }
    &[aria-pressed='true'] { color: ${t.surface}; }
  }
`;

/** Pill-shaped option switch with a highlight that slides between options. */
export function Segmented({ options, value, onChange, label, small }) {
  const ref = useRef(null);
  const style = useSlidingIndicator(ref, '[aria-pressed="true"]', [value, options.length]);
  return (
    <Track ref={ref} role="group" aria-label={label} $small={small}>
      <Indicator style={style} />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </Track>
  );
}
