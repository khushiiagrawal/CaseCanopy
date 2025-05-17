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
      viewport={{ once: true }}
      className="group relative bg-legal-navy/50 backdrop-blur-lg rounded-2xl shadow-legal overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-legal-hover border border-legal-gold/20 max-w-md mx-auto p-6 sm:p-7 md:p-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-legal-gold/10 to-legal-burgundy/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-legal-gold/20 rounded-full blur-3xl group-hover:bg-legal-gold/30 transition-all duration-500" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-legal-burgundy/20 rounded-full blur-3xl group-hover:bg-legal-burgundy/30 transition-all duration-500" />
      <div className="relative flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 bg-gradient-to-br from-legal-gold to-legal-burgundy rounded-xl flex items-center justify-center mb-4 shadow-legal"
        >
          <Icon className="h-7 w-7 text-legal-parchment" />
        </motion.div>
        <motion.h3
          whileHover={{ x: 5 }}
          className="text-xl font-bold text-legal-parchment mb-2 group-hover:text-legal-gold transition-colors duration-300 text-center"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-sm text-legal-silver leading-relaxed text-center"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
          className="mt-4 flex items-center space-x-2"
        >
          <div className="h-1 w-8 bg-gradient-to-r from-legal-gold to-legal-burgundy rounded-full" />
          <div className="h-1 w-4 bg-gradient-to-r from-legal-gold/50 to-legal-burgundy/50 rounded-full" />
          <div className="h-1 w-2 bg-gradient-to-r from-legal-gold/30 to-legal-burgundy/30 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
} 