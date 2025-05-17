import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: false }}
      className="group relative bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-white/10 max-w-md w-full mx-auto p-4 sm:p-6 md:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-legal-gold/10 to-transparent opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-legal-gold/5 to-legal-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-legal-gold/10 rounded-full blur-3xl group-hover:bg-legal-gold/20 transition-all duration-500" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
      <div className="relative flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-legal-navy to-legal-navy/70 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-md border-2 border-legal-gold/40"
        >
          <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-legal-gold" />
        </motion.div>
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-legal-gold transition-colors duration-300 text-center"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-sm sm:text-base text-gray-300 leading-relaxed text-center"
        >
          {description}
        </motion.p>
        
        {/* Simple animated scales of justice */}
        <div className="mt-6 relative h-8 w-full flex justify-center items-center">
          <motion.div 
            className="relative flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
          >
            {/* Top */}
            <motion.div 
              className="w-2 h-2 rounded-full bg-legal-gold mb-1"
              whileHover={{ scale: 1.2 }}
            />
            
            {/* Bar */}
            <div className="relative w-14 flex justify-center">
              <motion.div 
                className="h-0.5 w-full bg-legal-gold"
                whileHover={{ width: '120%' }}
              />
              
              {/* Vertical bar */}
              <motion.div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-legal-gold"
                whileHover={{ height: 18 }}
              />
            
              {/* Left weight */}
              <motion.div 
                className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-white/80"
                animate={{ 
                  y: [0, 2, 0, -2, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2,
                    repeatType: "reverse" 
                  }
                }}
              />
              
              {/* Center weight */}
              <motion.div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white/80"
                animate={{ 
                  y: [0, 1, 0, 1, 0],
                  scale: [1, 1.1, 1, 0.95, 1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 3,
                    repeatType: "reverse" 
                  }
                }}
              />
              
              {/* Right weight */}
              <motion.div 
                className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-white/80"
                animate={{ 
                  y: [0, -2, 0, 2, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2,
                    repeatType: "reverse",
                    delay: 0.5
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 