import { motion } from "framer-motion";
import { Scale } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center gap-8">
        {/* Decorative background glow */}
        <div className="absolute w-64 h-64 rounded-full bg-[#D7B740]/10 filter blur-3xl"></div>

        {/* Scales of Justice Icon with animation */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E3B448]/20 to-[#CD9A3C]/10 flex items-center justify-center border border-[#E3B448]/30">
            <motion.div
              animate={{
                rotateY: [0, 180, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Scale className="w-12 h-12 text-[#E3B448]" />
            </motion.div>
          </div>

          {/* Animated pulsing rings */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-full border-2 border-[#E3B448]/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 w-full h-full rounded-full border border-[#E3B448]/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </div>

        {/* Loading Text with Decorative Elements */}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-[#E3B448] text-xl font-bold mb-2">
            Analyzing Legal Precedents
          </h2>
          <p className="text-gray-300 text-center max-w-md mb-4">
            Our AI is searching through case law to provide the most relevant
            insights for your query
          </p>

          {/* Loading bar with mustard gradient */}
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#E3B448] via-[#D7B740] to-[#CD9A3C]"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Decorative bottom line */}
          <div className="mt-6 h-0.5 w-32 bg-gradient-to-r from-transparent via-[#E3B448]/80 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
