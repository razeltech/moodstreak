import React from 'react';

export interface ScrapbookTheme {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    border: string;
    paperBase: string;
  };
  fonts: {
    heading: string;
    body: string;
    handwriting: string;
  };
  visuals: {
    backgroundStyle: React.CSSProperties;
    HeaderDecor: React.FC;
    FooterDecor: React.FC;
    PageOverlay: React.FC;
  };
  description: string;
}

export const SCRAPBOOK_THEMES: ScrapbookTheme[] = [
  {
    id: 'blank-slate',
    name: 'Blank Slate',
    colors: { bg: '#F8FAFC', surface: '#FFFFFF', accent: '#94A3B8', text: '#0F172A', border: '#E2E8F0', paperBase: '#FFFFFF' },
    fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif', handwriting: '"Caveat", cursive' },
    visuals: {
      backgroundStyle: {},
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => null
    },
    description: 'Clean, blank starting point.',
  },
  {
    id: 'blush-minimal',
    name: 'Blush Minimal',
    colors: { bg: '#FDF2F8', surface: '#FFFBFB', accent: '#F472B6', text: '#831843', border: '#FBCFE8', paperBase: '#FFFFFF' },
    fonts: { heading: '"Quicksand", sans-serif', body: '"Inter", sans-serif', handwriting: '"Caveat", cursive' },
    visuals: {
      backgroundStyle: {
        background: 'linear-gradient(to bottom, #fdf2f8 0%, #fce7f3 100%)',
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-60">
            <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
               {/* Soft clouds bottom */}
               <path d="M0,800 Q100,750 200,800 T400,800 T600,750 T800,800 L800,1100 L0,1100 Z" fill="#fbcfe8" opacity="0.4" />
               <path d="M0,850 Q150,800 300,850 T600,800 T800,850 L800,1100 L0,1100 Z" fill="#f9a8d4" opacity="0.3" />
               <path d="M0,900 Q200,850 400,900 T800,850 L800,1100 L0,1100 Z" fill="#f472b6" opacity="0.2" />

               {/* Top Right Leaves */}
               <g transform="translate(800, 0) scale(1.5)">
                  <path d="M0,0 Q-50,50 -100,100" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                  <path d="M-20,20 Q-40,10 -50,25 Q-30,40 -20,20" fill="#fbcfe8" />
                  <path d="M-40,40 Q-60,30 -70,50 Q-50,60 -40,40" fill="#f9a8d4" />
                  <path d="M-60,60 Q-80,50 -90,70 Q-70,80 -60,60" fill="#fbcfe8" />
                  <path d="M-10,40 Q-20,60 -5,70 Q10,50 -10,40" fill="#f9a8d4" />
                  <path d="M-30,70 Q-40,90 -25,100 Q-10,80 -30,70" fill="#fbcfe8" />
               </g>

               {/* Bottom Right Leaves */}
               <g transform="translate(800, 1100) scale(2)">
                  <path d="M0,0 Q-50,-100 -100,-200" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                  <path d="M-20,-40 Q-40,-30 -50,-50 Q-30,-70 -20,-40" fill="#fbcfe8" />
                  <path d="M-40,-80 Q-60,-70 -70,-90 Q-50,-110 -40,-80" fill="#f9a8d4" />
                  <path d="M-60,-120 Q-80,-110 -90,-130 Q-70,-150 -60,-120" fill="#fbcfe8" />
                  <path d="M-60,-40 Q-40,-20 -30,-40 Q-50,-60 -60,-40" fill="#f9a8d4" />
                  <path d="M-80,-80 Q-60,-60 -50,-80 Q-70,-100 -80,-80" fill="#fbcfe8" />
               </g>
            </svg>
         </div>
      )
    },
    description: 'Soft, clean, minimal pastel look.',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    colors: { bg: '#F3E8FF', surface: '#FAF5FF', accent: '#A855F7', text: '#4C1D95', border: '#D8B4FE', paperBase: '#FFFFFF' },
    fonts: { heading: '"Quicksand", sans-serif', body: '"Inter", sans-serif', handwriting: '"Satisfy", cursive' },
    visuals: {
      backgroundStyle: {
        background: 'linear-gradient(to bottom, #FAF5FF 0%, #E9D5FF 100%)',
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-80">
            <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
               {/* Soft stars */}
               <path d="M 200,100 L 205,115 L 220,120 L 205,125 L 200,140 L 195,125 L 180,120 L 195,115 Z" fill="#FDF4FF" opacity="0.8" />
               <path d="M 600,200 L 603,210 L 615,212 L 603,215 L 600,225 L 597,215 L 585,212 L 597,210 Z" fill="#FDF4FF" opacity="0.6" />
               <path d="M 100,300 L 102,308 L 110,310 L 102,312 L 100,320 L 98,312 L 90,310 L 98,308 Z" fill="#FDF4FF" opacity="0.5" />
               <circle cx="400" cy="150" r="1.5" fill="#FFF" opacity="0.7" />
               <circle cx="700" cy="300" r="2" fill="#FFF" opacity="0.8" />
               
               {/* Distant Hills */}
               <path d="M0,700 Q200,600 400,700 T800,650 L800,1100 L0,1100 Z" fill="#d8b4fe" opacity="0.3" />
               <path d="M0,750 Q250,850 500,750 T800,800 L800,1100 L0,1100 Z" fill="#c084fc" opacity="0.4" />
               <path d="M0,850 Q200,750 400,850 T800,800 L800,1100 L0,1100 Z" fill="#a855f7" opacity="0.5" />
               <path d="M0,950 Q250,1050 500,950 T800,900 L800,1100 L0,1100 Z" fill="#9333ea" opacity="0.6" />

               {/* Lavender Stalks Bottom Left */}
               <g transform="translate(50, 1100) scale(1.5)">
                  <path d="M0,0 Q-10,-50 -20,-150" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
                  {[...Array(15)].map((_, i) => (
                    <g key={i} transform={`translate(${-6 - i}, ${-20 - i*8})`}>
                       <path d="M0,0 Q5,-5 8,0 Q5,5 0,0" fill="#a855f7" transform="rotate(-30)" />
                       <path d="M0,0 Q-5,-5 -8,0 Q-5,5 0,0" fill="#a855f7" transform="rotate(30)" />
                    </g>
                  ))}
                  
                  <path d="M20,0 Q15,-40 10,-120" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
                  {[...Array(12)].map((_, i) => (
                    <g key={`b${i}`} transform={`translate(${16 - i*0.5}, ${-15 - i*8})`}>
                       <path d="M0,0 Q4,-4 6,0 Q4,4 0,0" fill="#c084fc" transform="rotate(-40)" />
                       <path d="M0,0 Q-4,-4 -6,0 Q-4,4 0,0" fill="#c084fc" transform="rotate(40)" />
                    </g>
                  ))}
               </g>

               {/* Lavender Stalks Bottom Right */}
               <g transform="translate(700, 1100) scale(1.8) scale(-1, 1)">
                  <path d="M0,0 Q-10,-50 -20,-150" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
                  {[...Array(15)].map((_, i) => (
                    <g key={i} transform={`translate(${-6 - i}, ${-20 - i*8})`}>
                       <path d="M0,0 Q5,-5 8,0 Q5,5 0,0" fill="#a855f7" transform="rotate(-30)" />
                       <path d="M0,0 Q-5,-5 -8,0 Q-5,5 0,0" fill="#a855f7" transform="rotate(30)" />
                    </g>
                  ))}
                  
                  <path d="M20,0 Q15,-40 10,-120" fill="none" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />
                  {[...Array(12)].map((_, i) => (
                    <g key={`b${i}`} transform={`translate(${16 - i*0.5}, ${-15 - i*8})`}>
                       <path d="M0,0 Q4,-4 6,0 Q4,4 0,0" fill="#c084fc" transform="rotate(-40)" />
                       <path d="M0,0 Q-4,-4 -6,0 Q-4,4 0,0" fill="#c084fc" transform="rotate(40)" />
                    </g>
                  ))}
               </g>
            </svg>
         </div>
      )
    },
    description: 'Soft, aesthetic, soothing lavender theme.',
  },
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    colors: { bg: '#EAE0D5', surface: '#F5EBE1', accent: '#A68A64', text: '#5E4B3C', border: '#D5C4B3', paperBase: '#FDFBF7' },
    fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif', handwriting: '"Caveat", cursive' },
    visuals: {
      backgroundStyle: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        backgroundColor: '#F3E9DD'
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden mix-blend-multiply">
           <svg className="absolute w-full h-full opacity-60" viewBox="0 0 800 1100" preserveAspectRatio="none">
             {/* Left margin stain */}
             <path d="M 10,0 Q 20,300 5,600 T 15,1100 L 0,1100 L 0,0 Z" fill="#D2B48C" opacity="0.3" />
             {/* Paper clip */}
             <g transform="translate(40, 800) rotate(-15) scale(2)">
                <path d="M20,10 L20,30 A10,10 0 0,0 40,30 L40,15 A5,5 0 0,0 30,15 L30,28 A2,2 0 0,0 34,28 L34,16" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
             </g>
             {/* Bottom right leaves */}
             <g transform="translate(680, 900) scale(1.5)" fill="none" stroke="#8c7760" strokeWidth="1.5" strokeLinecap="round">
                <path d="M0,150 Q20,100 50,20" />
                <path d="M25,80 Q40,70 50,85 Q30,90 25,80" fill="#a89580" fillOpacity="0.4" />
                <path d="M15,110 Q30,105 35,120 Q15,125 15,110" fill="#a89580" fillOpacity="0.4" />
                <path d="M35,50 Q55,40 65,55 Q45,60 35,50" fill="#a89580" fillOpacity="0.4" />
             </g>
           </svg>
        </div>
      )
    },
    description: 'Cozy, handwritten, journal vibe.',
  },
  {
    id: 'night-sky',
    name: 'Night Sky',
    colors: { bg: '#0F1218', surface: '#161925', accent: '#7C8CDB', text: '#E2E8F0', border: '#2D3748', paperBase: '#1a202c' },
    fonts: { heading: '"Outfit", sans-serif', body: '"Inter", sans-serif', handwriting: '"Caveat", cursive' },
    visuals: {
      backgroundStyle: {
        background: 'linear-gradient(to bottom, #070b19 0%, #171b33 100%)',
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <svg className="absolute w-full h-full opacity-80" viewBox="0 0 800 1100" preserveAspectRatio="none">
               {/* Crescent Moon */}
               <path d="M 650,200 A 40,40 0 1,0 700,250 A 50,50 0 0,1 650,200 Z" fill="#FDE047" opacity="0.9" />
               <circle cx="680" cy="225" r="50" fill="#FDE047" opacity="0.1" filter="blur(15px)" />
               <circle cx="680" cy="225" r="80" fill="#FDE047" opacity="0.05" filter="blur(25px)" />

               {/* Stars */}
               <g fill="#FFF" opacity="0.8">
                 <circle cx="100" cy="150" r="1.5" />
                 <circle cx="250" cy="80" r="1.0" />
                 <circle cx="400" cy="200" r="2.0" />
                 <circle cx="700" cy="100" r="1.5" />
                 <circle cx="650" cy="300" r="1.0" />
                 <circle cx="50" cy="400" r="2.0" />
                 <circle cx="150" cy="350" r="1.2" opacity="0.6"/>
                 <circle cx="300" cy="450" r="0.8" opacity="0.5"/>
                 <circle cx="500" cy="120" r="1.5" opacity="0.7"/>
                 <circle cx="600" cy="400" r="2.0" opacity="0.4"/>
                 <circle cx="450" cy="600" r="1.0" opacity="0.8"/>
                 <circle cx="200" cy="700" r="1.5" opacity="0.6"/>
                 <circle cx="750" cy="550" r="1.2" opacity="0.5"/>
                 <circle cx="100" cy="850" r="2.0" opacity="0.7"/>
                 <circle cx="550" cy="800" r="1.0" opacity="0.9"/>
                 <circle cx="350" cy="900" r="1.5" opacity="0.6"/>
                 <circle cx="80" cy="620" r="0.8" opacity="0.5"/>
                 <circle cx="720" cy="780" r="1.8" opacity="0.8"/>
                 <circle cx="600" cy="950" r="1.0" opacity="0.4"/>
                 <circle cx="250" cy="1000" r="1.5" opacity="0.7"/>
                 
                 {/* Sparkles */}
                 <path d="M 300,250 L 302,258 L 310,260 L 302,262 L 300,270 L 298,262 L 290,260 L 298,258 Z" fill="#FFF" opacity="0.6" />
                 <path d="M 550,150 L 551,154 L 555,155 L 551,156 L 550,160 L 549,156 L 545,155 L 549,154 Z" fill="#FFF" opacity="0.8" />
                 <path d="M 150,550 L 152,558 L 160,560 L 152,562 L 150,570 L 148,562 L 140,560 L 148,558 Z" fill="#FFF" opacity="0.5" />
                 <path d="M 450,850 L 451,854 L 455,855 L 451,856 L 450,860 L 449,856 L 445,855 L 449,854 Z" fill="#FFF" opacity="0.7" />
               </g>
               
               {/* Shooting star */}
               <path d="M 500,100 L 400,200" stroke="url(#shooting-star)" strokeWidth="1.5" opacity="0.8" />
               <defs>
                 <linearGradient id="shooting-star" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#FFF" stopOpacity="0"/>
                   <stop offset="100%" stopColor="#FFF" stopOpacity="1"/>
                 </linearGradient>
               </defs>
               
               {/* Small Plants / Grass Silhouette bottom */}
               <g transform="translate(0, 1050)" fill="#0B0E14" opacity="0.85">
                  <path d="M0,50 L0,-10 C 10,-5 20,10 30,-20 C 40,-5 50,20 60,-15 C 70,5 80,-10 90,0 C 100,-15 110,5 120,-25 C 130,-5 140,10 150,-5 C 160,15 170,-20 180,5 C 190,0 200,20 210,-10 C 220,15 230,-5 240,10 C 250,-15 260,5 270,-20 C 280,0 290,15 300,-10 C 310,10 320,-15 330,5 C 340,15 350,-5 360,10 C 370,-25 380,5 390,-10 C 400,-20 410,10 420,-5 C 430,5 440,-15 450,0 C 460,-10 470,10 480,-25 C 490,5 500,-10 510,5 C 520,20 530,-15 540,0 C 550,15 560,-5 570,10 C 580,-20 590,5 600,-10 C 610,15 620,-5 630,-25 C 640,-10 650,15 660,-5 C 670,-15 680,10 690,0 C 700,20 710,-10 720,5 C 730,15 740,-20 750,-5 C 760,10 770,-15 780,0 C 790,5 800,-10 800,50 Z" />
                  <path d="M 50,-15 C 53,-25 58,-25 60,-35 C 62,-25 67,-25 70,-15 C 65,-12 55,-12 50,-15 Z" fill="#202A40" opacity="0.7"/>
                  <path d="M 120,-25 C 122,-35 126,-35 128,-45 C 130,-35 134,-35 136,-25 C 132,-22 124,-22 120,-25 Z" fill="#202A40" opacity="0.7"/>
                  <path d="M 270,-18 C 273,-28 277,-28 279,-38 C 281,-28 285,-28 287,-18 C 283,-15 275,-15 270,-18 Z" fill="#202A40" opacity="0.6"/>
                  <path d="M 370,-22 C 372,-32 376,-32 378,-42 C 380,-32 384,-32 386,-22 C 382,-19 374,-19 370,-22 Z" fill="#202A40" opacity="0.6"/>
                  <path d="M 480,-25 C 482,-35 486,-35 488,-45 C 490,-35 494,-35 496,-25 C 492,-22 484,-22 480,-25 Z" fill="#202A40" opacity="0.7"/>
                  <path d="M 630,-20 C 632,-30 636,-30 638,-40 C 640,-30 644,-30 646,-20 C 642,-17 634,-17 630,-20 Z" fill="#202A40" opacity="0.7"/>
               </g>
            </svg>
         </div>
      )
    },
    description: 'Calm, starry night mood.',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    colors: { bg: '#EBF3EC', surface: '#F2F8F3', accent: '#6B9071', text: '#3A5A40', border: '#C2D5C6', paperBase: '#FAFCFA' },
    fonts: { heading: '"Lora", serif', body: '"Inter", sans-serif', handwriting: '"Satisfy", cursive' },
    visuals: {
      backgroundStyle: {
        background: 'linear-gradient(to bottom, #dbeade 0%, #a3c4a8 100%)',
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-80">
            <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
               <g transform="translate(600, -50) scale(2)">
                  <circle cx="50" cy="50" r="80" fill="#8cb393" opacity="0.3" filter="blur(10px)" />
                  <path d="M0,0 Q50,80 150,50" fill="none" stroke="#5d8062" strokeWidth="3" />
                  <path d="M50,40 Q60,60 80,60 M70,20 Q90,40 100,20" fill="none" stroke="#5d8062" strokeWidth="2" />
                  <path d="M40,30 Q60,10 80,20 Q70,40 40,30" fill="#719e78" opacity="0.6"/>
                  <path d="M80,50 Q100,30 120,40 Q110,60 80,50" fill="#719e78" opacity="0.6"/>
                  <path d="M60,10 Q80,-10 100,0 Q90,20 60,10" fill="#8cb393" opacity="0.6"/>
               </g>
               
               <g transform="translate(0, 900)">
                 <path d="M0,200 Q150,150 300,180 T600,150 T800,180 L800,250 L0,250 Z" fill="#95b99d" opacity="0.4" />
                 <path d="M0,220 Q200,170 400,200 T800,160 L800,250 L0,250 Z" fill="#7ba584" opacity="0.5" />
                 <path d="M0,250 L0,40 L30,80 L60,20 L90,90 L120,0 L150,70 L180,-20 L210,60 L240,-40 L270,50 L300,-10 L330,70 L360,10 L390,80 L420,30 L450,90 L480,40 L510,100 L540,50 L570,110 L600,60 L630,120 L660,70 L690,130 L720,80 L750,140 L780,90 L800,150 L800,250 Z" fill="#5d8062" opacity="0.8" />
                 <path d="M0,250 L0,80 L40,120 L80,60 L120,130 L160,40 L200,110 L240,20 L280,100 L320,0 L360,90 L400,30 L440,120 L480,60 L520,130 L560,70 L600,140 L640,80 L680,150 L720,90 L760,160 L800,100 L800,250 Z" fill="#4d6f52" opacity="0.9" />
               </g>
            </svg>
         </div>
      )
    },
    description: 'Refreshing, nature vibe.',
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    colors: { bg: '#FFF7E6', surface: '#FFFAED', accent: '#F59E0B', text: '#92400E', border: '#FDE68A', paperBase: '#FFFFFF' },
    fonts: { heading: '"Outfit", sans-serif', body: '"Inter", sans-serif', handwriting: '"Permanent Marker", cursive' },
    visuals: {
      backgroundStyle: {
        background: 'linear-gradient(to bottom, #fdf8e1 0%, #fef3c7 100%)',
      },
      HeaderDecor: () => null,
      FooterDecor: () => null,
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-70">
            <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
               <g transform="translate(800, 0)">
                  <circle cx="0" cy="0" r="150" fill="#fde047" opacity="0.5" />
                  <circle cx="0" cy="0" r="100" fill="#fcd34d" opacity="0.6" />
                  {[...Array(12)].map((_, i) => (
                    <polygon key={i} points="0,0 200,-20 200,20" fill="#fde047" opacity="0.3" transform={`rotate(${i * 30})`} />
                  ))}
               </g>

               {/* Birds */}
               <g transform="translate(150, 100) scale(0.6)" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                  <path d="M0,10 Q10,-5 20,10 Q30,-5 40,10" />
               </g>
               <g transform="translate(220, 130) scale(0.4)" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                  <path d="M0,10 Q10,-5 20,10 Q30,-5 40,10" />
               </g>
               <g transform="translate(90, 160) scale(0.5)" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                  <path d="M0,10 Q10,-5 20,10 Q30,-5 40,10" />
               </g>
               
               <g transform="translate(0, 950)">
                  <path d="M0,150 Q200,80 400,120 T800,70 L800,200 L0,200 Z" fill="#fcd34d" opacity="0.5" />
                  <path d="M0,180 Q300,100 500,150 T800,110 L800,200 L0,200 Z" fill="#fbbf24" opacity="0.6" />
                  <path d="M0,220 Q400,150 600,180 T800,140 L800,200 L0,200 Z" fill="#f59e0b" opacity="0.7" />
                  
                  <g transform="translate(100, 110)">
                    <circle cx="0" cy="0" r="10" fill="#fbbf24" />
                    <circle cx="-15" cy="0" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="15" cy="0" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="0" cy="-15" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="0" cy="15" r="12" fill="#fff" opacity="0.9" />
                  </g>
                  
                  <g transform="translate(300, 140) scale(0.6)">
                    <circle cx="0" cy="0" r="10" fill="#fbbf24" />
                    <circle cx="-15" cy="0" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="15" cy="0" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="0" cy="-15" r="12" fill="#fff" opacity="0.9" />
                    <circle cx="0" cy="15" r="12" fill="#fff" opacity="0.9" />
                  </g>
                  
                  <g transform="translate(680, 100) scale(0.8)">
                    <circle cx="0" cy="0" r="10" fill="#fff" />
                    <circle cx="-15" cy="0" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
                    <circle cx="15" cy="0" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
                    <circle cx="0" cy="-15" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
                    <circle cx="0" cy="15" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
                  </g>
               </g>
            </svg>
         </div>
      )
    },
    description: 'Energetic, sunny vibe.',
  },
  {
    id: 'cafe',
    name: 'Cozy Cafe',
    colors: { bg: '#EAE0D5', surface: '#F5EBE1', accent: '#C69C6D', text: '#5E4B3C', border: '#D5C4B3', paperBase: '#FDFBF7' },
    fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif', handwriting: '"Caveat", cursive' },
    visuals: {
      backgroundStyle: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
      },
      HeaderDecor: () => (
        <div className="absolute top-0 right-10 flex gap-4 opacity-70 pointer-events-none">
          <div className="w-8 h-12 bg-orange-200/40 rounded-b-xl border border-orange-300/30 shadow-[0_4px_12px_rgba(251,146,60,0.2)] flex items-end justify-center pb-2">
            <div className="w-4 h-4 bg-orange-100 rounded-full blur-[2px]" />
          </div>
          <div className="w-6 h-10 bg-orange-200/40 rounded-b-xl border border-orange-300/30 shadow-[0_4px_12px_rgba(251,146,60,0.2)] mt-4 flex items-end justify-center pb-2">
            <div className="w-3 h-3 bg-orange-100 rounded-full blur-[2px]" />
          </div>
        </div>
      ),
      FooterDecor: () => (
        <div className="absolute bottom-2 right-4 flex gap-2 opacity-80 pointer-events-none transform -rotate-3">
          <div className="w-32 h-6 bg-[url('https://www.transparenttextures.com/patterns/recycled-paper-texture.png')] bg-stone-300/50 rounded-sm shadow-sm opacity-80" />
        </div>
      ),
      PageOverlay: () => (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 select-none mix-blend-multiply z-0">
           {/* Coffee Stain Border */}
           <svg className="absolute top-0 left-0 w-full h-full opacity-60" viewBox="0 0 800 1100" preserveAspectRatio="none">
             {/* Left margin stain */}
             <path d="M 10,0 Q 20,300 5,600 T 15,1100 L 0,1100 L 0,0 Z" fill="#D2B48C" opacity="0.4" />
             {/* Top right coffee cup ring */}
             <circle cx="750" cy="80" r="60" fill="none" stroke="#8B4513" strokeWidth="4" strokeDasharray="40 200" opacity="0.3" transform="rotate(45 750 80)" />
             <circle cx="745" cy="75" r="55" fill="none" stroke="#8B4513" strokeWidth="2" strokeDasharray="100 50" opacity="0.2" transform="rotate(-20 745 75)" />
             <circle cx="750" cy="80" r="58" fill="none" stroke="#8B4513" strokeWidth="1" strokeDasharray="20 300" opacity="0.4" transform="rotate(110 750 80)" />
             
             {/* Random splashes */}
             <circle cx="660" cy="120" r="4" fill="#8B4513" opacity="0.3" />
             <circle cx="680" cy="140" r="2" fill="#8B4513" opacity="0.2" />
             <circle cx="700" cy="130" r="3" fill="#8B4513" opacity="0.3" />

             {/* Bottom Left Vintage Stamp */}
             <g transform="translate(30, 950) rotate(-15)">
                <rect x="0" y="0" width="120" height="80" fill="none" stroke="#A0522D" strokeWidth="3" opacity="0.6"/>
                <rect x="6" y="6" width="108" height="68" fill="none" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>
                <text x="60" y="35" fontFamily="serif" fontSize="24" textAnchor="middle" fill="#A0522D" opacity="0.7" letterSpacing="4">TOKYO</text>
                <text x="60" y="55" fontFamily="sans-serif" fontSize="10" textAnchor="middle" fill="#A0522D" opacity="0.6" letterSpacing="2">COFFEE ROASTERS</text>
                <text x="60" y="68" fontFamily="sans-serif" fontSize="8" textAnchor="middle" fill="#A0522D" opacity="0.5">EST. 1998</text>
             </g>
           </svg>
        </div>
      )
    },
    description: 'Warm lighting, cafe tables, soft brown and cream tones.',
  },
  {
    id: 'harajuku',
    name: 'Harajuku Pop Kawaii',
    colors: { bg: '#FFE4F2', surface: '#FFF0F5', accent: '#FF69B4', text: '#D81B60', border: '#F8BBD0', paperBase: '#FFFFFF' },
    fonts: { heading: '"Outfit", sans-serif', body: '"Inter", sans-serif', handwriting: '"Indie Flower", cursive' },
    visuals: {
      backgroundStyle: {
        backgroundImage: 'radial-gradient(#FFB6C1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      },
      HeaderDecor: () => null,
      FooterDecor: () => (
        <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none" style={{
           background: 'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 1000 100" xmlns="http://www.w3.org/2000/svg"><path d="M0,50 Q100,0 200,50 T400,50 T600,50 T800,50 T1000,50 L1000,100 L0,100 Z" fill="%23FFE4F2"/></svg>\')',
           backgroundSize: '400px 100%',
        }} />
      ),
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none opacity-60 z-0 select-none overflow-hidden mix-blend-multiply">
           <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
             {/* Flower Stickers Background */}
             <g transform="translate(50, 100) scale(1.5) rotate(15)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#FFB6C1" />
                <circle cx="20" cy="10" r="5" fill="#FFFFE0" />
             </g>
             
             <g transform="translate(700, 150) scale(1.2) rotate(-20)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#87CEFA" />
                <circle cx="20" cy="10" r="5" fill="#FFF" />
             </g>
             
             <g transform="translate(150, 850) scale(2) rotate(45)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#DDA0DD" />
                <circle cx="20" cy="10" r="5" fill="#FFFFE0" />
             </g>

             <g transform="translate(680, 850) scale(1.8) rotate(-40)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#FF69B4" />
                <circle cx="20" cy="10" r="5" fill="#FFFFE0" />
             </g>

             <g transform="translate(400, 200) scale(1) rotate(60)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#98FB98" opacity="0.7" />
                <circle cx="20" cy="10" r="5" fill="#FFF" />
             </g>
             
             <g transform="translate(80, 400) scale(1.3) rotate(-10)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#FFB6C1" opacity="0.6" />
                <circle cx="20" cy="10" r="5" fill="#FFFFE0" />
             </g>

             <g transform="translate(650, 450) scale(1.5) rotate(30)">
                <path d="M0,0 Q10,-10 20,0 Q30,-10 40,0 Q40,15 30,25 Q20,35 10,25 Q0,15 0,0" fill="#87CEFA" opacity="0.5" />
                <circle cx="20" cy="10" r="5" fill="#FFF" />
             </g>

             {/* Little sparkles scattered */}
             <path d="M 120,40 L 125,55 L 140,60 L 125,65 L 120,80 L 115,65 L 100,60 L 115,55 Z" fill="#FF69B4" opacity="0.4" />
             <path d="M 700,900 L 710,920 L 730,930 L 710,940 L 700,960 L 690,940 L 670,930 L 690,920 Z" fill="#DDA0DD" opacity="0.5" transform="rotate(-15 700 900)"/>
             <circle cx="650" cy="980" r="10" fill="#98FB98" opacity="0.5" />
           </svg>
           {/* Doodle Borders */}
           <div className="absolute inset-4 border-2 border-dashed border-pink-300/40 rounded-[2rem]" />
         </div>
      )
    },
    description: 'Bright pastel colors, playful, energetic and colorful mood.',
  },
  {
    id: 'ghibli',
    name: 'Nature Journal',
    colors: { bg: '#DDEFE0', surface: '#F0F9F2', accent: '#5E8B62', text: '#2E4C33', border: '#B4D6B9', paperBase: '#FDFCF0' },
    fonts: { heading: '"Lora", serif', body: '"Inter", sans-serif', handwriting: '"Dancing Script", cursive' },
    visuals: {
      backgroundStyle: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
      },
      HeaderDecor: () => (
        <div className="absolute -top-4 -left-4 pointer-events-none opacity-40 mix-blend-multiply flex gap-1 transform rotate-12 scale-110">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="#81A969">
            <path d="M12,2C12,2 4,6 4,14C4,18.4 7.6,22 12,22C16.4,22 20,18.4 20,14C20,6 12,2 12,2ZM12,19.5C11.6,19.5 11.2,19.4 10.9,19.2L12,16L13.1,19.2C12.8,19.4 12.4,19.5 12,19.5ZM12,14.5L10,20.2L9.6,19C9.3,18.1 9.2,17.2 9.2,16.3C9.2,12 11.2,7.5 12,5.5C12.8,7.5 14.8,12 14.8,16.3C14.8,17.2 14.7,18.1 14.4,19L14,20.2L12,14.5Z" />
          </svg>
        </div>
      ),
      FooterDecor: () => (
        <div className="absolute bottom-0 right-4 pointer-events-none opacity-60">
          <svg width="80" height="40" viewBox="0 0 100 50" fill="#A3C695">
             <path d="M10,50 Q15,20 20,50 M30,50 Q40,10 50,50 M60,50 Q75,15 80,50" stroke="#7A9E66" strokeWidth="2" fill="none" />
             <path d="M20,30 Q25,25 30,35" fill="#8FC77B" />
             <path d="M50,20 Q60,15 65,30" fill="#8FC77B" />
          </svg>
        </div>
      ),
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/watercolor.png')] z-0 overflow-hidden">
            <svg className="absolute w-full h-full opacity-80" viewBox="0 0 800 1100" preserveAspectRatio="none">
               {/* Top Left Vines */}
               <path d="M 0,0 Q 50,100 200,50 T 350,-20" fill="none" stroke="#7A9E66" strokeWidth="8" strokeLinecap="round" />
               <path d="M 0,50 Q 80,150 150,150 T 250,50" fill="none" stroke="#7A9E66" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
               
               {/* Leaves top left */}
               <path d="M 50,50 Q 70,30 90,50 Q 70,70 50,50" fill="#8FC77B" />
               <path d="M 120,60 Q 140,40 160,60 Q 140,80 120,60" fill="#A3C695" />
               <path d="M 180,30 Q 200,10 220,30 Q 200,50 180,30" fill="#8FC77B" />
               <path d="M 80,110 Q 100,90 120,110 Q 100,130 80,110" fill="#A3C695" />
               <path d="M 160,120 Q 180,100 200,120 Q 180,140 160,120" fill="#8FC77B" />

               {/* Bottom Right Ferns */}
               <path d="M 800,1100 Q 750,900 600,1000 T 500,1100" fill="none" stroke="#7A9E66" strokeWidth="10" strokeLinecap="round" />
               
               <path d="M 720,1020 Q 750,980 770,1030 Q 730,1050 720,1020" fill="#8FC77B" />
               <path d="M 650,1050 Q 680,1010 700,1060 Q 660,1080 650,1050" fill="#A3C695" />
               <path d="M 760,950 Q 790,910 810,960 Q 770,980 760,950" fill="#8FC77B" />
            </svg>
         </div>
      )
    },
    description: 'Peaceful countryside, soft green aesthetic, nostalgic story.',
  },
  {
    id: 'sakura',
    name: 'Elegant Sakura',
    colors: { bg: '#FDF6F8', surface: '#FFFBFB', accent: '#D689A3', text: '#784758', border: '#EAC3D0', paperBase: '#FFFFFF' },
    fonts: { heading: '"Cinzel", serif', body: '"Inter", sans-serif', handwriting: '"Satisfy", cursive' },
    visuals: {
      backgroundStyle: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
      },
      HeaderDecor: () => (
        <div className="absolute top-0 right-0 pointer-events-none opacity-70 transform origin-top-right scale-90">
           <svg width="200" height="150" viewBox="0 0 200 150">
             <path d="M200,0 C150,20 100,50 50,150" stroke="#CD8B9A" strokeWidth="2" strokeDasharray="4 4" fill="none" />
             <circle cx="150" cy="30" r="4" fill="#E6A8B9" />
             <circle cx="120" cy="50" r="3" fill="#E6A8B9" />
             <circle cx="80" cy="100" r="5" fill="#E6A8B9" />
             <circle cx="100" cy="120" r="3" fill="#E6A8B9" />
           </svg>
        </div>
      ),
      FooterDecor: () => (
        <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none opacity-[0.15]" style={{
           backgroundImage: 'radial-gradient(circle at 10px 10px, #D689A3 2px, transparent 2px)',
           backgroundSize: '20px 20px',
        }} />
      ),
      PageOverlay: () => (
         <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-70 z-0 overflow-hidden">
            <svg className="absolute w-full h-full" viewBox="0 0 800 1100" preserveAspectRatio="none">
              {/* Top Left Branch */}
              <g transform="translate(-20, -20) scale(1.5)">
                <path d="M-10,30 Q40,40 80,100 T160,180" fill="none" stroke="#4A3B3C" strokeWidth="4" strokeLinecap="round" />
                <path d="M20,35 Q50,60 70,50" fill="none" stroke="#4A3B3C" strokeWidth="2" strokeLinecap="round" />
                <path d="M50,75 Q80,110 110,100" fill="none" stroke="#4A3B3C" strokeWidth="2" strokeLinecap="round" />
                
                {/* Petals */}
                <path d="M20,35 Q25,20 35,25 Q40,35 30,40 Q20,35 20,35" fill="#F472B6" />
                <path d="M70,50 Q75,35 85,40 Q90,50 80,55 Q70,50 70,50" fill="#FCA5A5" />
                <path d="M110,100 Q120,80 135,90 Q145,105 130,115 Q110,120 110,100" fill="#FDA4AF" />
                <path d="M160,180 Q170,165 185,170 Q195,185 180,195 Q160,195 160,180" fill="#F472B6" />
                <path d="M140,160 Q150,140 165,150 Q175,165 160,175 Q140,180 140,160" fill="#FCA5A5" />
                
                {/* Floating petals */}
                <path d="M90,140 Q95,130 105,135 Q110,145 100,150 Z" fill="#FBCFE8" />
                <path d="M40,110 Q45,105 52,108 Q55,115 48,118 Z" fill="#FCA5A5" />
                <path d="M180,120 Q185,110 195,115 Q200,125 190,130 Z" fill="#FBCFE8" opacity="0.8"/>
              </g>
              
              {/* Bottom Right Branch */}
              <g transform="translate(600, 850) scale(1.5)">
                <path d="M210,170 Q160,160 120,100 T40,20" fill="none" stroke="#4A3B3C" strokeWidth="4" strokeLinecap="round" />
                <path d="M180,165 Q150,140 130,150" fill="none" stroke="#4A3B3C" strokeWidth="2" strokeLinecap="round" />
                <path d="M120,100 Q90,90 80,110" fill="none" stroke="#4A3B3C" strokeWidth="2" strokeLinecap="round" />
                
                {/* Petals */}
                <path d="M180,165 Q175,180 165,175 Q160,165 170,160 Q180,165 180,165" fill="#F472B6" />
                <path d="M130,150 Q125,165 115,160 Q110,150 120,145 Q130,150 130,150" fill="#FDA4AF" />
                <path d="M80,110 Q70,125 55,115 Q50,100 65,95 Q80,90 80,110" fill="#FCA5A5" />
                <path d="M40,20 Q30,40 15,30 Q5,15 20,5 Q40,-5 40,20" fill="#F472B6" />
                
                {/* Floating */}
                <path d="M80,80 Q75,90 65,85 Q60,75 70,70 Z" fill="#FBCFE8" opacity="0.8"/>
                <path d="M140,70 Q135,78 128,75 Q125,68 132,65 Z" fill="#FCA5A5" opacity="0.7"/>
                <path d="M20,70 Q15,80 5,75 Q0,65 10,60 Z" fill="#FBCFE8" opacity="0.9"/>
              </g>

              {/* Distant falling petals */}
              <g opacity="0.4" transform="translate(0, 400)">
                <path d="M700,50 Q705,40 715,45 Q720,55 710,60 Z" fill="#FBCFE8" />
                <path d="M750,150 Q755,140 765,145 Q770,155 760,160 Z" fill="#FDA4AF" />
                <path d="M100,250 Q105,240 115,245 Q120,255 110,260 Z" fill="#FBCFE8" />
              </g>
            </svg>
            
            <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')]" />
         </div>
      )
    },
    description: 'Cherry blossoms, gold accents, traditional elegant luxury.',
  }
];
