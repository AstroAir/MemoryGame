import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingSpinner = () => (
  <motion.div 
    className="flex items-center justify-center w-full h-full min-h-[200px]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 360,
      }}
      transition={{
        opacity: { duration: 0.4, ease: "easeOut" },
        scale: { duration: 0.4, ease: "easeOut" },
        rotate: {
          duration: 1,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        },
      }}
    >
      <Loader2 className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.3)]" />
    </motion.div>
  </motion.div>
);
