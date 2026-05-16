import React from 'react';

export interface Sticker {
  id: string;
  name: string;
  component: React.ReactNode;
  category: 'doodle' | 'tape' | 'shape' | 'emoji';
}

const WashiTape = ({ color = "#E8D17E", pattern = "plain" }: { color?: string, pattern?: "plain" | "dots" | "stripes" }) => (
  <div className="relative group grayscale-[20%] hover:grayscale-0 w-full h-full">
    <svg viewBox="0 0 120 32" className="w-full h-full">
      <path 
        d="M2 4 C 5 2, 10 5, 15 3 C 25 1, 35 6, 45 4 C 60 2, 75 8, 90 5 C 105 3, 115 6, 118 4 L 117 28 C 114 30, 104 27, 94 29 C 84 31, 74 25, 59 27 C 44 29, 29 23, 14 26 C 4 28, 2 25, 2 28 Z" 
        fill={color} 
        className="opacity-90"
      />
      {pattern === 'dots' && (
        <mask id="dots-mask">
          <rect x="0" y="0" width="120" height="32" fill="white" />
        </mask>
      )}
      {pattern === 'dots' && (
        <g mask="url(#dots-mask)" opacity="0.3">
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={15 + i * 12} cy={10} r="1.5" fill="black" />
          ))}
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={10 + i * 12} cy={22} r="1.5" fill="black" />
          ))}
        </g>
      )}
      {pattern === 'stripes' && (
        <g opacity="0.2">
          {[...Array(15)].map((_, i) => (
            <line key={i} x1={i * 10} y1="0" x2={i * 10 - 10} y2="32" stroke="black" strokeWidth="2" />
          ))}
        </g>
      )}
    </svg>
    <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
  </div>
);

const ScribbleStar = ({ color = "#FDE047" }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    <path 
      d="M20 2 L 25 14 L 38 15 L 28 24 L 31 37 L 20 30 L 9 37 L 12 24 L 2 15 L 15 14 Z" 
      fill={color} 
    />
  </svg>
);

const HandDrawnHeart = ({ color = "#E87E7E" }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    <path 
      d="M20 36 C 20 36, 2 24, 2 12 C 2 4, 12 2, 20 10 C 28 2, 38 4, 38 12 C 38 24, 20 36, 20 36" 
      fill={color} 
    />
  </svg>
);

const Cloud = ({ color = "#FFFFFF" }: { color?: string }) => (
  <svg viewBox="0 0 48 32" className="w-full h-full">
    <path 
      d="M10 28 C 4 28, 2 24, 2 20 C 2 14, 8 10, 14 10 C 16 4, 24 2, 32 4 C 38 4, 46 8, 46 16 C 46 24, 40 28, 34 28 Z" 
      fill={color} 
    />
  </svg>
);

const Flower = ({ color = "#FCA5A5" }: { color?: string }) => (
  <svg viewBox="0 0 40 40" className="w-full h-full">
    <circle cx="20" cy="20" r="5" fill="#FDE047" />
    <g>
      <path d="M20 15 C 16 10, 12 10, 10 15 C 8 20, 12 24, 20 20" fill={color} />
      <path d="M25 20 C 30 16, 30 12, 25 10 C 20 8, 16 12, 20 20" fill={color} />
      <path d="M20 25 C 24 30, 28 30, 30 25 C 32 20, 28 16, 20 20" fill={color} />
      <path d="M15 20 C 10 24, 10 28, 15 30 C 20 32, 24 28, 20 20" fill={color} />
    </g>
  </svg>
);

const Sparkle = ({ color = "#93c5fd" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    <path 
      d="M12 2 L 14 10 L 22 12 L 14 14 L 12 22 L 10 14 L 2 12 L 10 10 Z" 
      fill={color} 
    />
  </svg>
);

const EmojiSticker = ({
  emoji,
  rotate = -4,
}: {
  emoji: string;
  rotate?: number;
}) => (
  <div
    className="relative flex items-center justify-center select-none w-full h-full"
    style={{
      transform: `rotate(${rotate}deg)`,
      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))",
    }}
  >
    {/* Thick white stroke behind the emoji */}
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute select-none pointer-events-none">
      <text
        x="50"
        y="50"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="70"
        stroke="white"
        strokeWidth="15"
        strokeLinejoin="round"
      >
        {emoji}
      </text>
      <text
        x="50"
        y="50"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="70"
      >
        {emoji}
      </text>
    </svg>
  </div>
);

export const DECORATIVE_STICKERS: Sticker[] = [
  { id: 'tape-plain', name: 'Plain Tape', category: 'tape', component: <WashiTape color="#E8D17E" /> },
  { id: 'tape-dots', name: 'Polka Tape', category: 'tape', component: <WashiTape color="#93C5FD" pattern="dots" /> },
  { id: 'tape-stripes', name: 'Striped Tape', category: 'tape', component: <WashiTape color="#FCA5A5" pattern="stripes" /> },
  { id: 'tape-green', name: 'Mint Tape', category: 'tape', component: <WashiTape color="#86EFAC" /> },
  
  { id: 'star-yellow', name: 'Star', category: 'doodle', component: <ScribbleStar /> },
  { id: 'heart-red', name: 'Heart', category: 'doodle', component: <HandDrawnHeart /> },
  { id: 'cloud-white', name: 'Cloud', category: 'doodle', component: <Cloud /> },
  { id: 'flower-pink', name: 'Flower', category: 'doodle', component: <Flower /> },
  { id: 'sakura-pink', name: 'Sakura', category: 'doodle', component: <Flower color="#FBCFE8" /> },
  
  { id: 'sparkle-blue', name: 'Sparkle', category: 'shape', component: <Sparkle /> },
  { id: 'sparkle-gold', name: 'Magic', category: 'shape', component: <Sparkle color="#FDE047" /> },

  // Emojis (Die-Cut Text Outline Style)
  { id: 'emoji-smile', name: 'Smile', category: 'emoji', component: <EmojiSticker emoji="😊" rotate={-6} /> },
  { id: 'emoji-star-eyes', name: 'Star Eyes', category: 'emoji', component: <EmojiSticker emoji="🤩" rotate={3} /> },
  { id: 'emoji-sparkles', name: 'Sparkles', category: 'emoji', component: <EmojiSticker emoji="✨" rotate={-4} /> },
  { id: 'emoji-fire', name: 'Fire', category: 'emoji', component: <EmojiSticker emoji="🔥" rotate={4} /> },
  { id: 'emoji-heart', name: 'Heart', category: 'emoji', component: <EmojiSticker emoji="❤️" rotate={5} /> },
  { id: 'emoji-tada', name: 'Ta-da', category: 'emoji', component: <EmojiSticker emoji="🎉" rotate={-2} /> },
  { id: 'emoji-camera', name: 'Camera', category: 'emoji', component: <EmojiSticker emoji="📷" rotate={2} /> },
  { id: 'emoji-music', name: 'Music', category: 'emoji', component: <EmojiSticker emoji="🎵" rotate={-5} /> },
  { id: 'emoji-coffee', name: 'Coffee', category: 'emoji', component: <EmojiSticker emoji="☕" rotate={3} /> },
  { id: 'emoji-plant', name: 'Plant', category: 'emoji', component: <EmojiSticker emoji="🌿" rotate={-3} /> },
  { id: 'emoji-butterfly', name: 'Butterfly', category: 'emoji', component: <EmojiSticker emoji="🦋" rotate={6} /> },
  { id: 'emoji-pin', name: 'Pin', category: 'emoji', component: <EmojiSticker emoji="📌" rotate={-4} /> },
];
