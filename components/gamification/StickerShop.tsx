import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Sticker } from '@/types';

interface StickerCardProps {
  sticker: Sticker;
  isUnlocked: boolean;
  isEquipped?: boolean;
  canAfford?: boolean;
  onBuy?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
}

const rarityColors = {
  common: 'bg-secondary text-secondary-foreground',
  rare: 'bg-progress/20 text-progress',
  epic: 'bg-accent/20 text-accent',
  legendary: 'bg-coin/20 text-coin',
};

export function StickerCard({ 
  sticker, 
  isUnlocked, 
  isEquipped,
  canAfford,
  onBuy,
  onEquip,
  onUnequip,
}: StickerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300',
        isUnlocked ? 'hover:shadow-lg' : 'opacity-75',
        isEquipped && 'ring-2 ring-primary'
      )}>
        <CardContent className="p-4 text-center">
          {/* Sticker emoji or locked state */}
          <div className="relative mb-3">
            <motion.div
              className={cn(
                'text-5xl',
                !isUnlocked && 'blur-sm grayscale'
              )}
              animate={isUnlocked ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {sticker.emoji}
            </motion.div>
            
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Name and rarity */}
          <h4 className="font-medium text-sm mb-1">{sticker.name}</h4>
          <Badge variant="secondary" className={cn('text-xs', rarityColors[sticker.rarity])}>
            {sticker.rarity}
          </Badge>

          {/* Actions */}
          <div className="mt-3">
            {!isUnlocked ? (
              <Button 
                size="sm" 
                className="w-full"
                disabled={!canAfford}
                onClick={onBuy}
              >
                🪙 {sticker.price}
              </Button>
            ) : isEquipped ? (
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full"
                onClick={onUnequip}
              >
                Unequip
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={onEquip}
              >
                Equip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StickerGridProps {
  stickers: Sticker[];
  unlockedIds: string[];
  equippedIds: string[];
  coins: number;
  onBuy: (sticker: Sticker) => void;
  onEquip: (stickerId: string) => void;
  onUnequip: (stickerId: string) => void;
  filterCategory?: 'all' | 'book' | 'character' | 'achievement';
}

export function StickerGrid({
  stickers,
  unlockedIds,
  equippedIds,
  coins,
  onBuy,
  onEquip,
  onUnequip,
  filterCategory = 'all',
}: StickerGridProps) {
  const filteredStickers = filterCategory === 'all' 
    ? stickers 
    : stickers.filter(s => s.category === filterCategory);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <AnimatePresence>
        {filteredStickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            isUnlocked={unlockedIds.includes(sticker.id)}
            isEquipped={equippedIds.includes(sticker.id)}
            canAfford={coins >= sticker.price}
            onBuy={() => onBuy(sticker)}
            onEquip={() => onEquip(sticker.id)}
            onUnequip={() => onUnequip(sticker.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}