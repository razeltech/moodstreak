import React, { useId } from 'react';

interface ScribbleMoodProps {
  color: string;
  size?: number;
  className?: string;
  opacity?: number;
}

export function ScribbleMood({ color, size = 40, className = '', opacity = 0.8 }: ScribbleMoodProps) {
  const filterId = useId();
  // Use color string to generate a "pseudo-seed" so it's consistent for that color
  const seed = color.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      style={{ opacity }}
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {/* Subtle background color fill */}
        <circle cx="50" cy="50" r="40" fill={color} className="opacity-10" />
        
        {/* More overlapping lines for better "fill" */}
        {[...Array(20)].map((_, i) => (
          <path
            key={i}
            d={`M ${10 + pseudoRandom(i) * 15} ${10 + i * 4} 
               Q ${50 + pseudoRandom(i + 100) * 25} ${5 + i * 4 + pseudoRandom(i + 200) * 15} 
                 ${90 - pseudoRandom(i + 300) * 15} ${10 + i * 4}`}
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            className="opacity-60"
            style={{ 
                transform: `rotate(${pseudoRandom(i + 400) * 8 - 4}deg)`,
                transformOrigin: 'center'
            }}
          />
        ))}
         {[...Array(15)].map((_, i) => (
          <path
            key={`v-${i}`}
            d={`M ${15 + i * 5} ${10 + pseudoRandom(i + 500) * 15} 
               Q ${10 + i * 5 + pseudoRandom(i + 600) * 20} ${50 + pseudoRandom(i + 700) * 25} 
                 ${15 + i * 5} ${90 - pseudoRandom(i + 800) * 15}`}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            className="opacity-40"
          />
        ))}
      </g>
    </svg>
  );
}
