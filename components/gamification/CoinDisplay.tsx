import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinDisplayProps {
  coins: number;
  className?: string;
  showAnimation?: boolean;
}

export function CoinDisplay({ coins, className, showAnimation = true }: CoinDisplayProps) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full bg-coin/10 border border-coin/20',
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <motion.div
        animate={showAnimation ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <Coins className="w-5 h-5 text-coin" />
      </motion.div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={coins}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="font-semibold text-coin tabular-nums"
        >
          {coins.toLocaleString()}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

interface CoinAnimationProps {
  show: boolean;
  amount: number;
  onComplete?: () => void;
}

export function CoinAnimation({ show, amount, onComplete }: CoinAnimationProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, y: 0, opacity: 0 }}
        animate={{ scale: 1, y: -30, opacity: 1 }}
        exit={{ scale: 0, y: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-coin coin-glow text-primary-foreground font-bold">
          <Coins className="w-6 h-6" />
          +{amount}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}