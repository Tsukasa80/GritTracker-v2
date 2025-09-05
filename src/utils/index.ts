import { GritLog } from '../types';

// ID生成
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 日付フォーマット関数
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// 今日の日付を取得
export const getTodayDate = (): string => {
  return formatDate(new Date());
};

// 週の開始日（月曜日）を取得
export const getWeekStartDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始にする
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

// 週の終了日（日曜日）を取得
export const getWeekEndDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // 日曜日を週の終了にする
  const sunday = new Date(d.setDate(diff));
  return formatDate(sunday);
};

// 月のフォーマット
export const formatMonth = (date: Date): string => {
  return date.toISOString().substr(0, 7); // YYYY-MM
};

// 耐久スコア計算
export const calculateEnduranceScore = (difficultyScore: number, enduredTime: number): number => {
  return difficultyScore * enduredTime;
};

// 週のGritLogsを取得
export const getLogsForWeek = (logs: GritLog[], weekStartDate: string): GritLog[] => {
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 6日後が週末

  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
};

// 今週のGritLogsを取得
export const getThisWeekLogs = (logs: GritLog[]): GritLog[] => {
  const today = new Date();
  const thisWeekStart = getWeekStartDate(today);
  return getLogsForWeek(logs, thisWeekStart);
};

// 月のGritLogsを取得
export const getLogsForMonth = (logs: GritLog[], monthString: string): GritLog[] => {
  return logs.filter(log => log.date.startsWith(monthString));
};

// 今週の合計耐久スコアを計算
export const calculateWeeklyTotalScore = (logs: GritLog[]): number => {
  const thisWeekLogs = getThisWeekLogs(logs);
  return thisWeekLogs.reduce((total, log) => total + log.enduranceScore, 0);
};

// 累計耐久スコアを計算
export const calculateCumulativeTotalScore = (logs: GritLog[]): number => {
  return logs.reduce((total, log) => total + log.enduranceScore, 0);
};

// 週の統計を計算
export const calculateWeeklyStats = (logs: GritLog[], weekStartDate: string) => {
  const weekLogs = getLogsForWeek(logs, weekStartDate);
  
  if (weekLogs.length === 0) {
    return {
      weekStartDate,
      totalEnduranceScore: 0,
      totalLogs: 0,
      averageDifficulty: 0,
      totalMinutes: 0,
    };
  }

  const totalEnduranceScore = weekLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
  const totalMinutes = weekLogs.reduce((sum, log) => sum + log.enduredTime, 0);
  const averageDifficulty = weekLogs.reduce((sum, log) => sum + log.difficultyScore, 0) / weekLogs.length;

  return {
    weekStartDate,
    totalEnduranceScore,
    totalLogs: weekLogs.length,
    averageDifficulty: Math.round(averageDifficulty * 10) / 10, // 小数点1桁まで
    totalMinutes,
  };
};

// 月の統計を計算
export const calculateMonthlyStats = (logs: GritLog[], monthString: string) => {
  const monthLogs = getLogsForMonth(logs, monthString);
  
  if (monthLogs.length === 0) {
    return {
      month: monthString,
      totalEnduranceScore: 0,
      totalLogs: 0,
      averageDifficulty: 0,
      totalMinutes: 0,
    };
  }

  const totalEnduranceScore = monthLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
  const totalMinutes = monthLogs.reduce((sum, log) => sum + log.enduredTime, 0);
  const averageDifficulty = monthLogs.reduce((sum, log) => sum + log.difficultyScore, 0) / monthLogs.length;

  return {
    month: monthString,
    totalEnduranceScore,
    totalLogs: monthLogs.length,
    averageDifficulty: Math.round(averageDifficulty * 10) / 10,
    totalMinutes,
  };
};

// 時間のフォーマット（分 -> 時間と分）
export const formatTimeFromMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }
  
  return `${hours}時間${remainingMinutes}分`;
};