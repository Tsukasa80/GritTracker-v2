import React, { useMemo, useState } from 'react';
import { useGritStore } from '../store';
import { FaTrophy, FaGift, FaCalendar, FaClock, FaEdit, FaTrash, FaCheck, FaTimes, FaChartLine } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const { 
    gritLogs, 
    rewardSettings, 
    getWeeklyTotalScore, 
    getCumulativeTotalScore,
    getScoreTrendData,
    getWeeklyRecordCount,
    updateGritLog,
    deleteGritLog
  } = useGritStore();
  
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    taskName: string;
    difficultyScore: number;
    enduredTime: number;
    details: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 今週と累計のスコア
  const weeklyTotalScore = getWeeklyTotalScore();
  const cumulativeTotalScore = getCumulativeTotalScore();
  const weeklyRecordCount = getWeeklyRecordCount();

  // 耐久スコアの推移データ（過去7日間）
  const trendData = useMemo(() => {
    return getScoreTrendData(7);
  }, [getScoreTrendData, gritLogs]);

  // 最近のログ（直近5件）
  const recentLogs = useMemo(() => {
    return [...gritLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [gritLogs]);

  // 完了していない最も近いご褒美
  const nextReward = useMemo(() => {
    return rewardSettings
      .filter(reward => !reward.isCompleted)
      .sort((a, b) => a.targetScore - b.targetScore)[0];
  }, [rewardSettings]);

  // ご褒美の進捗率
  const rewardProgress = nextReward 
    ? Math.min((cumulativeTotalScore / nextReward.targetScore) * 100, 100)
    : 0;

  // 編集開始
  const handleStartEdit = (log: any) => {
    setEditingLog(log.id);
    setEditingData({
      taskName: log.taskName,
      difficultyScore: log.difficultyScore,
      enduredTime: log.enduredTime,
      details: log.details || '',
    });
  };

  // 編集保存
  const handleSaveEdit = () => {
    if (editingLog && editingData) {
      updateGritLog(editingLog, editingData);
      setEditingLog(null);
      setEditingData(null);
    }
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingLog(null);
    setEditingData(null);
  };

  // 削除確認
  const handleDeleteConfirm = (logId: string) => {
    deleteGritLog(logId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 via-neutral-50 to-accent-light">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* ヘッダー */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-grit-500 to-grit-600 rounded-full mb-4 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          <div className="text-4xl font-bold mb-3 tracking-wide text-grit-700 text-center">
            <div className="leading-tight">GritTracker</div>
            <div className="leading-tight">ダッシュボード</div>
          </div>
          <p className="text-grit-600 text-lg font-medium">あなたの粘り力を可視化して、成長を実感しましょう</p>
          <div className="w-24 h-1 bg-gradient-to-r from-grit-500 to-grit-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* メインスタッツ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 今週の合計耐久スコア */}
          <div className="bg-white/80 backdrop-blur-sm border border-grit-200 p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* デスクトップレイアウト */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-grit-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-grit-800">今週の耐久スコア</h3>
                </div>
                <p className="text-3xl font-bold text-grit-700 mb-1">{weeklyTotalScore.toLocaleString()}</p>
                <p className="text-grit-600 text-xs font-medium">ポイント</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-grit-400 to-grit-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaCalendar className="text-lg text-white" />
              </div>
            </div>
            
            {/* モバイルレイアウト */}
            <div className="sm:hidden text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-grit-400 to-grit-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
                <FaCalendar className="text-lg text-white" />
              </div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-grit-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-grit-800">今週の耐久スコア</h3>
              </div>
              <p className="text-2xl font-bold text-grit-700 mb-1">{weeklyTotalScore.toLocaleString()}</p>
              <p className="text-grit-600 text-xs font-medium">ポイント</p>
            </div>
          </div>

          {/* 累計耐久スコア */}
          <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* デスクトップレイアウト */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-neutral-700 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-neutral-800">累計耐久スコア</h3>
                </div>
                <p className="text-3xl font-bold text-neutral-700 mb-1">{cumulativeTotalScore.toLocaleString()}</p>
                <p className="text-neutral-600 text-xs font-medium">総ポイント</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaTrophy className="text-lg text-white" />
              </div>
            </div>
            
            {/* モバイルレイアウト */}
            <div className="sm:hidden text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
                <FaTrophy className="text-lg text-white" />
              </div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-neutral-700 rounded-full"></div>
                <h3 className="text-sm font-semibold text-neutral-800">累計耐久スコア</h3>
              </div>
              <p className="text-2xl font-bold text-neutral-700 mb-1">{cumulativeTotalScore.toLocaleString()}</p>
              <p className="text-neutral-600 text-xs font-medium">総ポイント</p>
            </div>
          </div>

          {/* 今週の記録数 */}
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* デスクトップレイアウト */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-blue-800">今週の記録数</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-1">{weeklyRecordCount}</p>
                <p className="text-blue-600 text-xs font-medium">件</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaCalendar className="text-lg text-white" />
              </div>
            </div>
            
            {/* モバイルレイアウト */}
            <div className="sm:hidden text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
                <FaCalendar className="text-lg text-white" />
              </div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-blue-800">今週の記録数</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700 mb-1">{weeklyRecordCount}</p>
              <p className="text-blue-600 text-xs font-medium">件</p>
            </div>
          </div>

          {/* 平均耐久スコア */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200 p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* デスクトップレイアウト */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-purple-800">1件あたり平均</h3>
                </div>
                <p className="text-3xl font-bold text-purple-700 mb-1">
                  {weeklyRecordCount > 0 ? Math.round(weeklyTotalScore / weeklyRecordCount) : 0}
                </p>
                <p className="text-purple-600 text-xs font-medium">ポイント</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-lg text-white" />
              </div>
            </div>
            
            {/* モバイルレイアウト */}
            <div className="sm:hidden text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
                <FaChartLine className="text-lg text-white" />
              </div>
              <div className="inline-flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-purple-800">1件あたり平均</h3>
              </div>
              <p className="text-2xl font-bold text-purple-700 mb-1">
                {weeklyRecordCount > 0 ? Math.round(weeklyTotalScore / weeklyRecordCount) : 0}
              </p>
              <p className="text-purple-600 text-xs font-medium">ポイント</p>
            </div>
          </div>
        </div>

        {/* ご褒美進捗 */}
        {nextReward && (
          <div className="bg-gradient-to-r from-white to-neutral-50 p-8 rounded-3xl shadow-xl border border-neutral-200 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-grit-500/5 to-neutral-500/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaGift className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-grit-800">次のご褒美まで</h3>
                    <p className="text-grit-600 font-medium">{nextReward.rewardContent}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-700">{rewardProgress.toFixed(1)}%</p>
                  <p className="text-grit-600 text-sm">完了</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm font-semibold text-grit-700 mb-3">
                  <span>現在のスコア</span>
                  <span>{cumulativeTotalScore.toLocaleString()} / {nextReward.targetScore.toLocaleString()}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-grit-500 via-grit-400 to-grit-600 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${rewardProgress}%` }}
                  />
                </div>
              </div>
              
              {rewardProgress >= 100 && (
                <div className="text-center py-4 bg-gradient-to-r from-grit-50 to-neutral-50 rounded-2xl border border-grit-200">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <span className="text-xl font-bold text-grit-800">おめでとうございます！</span>
                  <p className="text-grit-600 mt-1">ご褒美をゲットしました！</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 耐久スコアの推移グラフ */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-grit-400 to-grit-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaChartLine className="text-white text-lg" />
            </div>
            <h3 className="text-2xl font-bold text-grit-800">耐久スコアの推移（過去7日間）</h3>
          </div>
          
          {trendData.every(d => d.score === 0) ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-grit-100 to-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-xl font-semibold text-grit-700 mb-3">まだデータがありません</p>
              <p className="text-grit-600">記録を蓄積してグラフを確認しましょう！</p>
            </div>
          ) : (
            <div className="relative">
              {/* グラフ */}
              <div className="mb-6 bg-gradient-to-br from-grit-50/50 to-neutral-50/50 p-6 rounded-2xl border border-grit-100/50">
                <svg viewBox="0 0 600 200" className="w-full h-48">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* グリッド線 */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="50"
                      y1={40 + i * 32}
                      x2="580"
                      y2={40 + i * 32}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  
                  {/* データライン */}
                  {(() => {
                    const maxScore = Math.max(...trendData.map(d => d.score), 1);
                    const points = trendData.map((d, i) => {
                      const x = 50 + (i * (530 / (trendData.length - 1)));
                      const y = 168 - ((d.score / maxScore) * 128);
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <>
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polygon
                          points={`${points} 580,168 50,168`}
                          fill="url(#scoreGradient)"
                        />
                        {/* データポイント */}
                        {trendData.map((d, i) => {
                          const x = 50 + (i * (530 / (trendData.length - 1)));
                          const y = 168 - ((d.score / maxScore) * 128);
                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#dc2626"
                                stroke="white"
                                strokeWidth="2"
                              />
                              {d.score > 0 && (
                                <text
                                  x={x}
                                  y={y - 12}
                                  textAnchor="middle"
                                  className="text-xs font-semibold fill-grit-700"
                                >
                                  {d.score}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* X軸ラベル */}
                  {trendData.map((d, i) => {
                    const x = 50 + (i * (530 / (trendData.length - 1)));
                    const date = new Date(d.date);
                    const label = `${date.getMonth() + 1}/${date.getDate()}`;
                    return (
                      <text
                        key={i}
                        x={x}
                        y={190}
                        textAnchor="middle"
                        className="text-xs font-medium fill-grit-600"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
              
              {/* 統計情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.max(...trendData.map(d => d.score))}
                  </div>
                  <div className="text-sm text-green-600 font-medium">最高スコア</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round(trendData.reduce((sum, d) => sum + d.score, 0) / trendData.length)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">平均スコア</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">
                    {trendData.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">総記録数</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 最近の記録 */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-grit-400 to-grit-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaClock className="text-white text-lg" />
            </div>
            <h3 className="text-2xl font-bold text-grit-800">最近の記録</h3>
          </div>
          
          {recentLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-grit-100 to-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-xl font-semibold text-grit-700 mb-3">まだ記録がありません</p>
              <p className="text-grit-600">「記録する」から最初の粘り記録を作成しましょう！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-gradient-to-r from-white to-neutral-50 border border-grit-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  {editingLog === log.id && editingData ? (
                    // 編集モード
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h4 className="font-bold text-grit-800 text-lg">記録を編集中...</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-grit-700 mb-2">タスク名</label>
                          <input
                            type="text"
                            value={editingData.taskName}
                            onChange={(e) => setEditingData({...editingData, taskName: e.target.value})}
                            className="w-full p-3 border border-grit-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-grit-700 mb-2">苦しさレベル (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editingData.difficultyScore}
                            onChange={(e) => setEditingData({...editingData, difficultyScore: parseInt(e.target.value)})}
                            className="w-full p-3 border border-grit-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-grit-700 mb-2">耐久時間 (分)</label>
                          <input
                            type="number"
                            min="1"
                            value={editingData.enduredTime}
                            onChange={(e) => setEditingData({...editingData, enduredTime: parseInt(e.target.value)})}
                            className="w-full p-3 border border-grit-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-grit-700 mb-2">詳細 (任意)</label>
                          <textarea
                            value={editingData.details}
                            onChange={(e) => setEditingData({...editingData, details: e.target.value})}
                            rows={3}
                            className="w-full p-3 border border-grit-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grit-500 resize-none"
                          />
                        </div>
                      </div>
                      
                      {/* アクションボタン - 詳細欄の下部に配置 */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center sm:justify-start mt-6">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm font-medium min-w-[80px]"
                        >
                          <FaCheck className="text-xs" />
                          <span>保存</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg text-sm font-medium min-w-[80px]"
                        >
                          <FaTimes className="text-xs" />
                          <span>キャンセル</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 表示モード
                    <div>
                      {/* デスクトップレイアウト */}
                      <div className="hidden sm:flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-2 h-2 bg-grit-500 rounded-full"></div>
                            <h4 className="font-bold text-grit-800 text-lg">{log.taskName}</h4>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-grit-600 mb-3">
                            <span className="flex items-center space-x-1">
                              <FaCalendar className="text-grit-500" />
                              <span className="font-medium">{log.date}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaClock className="text-neutral-500" />
                              <span className="font-medium">{log.enduredTime}分</span>
                            </span>
                            <span className="bg-grit-100 text-grit-700 px-3 py-1 rounded-full font-semibold">
                              苦しさ: {log.difficultyScore}/10
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-grit-700 italic bg-neutral-50 p-3 rounded-lg border-l-4 border-neutral-500">
                              "{log.details}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 ml-6">
                          {/* 編集・削除ボタン */}
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleStartEdit(log)}
                              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg transition-colors"
                              title="編集"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(log.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="削除"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                          {/* 耐久スコア */}
                          <div className="bg-gradient-to-br from-grit-500 to-grit-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold">{log.enduranceScore}</div>
                              <div className="text-xs opacity-90">pt</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* モバイルレイアウト */}
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-grit-500 rounded-full"></div>
                            <h4 className="font-bold text-grit-800 text-lg">{log.taskName}</h4>
                          </div>
                          <div className="bg-gradient-to-br from-grit-500 to-grit-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                            <div className="text-center">
                              <div className="text-sm font-bold">{log.enduranceScore}</div>
                              <div className="text-xs opacity-90">pt</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-grit-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <FaCalendar className="text-grit-500" />
                            <span className="font-medium">{log.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FaClock className="text-neutral-500" />
                            <span className="font-medium">{log.enduredTime}分</span>
                          </span>
                          <span className="bg-grit-100 text-grit-700 px-3 py-1 rounded-full font-semibold">
                            苦しさ: {log.difficultyScore}/10
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-grit-700 italic bg-neutral-50 p-3 rounded-lg border-l-4 border-neutral-500 mb-3">
                            "{log.details}"
                          </p>
                        )}
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => handleStartEdit(log)}
                            className="flex-1 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <FaEdit className="text-sm" />
                            <span className="text-sm">編集</span>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(log.id)}
                            className="flex-1 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <FaTrash className="text-sm" />
                            <span className="text-sm">削除</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTrash className="text-2xl text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-grit-800 mb-4">記録を削除しますか？</h3>
                <p className="text-grit-600 mb-8">この操作は取り消すことができません。</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-2xl hover:bg-neutral-300 transition-colors font-semibold"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-semibold"
                  >
                    削除する
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 励ましメッセージ */}
        <div className="bg-gradient-to-r from-grit-50 via-white to-neutral-50 p-8 rounded-3xl border border-grit-200 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-grit-500/3 to-neutral-500/3"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-grit-400 to-grit-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="text-2xl font-bold text-grit-800 mb-4">
              {cumulativeTotalScore === 0 ? 
                '最初の一歩を踏み出そう！' : 
                cumulativeTotalScore > 1000 ? 
                '素晴らしい粘り力です！継続は力なり！' :
                '着実に成長しています！この調子で頑張りましょう！'
              }
            </h3>
            <p className="text-grit-700 text-lg leading-relaxed max-w-2xl mx-auto">
              {cumulativeTotalScore === 0 ?
                '小さな困難でも記録することから始めましょう。あなたの成長が見える化されます。' :
                '毎日の小さな「粘り」が、大きな成果につながっています。自分を信じて続けていきましょう！'
              }
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-grit-500 to-grit-600 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;