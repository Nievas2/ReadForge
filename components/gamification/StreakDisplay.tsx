import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  className?: string;
}

export function StreakDisplay({ streak, className }: StreakDisplayProps) {
  const isActive = streak > 0;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        isActive 
          ? 'bg-streak/10 border border-streak/20' 
          : 'bg-muted border border-border',
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <motion.div
        animate={isActive ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ 
          duration: 0.6, 
          repeat: Infinity, 
          repeatDelay: 2 
        }}
      >
        <Flame className={cn(
          'w-5 h-5',
          isActive ? 'text-streak' : 'text-muted-foreground'
        )} />
      </motion.div>
      <span className={cn(
        'font-semibold tabular-nums',
        isActive ? 'text-streak' : 'text-muted-foreground'
      )}>
        {streak}
      </span>
      <span className={cn(
        'text-sm',
        isActive ? 'text-streak/70' : 'text-muted-foreground'
      )}>
        {streak === 1 ? 'day' : 'days'}
      </span>
    </motion.div>
  );
}