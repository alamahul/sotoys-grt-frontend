import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Helper to generate unique IDs for particles
let particleId = 0;

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rafRef = useRef<number | null>(null);

  // Track mouse movement using requestAnimationFrame for smoothness
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setPosition({ x: clientX, y: clientY });
      // Add a new particle on each move (limited to avoid overload)
      setParticles((prev) => [...prev, { id: particleId++, x: clientX, y: clientY }]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up particles after animation completes
  const handleParticleComplete = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  // Hover handling for interactive elements
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const label = target.getAttribute('data-cursor-label');
      if (label) {
        setHoverLabel(label);
        setIsHovering(true);
      }
    };
    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const label = target.getAttribute('data-cursor-label');
      if (label) {
        setIsHovering(false);
        setHoverLabel('');
      }
    };
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  // Smooth animation using requestAnimationFrame
  useEffect(() => {
    let animationFrame: number;
    const smooth = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
        cursorRef.current.style.scale = `${isHovering ? 1.5 : 1}`;
      }
      animationFrame = requestAnimationFrame(smooth);
    };
    smooth();
    return () => cancelAnimationFrame(animationFrame);
  }, [position, isHovering]);

  return (
    <>
      {/* Cursor Circle */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none rounded-full bg-orange-500 shadow-lg z-50 flex items-center justify-center text-white text-sm font-medium"
        style={{ width: isHovering ? 60 : 20, height: isHovering ? 60 : 20 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isHovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            {hoverLabel}
          </div>
        )}
      </motion.div>

      {/* Particle Effect limited to cursor area */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed rounded-full bg-orange-300 pointer-events-none z-40"
            style={{ width: 8, height: 8, left: p.x, top: p.y }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 2, x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => handleParticleComplete(p.id)}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;
