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
  getWeeklyAverageValueAlignment: () => number;
  getWeeklyAverageDifficulty: () => number;
  getValueAlignmentTrendData: (days: number) => Array<{date: string, score: number, valueAlignment: number, count: number}>;
  
  // Debug and Recovery Actions
  resetAllData: () => void;
  clearLocalStorage: () => void;
  
  // Data Import/Export Actions
  exportData: () => string;
  importData: (jsonData: string) => boolean;
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
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
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
        const weekLogs = getLogsForWeek(state.gritLogs, thisWeekStart);
        return weekLogs.length;
      },
      
      getWeeklyAverageValueAlignment: () => {
        const state = get();
        const today = new Date();
        const thisWeekStart = getWeekStartDate(today);
        const weekLogs = getLogsForWeek(state.gritLogs, thisWeekStart);
        
        const logsWithValueAlignment = weekLogs.filter(log => log.valueAlignment !== undefined);
        if (logsWithValueAlignment.length === 0) return 0;
        
        const total = logsWithValueAlignment.reduce((sum, log) => sum + (log.valueAlignment || 0), 0);
        return Number((total / logsWithValueAlignment.length).toFixed(1));
      },
      
      getWeeklyAverageDifficulty: () => {
        const state = get();
        const today = new Date();
        const thisWeekStart = getWeekStartDate(today);
        const weekLogs = getLogsForWeek(state.gritLogs, thisWeekStart);
        
        if (weekLogs.length === 0) return 0;
        
        const total = weekLogs.reduce((sum, log) => sum + log.difficultyScore, 0);
        return Number((total / weekLogs.length).toFixed(1));
      },
      
      getValueAlignmentTrendData: (days) => {
        const state = get();
        const today = new Date();
        const trendData = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          const dayLogs = state.gritLogs.filter(log => log.date === dateString);
          const dayScore = dayLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
          
          const logsWithValueAlignment = dayLogs.filter(log => log.valueAlignment !== undefined);
          const avgValueAlignment = logsWithValueAlignment.length > 0
            ? logsWithValueAlignment.reduce((sum, log) => sum + (log.valueAlignment || 0), 0) / logsWithValueAlignment.length
            : 0;
          
          trendData.push({
            date: dateString,
            score: dayScore,
            valueAlignment: Number(avgValueAlignment.toFixed(1)),
            count: dayLogs.length
          });
        }
        
        return trendData;
      },
      
      // Debug and Recovery Actions
      resetAllData: () => {
        set({
          gritLogs: [],
          weeklyReviews: [],
          rewardSettings: [],
          currentView: 'dashboard',
          weeklyStats: {},
          monthlyStats: {},
        });
      },
      
      clearLocalStorage: () => {
        localStorage.removeItem('grit-tracker-storage');
        window.location.reload();
      },
      
      // Data Import/Export Actions
      exportData: () => {
        const state = get();
        const exportData = {
          gritLogs: state.gritLogs,
          weeklyReviews: state.weeklyReviews,
          rewardSettings: state.rewardSettings,
          weeklyStats: state.weeklyStats,
          monthlyStats: state.monthlyStats,
          exportedAt: new Date().toISOString(),
          version: '2.0'
        };
        return JSON.stringify(exportData, null, 2);
      },
      
      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          
          // データ形式の検証
          if (!data.gritLogs || !Array.isArray(data.gritLogs)) {
            throw new Error('無効なデータ形式です');
          }
          
          // データの変換（日付文字列をDateオブジェクトに）
          const convertedData = {
            gritLogs: data.gritLogs.map((log: any) => ({
              ...log,
              createdAt: new Date(log.createdAt)
            })),
            weeklyReviews: data.weeklyReviews?.map((review: any) => ({
              ...review,
              createdAt: new Date(review.createdAt)
            })) || [],
            rewardSettings: data.rewardSettings?.map((reward: any) => ({
              ...reward,
              createdAt: new Date(reward.createdAt),
              completedAt: reward.completedAt ? new Date(reward.completedAt) : undefined
            })) || [],
            weeklyStats: data.weeklyStats || {},
            monthlyStats: data.monthlyStats || {}
          };
          
          // stateを更新
          set({
            gritLogs: convertedData.gritLogs,
            weeklyReviews: convertedData.weeklyReviews,
            rewardSettings: convertedData.rewardSettings,
            weeklyStats: convertedData.weeklyStats,
            monthlyStats: convertedData.monthlyStats
          });
          
          return true;
        } catch (error) {
          console.error('データインポートエラー:', error);
          return false;
        }
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