/* src/components/animationVariants.ts */
export const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay, duration: 0.6 } },
});

export const slideIn = (
  direction: 'left' | 'right' | 'up' | 'down',
  delay = 0,
) => {
  const x = direction === 'left' ? -50 : direction === 'right' ? 50 : 0;
  const y = direction === 'up' ? -50 : direction === 'down' ? 50 : 0;
  return {
    hidden: { opacity: 0, x, y },
    visible: { opacity: 1, x: 0, y: 0, transition: { delay, duration: 0.7 } },
  };
};

export const staggerContainer = (stagger = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

export const scaleUp = (delay = 0) => ({
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay, duration: 0.4 } },
});
