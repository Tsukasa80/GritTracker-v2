// GritTracker Types
export interface GritLog {
  id: string;
  date: string; // YYYY-MM-DD format
  taskName: string;
  difficultyScore: number; // 1-10
  enduredTime: number; // minutes
  enduranceScore: number; // difficultyScore * enduredTime
  details?: string;
  wasSuccessful?: boolean;
  createdAt: Date;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD format (Monday)
  weekEndDate: string; // YYYY-MM-DD format (Sunday)
  bestOfWeek: string[]; // Array of GritLog IDs (top 3)
  reflections: {
    emotions: string; // 今週、どんな感情と闘ったか？
    results: string; // 粘った後、どんなことが起きたか？
    messageToSelf: string; // 「粘った過去の自分」に、今どう言いたいか？
  };
  createdAt: Date;
}

export interface RewardSetting {
  id: string;
  targetScore: number;
  rewardContent: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

// Statistics interfaces
export interface WeeklyStats {
  weekStartDate: string;
  totalEnduranceScore: number;
  totalLogs: number;
  averageDifficulty: number;
  totalMinutes: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalEnduranceScore: number;
  totalLogs: number;
  averageDifficulty: number;
  totalMinutes: number;
}

// App State
export interface AppState {
  // GritTracker State
  gritLogs: GritLog[];
  weeklyReviews: WeeklyReview[];
  rewardSettings: RewardSetting[];
  
  // UI State
  currentView: 'dashboard' | 'record' | 'review' | 'review-history' | 'rewards';
  
  // Statistics Cache
  weeklyStats: Record<string, WeeklyStats>; // weekStartDate -> stats
  monthlyStats: Record<string, MonthlyStats>; // YYYY-MM -> stats
}