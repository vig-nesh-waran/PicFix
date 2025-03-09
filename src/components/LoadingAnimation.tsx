import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

export function LoadingAnimation() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-white text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4"
        >
          <ImageIcon className="w-16 h-16" />
        </motion.div>
        <motion.h1
          className="text-2xl font-bold"
          animate={{
            opacity: [0, 1],
            y: [20, 0]
          }}
          transition={{
            duration: 1,
            delay: 0.5
          }}
        >
          BrushUp Loading...
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}