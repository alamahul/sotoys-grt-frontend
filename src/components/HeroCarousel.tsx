import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Transition } from 'motion/react';

// Simple auto‑rotating carousel for hero images
const heroImages = [
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1200&auto=format&fit=crop&q=80',
];

const transition: Transition = { duration: 0.8, ease: 'easeInOut' };

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={heroImages[index]}
          src={heroImages[index]}
          alt="Hero"
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={transition}
        />
      </AnimatePresence>
      {/* Optional overlay text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeInOut' }}
        >
          Selamat Datang di SOTOYS GARUT!
        </motion.h1>
      </div>
    </div>
  );
}
