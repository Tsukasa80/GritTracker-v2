import React, { useState, useMemo } from 'react';
import { useGritStore } from '../store';
import { formatTimeFromMinutes, getWeekEndDate } from '../utils';
import { FaCalendarAlt, FaChartBar, FaEye, FaList, FaArrowLeft, FaStar, FaClock, FaClipboardList } from 'react-icons/fa';

const WeeklyReviewHistory: React.FC = () => {
  const { weeklyReviews, gritLogs } = useGritStore();
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  // 週次振返り記録を日付順にソート（新しい順）
  const sortedReviews = useMemo(() => {
    return [...weeklyReviews].sort((a, b) => 
      new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
    );
  }, [weeklyReviews]);

  // 選択された振返りの詳細情報を取得
  const selectedReviewDetails = useMemo(() => {
    if (!selectedReview) return null;
    
    const review = weeklyReviews.find(r => r.id === selectedReview);
    if (!review) return null;

    // その週のログを取得
    const weekStart = new Date(review.weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekLogs = gritLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    const bestLogs = review.bestOfWeek.map(logId => 
      weekLogs.find(log => log.id === logId)
    ).filter((log): log is NonNullable<typeof log> => log !== undefined);

    // 統計計算
    const totalScore = weekLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
    const totalTime = weekLogs.reduce((sum, log) => sum + log.enduredTime, 0);
    const avgDifficulty = weekLogs.length > 0 
      ? weekLogs.reduce((sum, log) => sum + log.difficultyScore, 0) / weekLogs.length 
      : 0;

    return {
      review,
      weekLogs,
      bestLogs,
      stats: {
        totalScore,
        totalTime,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        totalRecords: weekLogs.length
      }
    };
  }, [selectedReview, weeklyReviews, gritLogs]);

  if (selectedReviewDetails) {
    const { review, bestLogs, stats } = selectedReviewDetails;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-grit-50 to-endurance-50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* 戻るボタンとヘッダー */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedReview(null)}
              className="flex items-center space-x-2 px-4 py-2 text-grit-600 hover:text-grit-800 hover:bg-grit-100 rounded-xl transition-colors"
            >
              <FaArrowLeft />
              <span>一覧に戻る</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-grit-800">振返り詳細</h1>
              <p className="text-grit-600">
                {review.weekStartDate} 〜 {getWeekEndDate(new Date(review.weekStartDate))}
              </p>
            </div>
            
            <div className="w-20" />
          </div>

          {/* 統計サマリー */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-grit-200">
            <h2 className="text-xl font-bold text-grit-800 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-grit-600" />
              週間統計
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-grit-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-grit-600">{stats.totalRecords}</div>
                <div className="text-sm text-grit-700">記録数</div>
              </div>
              <div className="text-center bg-endurance-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-endurance-600">{stats.totalScore}</div>
                <div className="text-sm text-grit-700">耐久スコア</div>
              </div>
              <div className="text-center bg-grit-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-grit-600">{formatTimeFromMinutes(stats.totalTime)}</div>
                <div className="text-sm text-grit-700">粘り時間</div>
              </div>
              <div className="text-center bg-endurance-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-endurance-600">{stats.avgDifficulty}</div>
                <div className="text-sm text-grit-700">平均苦しさ</div>
              </div>
            </div>
          </div>

          {/* ベスト3記録 */}
          {bestLogs.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-grit-200">
              <h2 className="text-xl font-bold text-grit-800 mb-4 flex items-center">
                <FaStar className="mr-2 text-endurance-600" />
                今週のベスト粘り TOP3
              </h2>
              <div className="space-y-3">
                {bestLogs.map((log, index) => (
                  <div key={log.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-grit-50 to-endurance-50 rounded-xl border border-grit-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-grit-500 to-grit-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-grit-800">{log.taskName}</h3>
                      <p className="text-sm text-grit-600">
                        {log.date} • {formatTimeFromMinutes(log.enduredTime)} • 苦しさ {log.difficultyScore}/10
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-endurance-600">{log.enduranceScore}pt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 振返りの回答 */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-grit-200">
            <h2 className="text-xl font-bold text-grit-800 mb-6 flex items-center">
              <FaClipboardList className="mr-2 text-grit-600" />
              振返りの記録
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-grit-800 mb-2">💭 今週、どんな感情と闘ったか？</h3>
                <div className="p-4 bg-grit-50 rounded-xl border-l-4 border-grit-500">
                  <p className="text-grit-700">{review.reflections.emotions}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-grit-800 mb-2">🌱 粘った後、どんなことが起きたか？</h3>
                <div className="p-4 bg-endurance-50 rounded-xl border-l-4 border-endurance-500">
                  <p className="text-grit-700">{review.reflections.results}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-grit-800 mb-2">🎯 「粘った過去の自分」に、今どう言いたいか？</h3>
                <div className="p-4 bg-grit-50 rounded-xl border-l-4 border-grit-500">
                  <p className="text-grit-700">{review.reflections.messageToSelf}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-grit-500 text-center">
              記録作成日: {new Date(review.createdAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 to-endurance-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* ヘッダー */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-grit-500 to-grit-600 rounded-full mb-4 shadow-lg">
            <FaList className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-wide text-grit-800">
            週次振返り履歴
          </h1>
          <p className="text-grit-600">
            これまでの振返り記録を確認できます
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-grit-500 to-endurance-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 記録一覧 */}
        {sortedReviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-grit-100 to-endurance-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="text-3xl text-grit-400" />
            </div>
            <h3 className="text-2xl font-bold text-grit-800 mb-4">
              まだ振返り記録がありません
            </h3>
            <p className="text-grit-600 mb-6">
              週次振返りページで振返りを作成してみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-grit-800">
                振返り記録 ({sortedReviews.length}件)
              </h2>
            </div>

            {sortedReviews.map((review) => {
              // その週のログ統計を計算
              const weekStart = new Date(review.weekStartDate);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              
              const weekLogs = gritLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= weekStart && logDate <= weekEnd;
              });

              const totalScore = weekLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
              const totalTime = weekLogs.reduce((sum, log) => sum + log.enduredTime, 0);

              return (
                <div
                  key={review.id}
                  className="bg-white/90 backdrop-blur-sm border border-grit-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedReview(review.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FaCalendarAlt className="text-grit-600" />
                        <h3 className="text-lg font-bold text-grit-800">
                          {review.weekStartDate} 〜 {getWeekEndDate(new Date(review.weekStartDate))}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-grit-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <FaList className="text-grit-500" />
                          <span>{weekLogs.length}件の記録</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaClock className="text-endurance-500" />
                          <span>{formatTimeFromMinutes(totalTime)}</span>
                        </span>
                        <span className="bg-grit-100 text-grit-700 px-3 py-1 rounded-full font-semibold">
                          {totalScore}pt
                        </span>
                        {review.bestOfWeek.length > 0 && (
                          <span className="bg-endurance-100 text-endurance-700 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                            <FaStar className="text-xs" />
                            <span>TOP{review.bestOfWeek.length}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-grit-500">
                        作成日: {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-grit-500 to-grit-600 text-white rounded-xl hover:from-grit-600 hover:to-grit-700 transition-all">
                        <FaEye />
                        <span>詳細を見る</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReviewHistory;