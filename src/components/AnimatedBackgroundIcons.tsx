import React from 'react';
import { motion } from 'motion/react';
import { ToyBrick, Puzzle, Gamepad } from 'lucide-react';

// Simple set of icons that float around within the parent container
const icons = [
  { Component: ToyBrick, delay: 0 },
  { Component: Puzzle, delay: 2 },
  { Component: Gamepad, delay: 4 },
];

interface Props {
  // CSS class to position the container (typically absolute inset-0)
  className?: string;
}

const AnimatedBackgroundIcons: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {icons.map(({ Component, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-orange-300 opacity-40"
          style={{ fontSize: 48 }}
          initial={{ x: -100, y: -100, rotate: 0, opacity: 0 }}
          animate={{
            x: ["-20%", "80%", "-20%"],
            y: ["-20%", "80%", "-20%"],
            rotate: [0, 360],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay,
          }}
        >
          <Component />
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedBackgroundIcons;
