import React from 'react';
import { motion } from 'motion/react';

export const SakuraPetal = () => {
    const randomFall = Math.random() * 5 + 5;
    const randomShift = Math.random() * 100 - 50;
    const initialRotate = Math.random() * 360;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: Math.random() * 100 + "%", rotate: initialRotate }}
            animate={{ 
                opacity: [0, 1, 1, 0],
                y: "100vh",
                x: `calc(${Math.random() * 100}% + ${randomShift}px)`,
                rotate: initialRotate + 360
            }}
            transition={{ 
                duration: randomFall,
                ease: "linear",
                repeat: Infinity,
                delay: Math.random() * 10
            }}
            className="absolute w-4 h-4 pointer-events-none"
        >
            <svg viewBox="0 0 24 24" fill="#FCA3CC" opacity="0.6">
                <path d="M12,2C12,2 9,7 9,12C9,17 12,22 12,22C12,22 15,17 15,12C15,7 12,2 12,2Z" />
            </svg>
        </motion.div>
    );
};

export const KoiFish = ({ delay = 0, color = "#E87E7E" }) => {
    return (
        <motion.div
            initial={{ x: -100, y: "85%", rotate: 0, opacity: 0 }}
            animate={{ 
                x: "110vw",
                opacity: [0, 0.4, 0.4, 0],
                y: ["85%", "82%", "88%", "85%"],
                rotate: [0, -5, 5, 0]
            }}
            transition={{ 
                duration: 15,
                ease: "easeInOut",
                repeat: Infinity,
                delay: delay
            }}
            className="absolute w-24 h-12 pointer-events-none z-10 opacity-30"
        >
            <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 25C10 25 30 5 60 20C90 35 10 25 10 25Z" fill={color} />
                <path d="M60 20C75 12 95 15 95 15L85 25L95 35C95 35 75 38 60 30" fill={color} />
                <circle cx="20" cy="22" r="2" fill="#2C2C2C" />
            </svg>
        </motion.div>
    );
};

export const AnimatedMarginalia = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Sakura Petals */}
            {Array.from({ length: 12 }).map((_, i) => (
                <SakuraPetal key={i} />
            ))}
            
            {/* Koi Fishes */}
            <KoiFish delay={0} color="#E87E7E" />
            <KoiFish delay={7} color="#E8D17E" />
            <KoiFish delay={4} color="#7EB6E8" />
        </div>
    );
};
