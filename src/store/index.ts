import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  AppState, 
  GritLog, 
  WeeklyReview, 
  RewardSetting
} from '../types';
import { 
  generateId, 
  getWeekStartDate,
  formatMonth,
  calculateEnduranceScore,
  calculateWeeklyStats,
  calculateMonthlyStats,
  getLogsForWeek
} from '../utils';

interface GritStore extends AppState {
  // GritLog Actions
  addGritLog: (log: Omit<GritLog, 'id' | 'enduranceScore' | 'createdAt'>) => void;
  updateGritLog: (id: string, updates: Partial<GritLog>) => void;
  deleteGritLog: (id: string) => void;
  getLogsForDateRange: (startDate: string, endDate: string) => GritLog[];
  
  // WeeklyReview Actions
  saveWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;
  getWeeklyReview: (weekStartDate: string) => WeeklyReview | null;
  
  // RewardSetting Actions
  addRewardSetting: (reward: Omit<RewardSetting, 'id' | 'isCompleted' | 'createdAt'>) => void;
  updateRewardSetting: (id: string, updates: Partial<RewardSetting>) => void;
  deleteRewardSetting: (id: string) => void;
  checkAndCompleteRewards: () => void;
  
  // UI Actions
  setCurrentView: (view: AppState['currentView']) => void;
  
  // Statistics Actions
  updateWeeklyStats: (weekStartDate: string) => void;
  updateMonthlyStats: (monthString: string) => void;
  getWeeklyTotalScore: () => number;
  getCumulativeTotalScore: () => number;
  getScoreTrendData: (days: number) => Array<{date: string, score: number, count: number}>;
  getWeeklyRecordCount: () => number;
}

export const useGritStore = create<GritStore>()(
  persist(
    (set, get) => ({
      // Initial State
      gritLogs: [],
      weeklyReviews: [],
      rewardSettings: [],
      currentView: 'dashboard',
      weeklyStats: {},
      monthlyStats: {},
      
      // GritLog Actions
      addGritLog: (logData) => {
        const newLog: GritLog = {
          id: generateId(),
          enduranceScore: calculateEnduranceScore(logData.difficultyScore, logData.enduredTime),
          createdAt: new Date(),
          ...logData,
        };
        
        set(state => ({ 
          gritLogs: [...state.gritLogs, newLog] 
        }));
        
        // 統計を更新
        const weekStartDate = getWeekStartDate(new Date(newLog.date));
        const monthString = formatMonth(new Date(newLog.date));
        get().updateWeeklyStats(weekStartDate);
        get().updateMonthlyStats(monthString);
        
        // ご褒美のチェック
        get().checkAndCompleteRewards();
      },
      
      updateGritLog: (id, updates) => {
        set(state => ({
          gritLogs: state.gritLogs.map(log => {
            if (log.id === id) {
              const updatedLog = { ...log, ...updates };
              // 苦しさスコアまたは時間が更新された場合、耐久スコアを再計算
              if (updates.difficultyScore !== undefined || updates.enduredTime !== undefined) {
                updatedLog.enduranceScore = calculateEnduranceScore(
                  updatedLog.difficultyScore, 
                  updatedLog.enduredTime
                );
              }
              return updatedLog;
            }
            return log;
          })
        }));
        
        // 統計を更新
        const log = get().gritLogs.find(l => l.id === id);
        if (log) {
          const weekStartDate = getWeekStartDate(new Date(log.date));
          const monthString = formatMonth(new Date(log.date));
          get().updateWeeklyStats(weekStartDate);
          get().updateMonthlyStats(monthString);
        }
      },
      
      deleteGritLog: (id) => {
        const log = get().gritLogs.find(l => l.id === id);
        
        set(state => ({
          gritLogs: state.gritLogs.filter(log => log.id !== id)
        }));
        
        // 統計を更新
        if (log) {
          const weekStartDate = getWeekStartDate(new Date(log.date));
          const monthString = formatMonth(new Date(log.date));
          get().updateWeeklyStats(weekStartDate);
          get().updateMonthlyStats(monthString);
        }
      },
      
      getLogsForDateRange: (startDate, endDate) => {
        const state = get();
        return state.gritLogs.filter(log => {
          return log.date >= startDate && log.date <= endDate;
        }).sort((a, b) => b.date.localeCompare(a.date)); // 新しい順
      },
      
      // WeeklyReview Actions
      saveWeeklyReview: (reviewData) => {
        const newReview: WeeklyReview = {
          id: generateId(),
          createdAt: new Date(),
          ...reviewData,
        };
        
        set(state => {
          // 同じ週のレビューが既に存在する場合は更新
          const existingIndex = state.weeklyReviews.findIndex(
            review => review.weekStartDate === newReview.weekStartDate
          );
          
          if (existingIndex >= 0) {
            const updatedReviews = [...state.weeklyReviews];
            updatedReviews[existingIndex] = newReview;
            return { weeklyReviews: updatedReviews };
          }
          
          return { weeklyReviews: [...state.weeklyReviews, newReview] };
        });
      },
      
      getWeeklyReview: (weekStartDate) => {
        const state = get();
        return state.weeklyReviews.find(review => review.weekStartDate === weekStartDate) || null;
      },
      
      // RewardSetting Actions
      addRewardSetting: (rewardData) => {
        const newReward: RewardSetting = {
          id: generateId(),
          isCompleted: false,
          createdAt: new Date(),
          ...rewardData,
        };
        
        set(state => ({ 
          rewardSettings: [...state.rewardSettings, newReward] 
        }));
      },
      
      updateRewardSetting: (id, updates) => {
        set(state => ({
          rewardSettings: state.rewardSettings.map(reward => 
            reward.id === id ? { ...reward, ...updates } : reward
          )
        }));
      },
      
      deleteRewardSetting: (id) => {
        set(state => ({
          rewardSettings: state.rewardSettings.filter(reward => reward.id !== id)
        }));
      },
      
      checkAndCompleteRewards: () => {
        const state = get();
        const cumulativeScore = get().getCumulativeTotalScore();
        
        const updatedRewards = state.rewardSettings.map(reward => {
          if (!reward.isCompleted && cumulativeScore >= reward.targetScore) {
            return { ...reward, isCompleted: true, completedAt: new Date() };
          }
          return reward;
        });
        
        set({ rewardSettings: updatedRewards });
      },
      
      // UI Actions
      setCurrentView: (view) => {
        set({ currentView: view });
      },
      
      // Statistics Actions
      updateWeeklyStats: (weekStartDate) => {
        const state = get();
        const stats = calculateWeeklyStats(state.gritLogs, weekStartDate);
        set(prevState => ({
          weeklyStats: {
            ...prevState.weeklyStats,
            [weekStartDate]: stats
          }
        }));
      },
      
      updateMonthlyStats: (monthString) => {
        const state = get();
        const stats = calculateMonthlyStats(state.gritLogs, monthString);
        set(prevState => ({
          monthlyStats: {
            ...prevState.monthlyStats,
            [monthString]: stats
          }
        }));
      },
      
      getWeeklyTotalScore: () => {
        const state = get();
        const today = new Date();
        const thisWeekStart = getWeekStartDate(today);
        const weekLogs = getLogsForWeek(state.gritLogs, thisWeekStart);
        return weekLogs.reduce((total, log) => total + log.enduranceScore, 0);
      },
      
      getCumulativeTotalScore: () => {
        const state = get();
        return state.gritLogs.reduce((total, log) => total + log.enduranceScore, 0);
      },
      
      getScoreTrendData: (days) => {
        const state = get();
        const today = new Date();
        const trendData = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const dayLogs = state.gritLogs.filter(log => log.date === dateString);
          const dayScore = dayLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
          
          trendData.push({
            date: dateString,
            score: dayScore,
            count: dayLogs.length
          });
        }
        
        return trendData;
      },
      
      getWeeklyRecordCount: () => {
        const state = get();
        const today = new Date();
        const thisWeekStart = getWeekStartDate(today);
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
        
        return state.gritLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= new Date(thisWeekStart) && logDate <= thisWeekEnd;
        }).length;
      },
    }),
    {
      name: 'grit-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gritLogs: state.gritLogs,
        weeklyReviews: state.weeklyReviews,
        rewardSettings: state.rewardSettings,
        weeklyStats: state.weeklyStats,
        monthlyStats: state.monthlyStats,
      }),
    }
  )
);