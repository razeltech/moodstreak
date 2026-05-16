import React from 'react';

interface HandDrawnBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function HandDrawnBorder({ children, className = '', color = '#2C2C2C' }: HandDrawnBorderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Hand-drawn SVG border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M 5,5 L 95,5 L 95,95 L 5,95 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          style={{
            filter: 'url(#scribble-filter)',
            strokeDasharray: '400',
            strokeDashoffset: '0',
          }}
        />
        <defs>
          <filter id="scribble-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
