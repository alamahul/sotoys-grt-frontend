import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Sample testimonial data – replace with real data as needed
const testimonials = [
  {
    quote: "Mainan SOTOYS GARUT sangat menginspirasi kreativitas anak saya!",
    author: "Rina, Bandung",
  },
  {
    quote: "Kualitasnya terjamin, pengiriman cepat, dan harga bersahabat.",
    author: "Budi, Surabaya",
  },
  {
    quote: "Pelayanan pelanggan 24/7 sangat membantu saat saya butuh bantuan.",
    author: "Siti, Jakarta",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000); // change every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8">
          Apa Kata Mereka?
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <p className="text-lg text-gray-700 dark:text-gray-200 italic mb-4">
              “{testimonials[index].quote}”
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              — {testimonials[index].author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
