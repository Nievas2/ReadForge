import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { UserStats } from '@/types';

interface StatsCardsProps {
  stats: UserStats;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const dailyGoalPercent = Math.min(
    100,
    Math.round((stats.todayReadingTime / 60 / stats.dailyGoalMinutes) * 100)
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Daily Goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatTime(stats.todayReadingTime)}
              <span className="text-sm font-normal text-muted-foreground">
                / {stats.dailyGoalMinutes}m
              </span>
            </div>
            <Progress value={dailyGoalPercent} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Reading Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalReadingTime)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pages Read */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Pages Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPagesRead.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Books Completed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBooksCompleted}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}