import React, { useState, useMemo } from 'react';
import { useGritStore } from '../store';
import { getWeekStartDate, getWeekEndDate, getLogsForWeek, formatTimeFromMinutes } from '../utils';
import { FaStar, FaSave, FaCalendarWeek, FaChartBar, FaClock, FaClipboardList } from 'react-icons/fa';

const WeeklyReview: React.FC = () => {
  const { gritLogs, saveWeeklyReview, getWeeklyReview } = useGritStore();
  
  // 今週の日付を計算
  const today = new Date();
  const thisWeekStart = getWeekStartDate(today);
  const thisWeekEnd = getWeekEndDate(today);
  
  // 今週のログを取得
  const thisWeekLogs = useMemo(() => {
    return getLogsForWeek(gritLogs, thisWeekStart)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gritLogs, thisWeekStart]);

  // 既存のレビューを取得
  const existingReview = getWeeklyReview(thisWeekStart);

  const [selectedBestLogs, setSelectedBestLogs] = useState<string[]>(
    existingReview?.bestOfWeek || []
  );
  const [reflections, setReflections] = useState({
    emotions: existingReview?.reflections.emotions || '',
    results: existingReview?.reflections.results || '',
    messageToSelf: existingReview?.reflections.messageToSelf || '',
  });

  // ベスト3選択のハンドラー
  const toggleBestLog = (logId: string) => {
    setSelectedBestLogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      } else if (prev.length < 3) {
        return [...prev, logId];
      } else {
        // 既に3つ選択されている場合は、最初のものを置き換え
        return [prev[1], prev[2], logId];
      }
    });
  };

  const handleSave = () => {
    if (reflections.emotions.trim() && reflections.results.trim() && reflections.messageToSelf.trim()) {
      saveWeeklyReview({
        weekStartDate: thisWeekStart,
        weekEndDate: thisWeekEnd,
        bestOfWeek: selectedBestLogs,
        reflections,
      });
      alert('週次振り返りを保存しました！🎉 お疲れさまでした！');
    } else {
      alert('すべての振り返り項目を入力してください。');
    }
  };

  // 今週の統計
  const weekStats = useMemo(() => {
    const totalScore = thisWeekLogs.reduce((sum, log) => sum + log.enduranceScore, 0);
    const totalTime = thisWeekLogs.reduce((sum, log) => sum + log.enduredTime, 0);
    const avgDifficulty = thisWeekLogs.length > 0 
      ? thisWeekLogs.reduce((sum, log) => sum + log.difficultyScore, 0) / thisWeekLogs.length 
      : 0;
    
    return { totalScore, totalTime, avgDifficulty: Math.round(avgDifficulty * 10) / 10 };
  }, [thisWeekLogs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 to-endurance-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* ヘッダー - スターバックス風 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-grit-500 to-grit-600 rounded-full mb-4 shadow-lg">
            <FaClipboardList className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-wide text-grit-800">
            週次振り返り
          </h1>
          <p className="text-grit-600 text-lg font-medium mb-4">
            {thisWeekStart} 〜 {thisWeekEnd}
          </p>
          <p className="text-grit-600">
            この週の「粘り」を振り返り、成長を実感しましょう
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-grit-500 to-endurance-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 今週の統計 - スターバックス風 */}
        <div className="bg-gradient-to-r from-white to-endurance-50 p-8 rounded-3xl shadow-xl border border-grit-200">
          <h2 className="text-2xl font-bold text-grit-800 mb-6 flex items-center">
            <FaChartBar className="mr-3 text-grit-600" />
            今週の成果
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-white/80 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-grit-600">{thisWeekLogs.length}</div>
              <div className="text-sm text-grit-700 font-medium">記録数</div>
            </div>
            <div className="text-center bg-white/80 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-endurance-600">{weekStats.totalScore}</div>
              <div className="text-sm text-grit-700 font-medium">合計耐久スコア</div>
            </div>
            <div className="text-center bg-white/80 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-grit-600">{formatTimeFromMinutes(weekStats.totalTime)}</div>
              <div className="text-sm text-grit-700 font-medium">合計粘り時間</div>
            </div>
            <div className="text-center bg-white/80 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-endurance-600">{weekStats.avgDifficulty}</div>
              <div className="text-sm text-grit-700 font-medium">平均苦しさ</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム: ログ一覧とベスト3選択 */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
              <h2 className="text-2xl font-bold text-grit-800 mb-6 flex items-center">
                <FaCalendarWeek className="mr-3 text-grit-600" />
                今週の記録一覧
              </h2>
              
              {thisWeekLogs.length === 0 ? (
                <div className="text-center py-12 text-grit-600">
                  <div className="w-16 h-16 bg-gradient-to-br from-grit-100 to-endurance-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-lg font-semibold mb-2">今週はまだ記録がありません</p>
                  <p className="text-sm">記録を作成してから振り返りを行いましょう！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {thisWeekLogs.map((log) => (
                    <div 
                      key={log.id}
                      onClick={() => toggleBestLog(log.id)}
                      className={`border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                        selectedBestLogs.includes(log.id)
                          ? 'border-grit-500 bg-gradient-to-r from-grit-50 to-endurance-50 shadow-md'
                          : 'border-grit-200 hover:border-grit-300 bg-white/80'
                      }`}
                    >
                      <>
                        {/* デスクトップレイアウト */}
                        <div className="hidden sm:flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                                selectedBestLogs.includes(log.id)
                                  ? 'border-grit-500 bg-grit-500 text-white'
                                  : 'border-grit-300 text-grit-500'
                              }`}>
                                {selectedBestLogs.includes(log.id) ? (
                                  selectedBestLogs.indexOf(log.id) + 1
                                ) : (
                                  '+'
                                )}
                              </div>
                              <h3 className="font-bold text-grit-800 text-lg">{log.taskName}</h3>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-grit-600 mb-3 ml-11">
                              <span className="flex items-center space-x-1">
                                <FaCalendarWeek className="text-grit-500" />
                                <span className="font-medium">{log.date}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FaClock className="text-endurance-500" />
                                <span className="font-medium">{formatTimeFromMinutes(log.enduredTime)}</span>
                              </span>
                              <span className="bg-grit-100 text-grit-700 px-3 py-1 rounded-full font-semibold">
                                苦しさ: {log.difficultyScore}/10
                              </span>
                              {log.wasSuccessful !== undefined && (
                                <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                                  log.wasSuccessful ? 'bg-green-100 text-green-700' : 'bg-endurance-100 text-endurance-700'
                                }`}>
                                  {log.wasSuccessful ? '✅ 完了' : '💪 途中'}
                                </span>
                              )}
                            </div>
                            
                            {log.details && (
                              <p className="text-sm text-grit-700 italic bg-endurance-50 p-3 rounded-lg border-l-4 border-endurance-500 ml-11">
                                "{log.details}"
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-6">
                            <div className="bg-gradient-to-br from-grit-500 to-grit-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                              <div className="text-center">
                                <div className="text-lg font-bold">{log.enduranceScore}</div>
                                <div className="text-xs opacity-90">pt</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* モバイルレイアウト */}
                        <div className="sm:hidden space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                                selectedBestLogs.includes(log.id)
                                  ? 'border-grit-500 bg-grit-500 text-white'
                                  : 'border-grit-300 text-grit-500'
                              }`}>
                                {selectedBestLogs.includes(log.id) ? (
                                  selectedBestLogs.indexOf(log.id) + 1
                                ) : (
                                  '+'
                                )}
                              </div>
                              <h3 className="font-bold text-grit-800 text-lg">{log.taskName}</h3>
                            </div>
                            {/* 耐久スコア */}
                            <div className="bg-gradient-to-br from-grit-500 to-grit-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ml-3">
                              <div className="text-center">
                                <div className="text-sm font-bold">{log.enduranceScore}</div>
                                <div className="text-xs opacity-90">pt</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm text-grit-600">
                            <span className="flex items-center space-x-1">
                              <FaCalendarWeek className="text-grit-500" />
                              <span className="font-medium">{log.date}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaClock className="text-endurance-500" />
                              <span className="font-medium">{formatTimeFromMinutes(log.enduredTime)}</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-grit-100 text-grit-700 px-3 py-1 rounded-full font-semibold text-sm">
                              苦しさ: {log.difficultyScore}/10
                            </span>
                            {log.wasSuccessful !== undefined && (
                              <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                                log.wasSuccessful ? 'bg-green-100 text-green-700' : 'bg-endurance-100 text-endurance-700'
                              }`}>
                                {log.wasSuccessful ? '✅ 完了' : '💪 途中'}
                              </span>
                            )}
                          </div>
                          
                          {log.details && (
                            <p className="text-sm text-grit-700 italic bg-endurance-50 p-3 rounded-lg border-l-4 border-endurance-500">
                              "{log.details}"
                            </p>
                          )}
                        </div>
                      </>
                    </div>
                  ))}
                </div>
              )}
              
              {thisWeekLogs.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-endurance-50 to-grit-50 border border-endurance-200 rounded-2xl">
                  <div className="flex items-center text-sm text-grit-800">
                    <FaStar className="mr-2 text-endurance-600" />
                    <span className="font-semibold">
                      今週のベスト粘りTOP3を選択してください 
                      ({selectedBestLogs.length}/3)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: 振り返り質問 */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
              <h2 className="text-2xl font-bold text-grit-800 mb-8 flex items-center">
                <FaStar className="mr-3 text-endurance-600" />
                振り返りの問い
              </h2>
              
              <div className="space-y-8">
                {/* 質問1 */}
                <div>
                  <label className="block text-sm font-bold text-grit-800 mb-3">
                    💭 今週、どんな感情と闘ったか？
                  </label>
                  <textarea
                    value={reflections.emotions}
                    onChange={(e) => setReflections({ ...reflections, emotions: e.target.value })}
                    placeholder="不安、焦り、諦めたい気持ち、面倒くささなど、どんな感情と向き合いましたか？"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                  />
                </div>

                {/* 質問2 */}
                <div>
                  <label className="block text-sm font-bold text-grit-800 mb-3">
                    🌱 粘った後、どんなことが起きたか？
                  </label>
                  <textarea
                    value={reflections.results}
                    onChange={(e) => setReflections({ ...reflections, results: e.target.value })}
                    placeholder="成長の実感、達成感、新しい発見、周囲の反応など、粘った結果どんな変化がありましたか？"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                  />
                </div>

                {/* 質問3 */}
                <div>
                  <label className="block text-sm font-bold text-grit-800 mb-3">
                    🎯 「粘った過去の自分」に、今どう言いたいか？
                  </label>
                  <textarea
                    value={reflections.messageToSelf}
                    onChange={(e) => setReflections({ ...reflections, messageToSelf: e.target.value })}
                    placeholder="頑張った自分に対する感謝、励まし、アドバイスなど、どんな言葉をかけたいですか？"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                  />
                </div>

                {/* 保存ボタン */}
                <button
                  onClick={handleSave}
                  disabled={thisWeekLogs.length === 0}
                  className="w-full bg-gradient-to-r from-grit-500 to-grit-600 text-white font-bold py-4 px-8 rounded-xl hover:from-grit-600 hover:to-grit-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <FaSave className="text-xl" />
                  <span>振り返りを保存する</span>
                </button>

                {existingReview && (
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-grit-50 rounded-2xl border border-green-200">
                    <p className="text-sm text-green-700 font-semibold">
                      ✅ この週の振り返りは保存済みです
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 励ましメッセージ */}
        <div className="bg-gradient-to-r from-grit-50 via-white to-endurance-50 p-8 rounded-3xl border border-grit-200 text-center shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-grit-400 to-endurance-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-2xl font-bold text-grit-800 mb-4">
            振り返りは成長への第一歩
          </h3>
          <p className="text-grit-700 text-lg leading-relaxed max-w-2xl mx-auto">
            過去の自分の努力を認め、感謝することで、未来への原動力が生まれます。
            毎週の小さな振り返りが、大きな成長につながっていきます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;