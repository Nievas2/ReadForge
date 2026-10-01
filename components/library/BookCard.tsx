import { motion } from 'framer-motion';
import { Book, MoreVertical, Trash2, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PlacedSticker } from '@/components/gamification/PlacedSticker';
import { StickerPlacementTarget } from '@/components/gamification/StickerPlacementTarget';
import type { PDFBook, ReadingProgress, Sticker, StickerPlacement, StickerCorner } from '@/types';

interface BookCardProps {
  book: PDFBook;
  progress?: ReadingProgress;
  ownedStickers: Sticker[];
  placements: Record<string, StickerPlacement>;
  placedSticker?: { sticker: Sticker; placement: StickerPlacement };
  movingStickerId: string | null;
  onRead: (book: PDFBook) => void;
  onDelete: (bookId: string) => void;
  onStickerSelect: (stickerId: string) => void;
  onMoveRequest: (stickerId: string) => void;
  onPlace: (stickerId: string, targetId: string, corner: StickerCorner) => void;
  onStickerRemove: (stickerId: string) => void;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function BookCard({
  book,
  progress,
  ownedStickers,
  placements,
  placedSticker,
  movingStickerId,
  onRead,
  onDelete,
  onStickerSelect,
  onMoveRequest,
  onPlace,
  onStickerRemove,
}: BookCardProps) {
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const targetId = `book:${book.id}`;

  const progressPercent = progress 
    ? Math.round((progress.currentPage / progress.totalPages) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          'group relative overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg',
          movingStickerId && 'ring-2 ring-primary/60',
        )}
        onClick={() => {
          if (!movingStickerId) onRead(book);
        }}
      >
        {/* Book Cover */}
        <div className="aspect-4/4 bg-linear-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary)/0.05)_50%,transparent_75%)] bg-size-[200%_200%] animate-shimmer" />
          
          <Book className="w-16 h-16 text-primary/40" />

          {placedSticker && (
            <PlacedSticker
              sticker={placedSticker.sticker}
              corner={placedSticker.placement.corner}
              onMoveRequest={onMoveRequest}
            />
          )}

          <button
            type="button"
            className="absolute bottom-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-md border bg-background/90 text-foreground shadow-sm"
            aria-label="Elegir sticker para este libro"
            title="Elegir sticker para este libro"
            onClick={(event) => {
              event.stopPropagation();
              setShowStickerPicker((visible) => !visible);
            }}
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {showStickerPicker && !movingStickerId && (
            <div
              className="absolute bottom-12 left-2 z-30 max-h-40 w-44 overflow-y-auto rounded-md border bg-card p-2 text-left shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              {ownedStickers.length === 0 ? (
                <p className="p-2 text-xs text-muted-foreground">No tienes stickers todavía.</p>
              ) : (
                ownedStickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      onStickerSelect(sticker.id);
                      setShowStickerPicker(false);
                    }}
                  >
                    <span aria-hidden="true">{sticker.emoji}</span>
                    <span className="truncate">{sticker.name}</span>
                  </button>
                ))
              )}
              {placedSticker && (
                <button
                  type="button"
                  className="mt-1 w-full border-t px-2 pt-2 text-left text-xs text-destructive"
                  onClick={() => {
                    onStickerRemove(placedSticker.sticker.id);
                    setShowStickerPicker(false);
                  }}
                >
                  Quitar sticker
                </button>
              )}
            </div>
          )}

          {movingStickerId && (
            <StickerPlacementTarget
              targetId={targetId}
              label={book.name}
              movingStickerId={movingStickerId}
              placements={placements}
              onPlace={onPlace}
            />
          )}
          
          {/* Progress overlay */}
          {progress && progress.currentPage > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/90 to-transparent p-3">
              <Progress value={progressPercent} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {progressPercent}% completado
              </p>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-medium text-sm line-clamp-2 leading-tight">
                {book.name}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(book.lastReadAt)}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}