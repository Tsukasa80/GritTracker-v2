import React, { useState } from 'react';
import { useGritStore } from '../store';
import { FaPlus, FaGift, FaTrophy, FaTrash, FaEdit, FaCheck, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const RewardSettings: React.FC = () => {
  const { 
    rewardSettings, 
    addRewardSetting, 
    updateRewardSetting, 
    deleteRewardSetting, 
    getCumulativeTotalScore 
  } = useGritStore();

  const [newReward, setNewReward] = useState({
    targetScore: '',
    rewardContent: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    targetScore: '',
    rewardContent: '',
  });

  const cumulativeScore = getCumulativeTotalScore();

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetScore = parseInt(newReward.targetScore);
    if (!targetScore || targetScore <= 0 || !newReward.rewardContent.trim()) {
      alert('目標スコアと ご褒美内容を正しく入力してください！');
      return;
    }

    // 既存の目標より大きいスコアかチェック
    const existingScores = rewardSettings.map(r => r.targetScore);
    if (existingScores.includes(targetScore)) {
      alert('同じ目標スコアのご褒美が既に存在します！');
      return;
    }

    addRewardSetting({
      targetScore,
      rewardContent: newReward.rewardContent.trim(),
    });

    setNewReward({ targetScore: '', rewardContent: '' });
    alert('ご褒美を追加しました！🎉 目標に向かって頑張りましょう！');
  };

  const handleStartEdit = (reward: typeof rewardSettings[0]) => {
    setEditingId(reward.id);
    setEditForm({
      targetScore: reward.targetScore.toString(),
      rewardContent: reward.rewardContent,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    const targetScore = parseInt(editForm.targetScore);
    if (!targetScore || targetScore <= 0 || !editForm.rewardContent.trim()) {
      alert('目標スコアとご褒美内容を正しく入力してください！');
      return;
    }

    updateRewardSetting(editingId, {
      targetScore,
      rewardContent: editForm.rewardContent.trim(),
    });

    setEditingId(null);
    setEditForm({ targetScore: '', rewardContent: '' });
    alert('ご褒美を更新しました！✨');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ targetScore: '', rewardContent: '' });
  };

  const handleDelete = (id: string, rewardContent: string) => {
    if (window.confirm(`「${rewardContent}」を削除しますか？`)) {
      deleteRewardSetting(id);
      alert('ご褒美を削除しました。');
    }
  };

  const handleToggleCompleted = (reward: typeof rewardSettings[0]) => {
    if (reward.isCompleted) {
      // 完了済みを未完了に戻す
      if (window.confirm(`「${reward.rewardContent}」を未済に戻しますか？`)) {
        updateRewardSetting(reward.id, { isCompleted: false, completedAt: undefined });
        alert('ステータスを未済に変更しました。');
      }
    } else {
      // 未完了を完了にする
      if (window.confirm(`「${reward.rewardContent}」を済にしますか？`)) {
        updateRewardSetting(reward.id, { isCompleted: true, completedAt: new Date() });
        alert('おめでとうございます！ステータスを済に変更しました。🎉');
      }
    }
  };

  // 完了済みと未完了でソート
  const sortedRewards = [...rewardSettings].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return a.targetScore - b.targetScore;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 to-neutral-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* ヘッダー - スターバックス風 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-full mb-4 shadow-lg">
            <FaGift className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-wide text-grit-800">
            ご褒美設定
          </h1>
          <p className="text-grit-600 text-lg font-medium mb-4">
            「苦しさ」を「価値ある通貨」として、自分にご褒美を設定しましょう
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-grit-500 to-grit-600 mx-auto mt-4 rounded-full"></div>
          
          {/* 現在のスコア表示 - スターバックス風 */}
          <div className="mt-8 bg-gradient-to-r from-white to-neutral-50 p-8 rounded-3xl shadow-xl border border-grit-200 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <FaTrophy className="text-2xl text-neutral-600" />
              <span className="text-lg font-semibold text-grit-800">現在のスコア</span>
            </div>
            <div className="text-4xl font-extrabold text-grit-600">
              {cumulativeScore.toLocaleString()}<span className="text-xl text-grit-500">pt</span>
            </div>
          </div>
        </div>

        {/* 新しいご褒美追加 - スターバックス風 */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
          <h2 className="text-2xl font-bold text-grit-800 mb-6 flex items-center">
            <FaPlus className="mr-3 text-neutral-600" />
            新しいご褒美を追加
          </h2>
          
          <form onSubmit={handleAddReward} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-grit-800 mb-2">
                  目標スコア <span className="text-neutral-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newReward.targetScore}
                  onChange={(e) => setNewReward({ ...newReward, targetScore: e.target.value })}
                  placeholder="例：500"
                  className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-grit-800 mb-2">
                  ご褒美内容 <span className="text-neutral-500">*</span>
                </label>
                <input
                  type="text"
                  value={newReward.rewardContent}
                  onChange={(e) => setNewReward({ ...newReward, rewardContent: e.target.value })}
                  placeholder="例：お気に入りのスイーツを食べる"
                  className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-grit-500 to-grit-600 text-white font-bold py-4 px-8 rounded-xl hover:from-grit-600 hover:to-grit-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <FaPlus className="text-xl" />
              <span>ご褒美を追加</span>
            </button>
          </form>
        </div>

        {/* ご褒美一覧 - スターバックス風 */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100">
          <h2 className="text-2xl font-bold text-grit-800 mb-8 flex items-center">
            <FaGift className="mr-3 text-neutral-600" />
            設定済みのご褒美
          </h2>

          {sortedRewards.length === 0 ? (
            <div className="text-center py-12 text-grit-600">
              <div className="w-16 h-16 bg-gradient-to-br from-grit-100 to-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGift className="text-3xl text-grit-400" />
              </div>
              <p className="text-lg font-semibold mb-2">まだご褒美が設定されていません</p>
              <p className="text-sm">上のフォームから最初のご褒美を設定してみましょう！</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`border-2 rounded-2xl p-8 transition-all shadow-lg hover:shadow-xl ${
                    reward.isCompleted
                      ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100'
                      : cumulativeScore >= reward.targetScore
                      ? 'border-grit-300 bg-gradient-to-r from-grit-50 to-neutral-50 animate-pulse shadow-xl'
                      : 'border-grit-200 bg-white/80 hover:border-grit-300 hover:bg-gradient-to-r hover:from-white hover:to-grit-50'
                  }`}
                >
                  {editingId === reward.id ? (
                    /* 編集モード */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-grit-800 mb-2">
                            目標スコア
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.targetScore}
                            onChange={(e) => setEditForm({ ...editForm, targetScore: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-grit-800 mb-2">
                            ご褒美内容
                          </label>
                          <input
                            type="text"
                            value={editForm.rewardContent}
                            onChange={(e) => setEditForm({ ...editForm, rewardContent: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center space-x-2"
                        >
                          <FaCheck />
                          <span>保存</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors shadow-lg flex items-center space-x-2"
                        >
                          <FaTimes />
                          <span>キャンセル</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 表示モード */
                    <div className="w-full">
                      <div className="flex items-center space-x-3 mb-3">
                      {reward.isCompleted ? (
                        <div className="text-3xl">🎉</div>
                      ) : cumulativeScore >= reward.targetScore ? (
                        <div className="text-3xl animate-bounce">✨</div>
                      ) : (
                        <div className="text-3xl">🎁</div>
                      )}
                      
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 ${
                            reward.isCompleted ? 'text-green-700' : 'text-grit-800'
                          }`}>
                            {reward.rewardContent}
                          </h3>
                          <p className="text-sm text-grit-600 font-medium">
                            目標: {reward.targetScore.toLocaleString()}pt
                          </p>
                        </div>

                      </div>

                      {/* 進捗バー - スターバックス風 */}
                      <div className="mb-4 bg-grit-50/50 p-4 rounded-xl border border-grit-100">
                        <div className="flex justify-between text-sm text-grit-700 font-semibold mb-2">
                          <span>進捗状況</span>
                          <span>
                            {Math.min(cumulativeScore, reward.targetScore).toLocaleString()} / {reward.targetScore.toLocaleString()}pt
                          </span>
                        </div>
                        <div className="w-full bg-grit-200 rounded-full h-4 shadow-inner">
                          <div
                            className={`h-4 rounded-full transition-all duration-700 shadow-sm ${
                              reward.isCompleted
                                ? 'bg-gradient-to-r from-green-400 to-green-600'
                                : cumulativeScore >= reward.targetScore
                                ? 'bg-gradient-to-r from-grit-400 to-grit-600 animate-pulse'
                                : 'bg-gradient-to-r from-grit-500 to-grit-600'
                            }`}
                            style={{
                              width: `${Math.min((cumulativeScore / reward.targetScore) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <div className="text-right text-sm text-grit-600 font-medium mt-2">
                          {((cumulativeScore / reward.targetScore) * 100).toFixed(1)}%達成
                        </div>
                      </div>

                      {/* ステータス - スターバックス風 */}
                      {reward.isCompleted ? (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-green-700 font-bold text-lg flex items-center space-x-2">
                                <FaTrophy className="text-xl" />
                                <span>達成済み！</span>
                              </div>
                              {reward.completedAt && (
                                <p className="text-sm text-green-600 mt-1">
                                  達成日: {reward.completedAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleCompleted(reward)}
                              className="flex items-center space-x-2 bg-green-200 hover:bg-green-300 text-green-700 px-3 py-2 rounded-lg transition-colors text-sm"
                              title="未済に戻す"
                            >
                              <FaToggleOff className="text-sm" />
                              <span>未済に戻す</span>
                            </button>
                          </div>
                        </div>
                      ) : cumulativeScore >= reward.targetScore ? (
                        <div className="bg-gradient-to-r from-grit-50 to-neutral-50 p-4 rounded-xl border border-grit-200 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="text-grit-700 font-bold text-lg flex items-center space-x-2">
                              <span className="text-2xl">🎉</span>
                              <span>おめでとうございます！ご褒美をゲットしました！</span>
                            </div>
                            <button
                              onClick={() => handleToggleCompleted(reward)}
                              className="flex items-center space-x-2 bg-grit-500 hover:bg-grit-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                              title="済にする"
                            >
                              <FaToggleOn className="text-sm" />
                              <span>済</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-grit-50 p-4 rounded-xl border border-grit-200">
                          <div className="text-grit-700 font-semibold">
                            あと {(reward.targetScore - cumulativeScore).toLocaleString()}pt で達成！
                          </div>
                        </div>
                      )}

                      {/* アクションボタン - スマホ対応 */}
                      {!reward.isCompleted && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 justify-center sm:justify-start">
                          <button
                            onClick={() => handleStartEdit(reward)}
                            className="flex items-center justify-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-4 py-2 rounded-lg transition-colors min-w-[80px] sm:min-w-[60px]"
                            title="編集"
                          >
                            <FaEdit className="text-sm" />
                            <span className="text-sm sm:hidden">編集</span>
                          </button>
                          <button
                            onClick={() => handleDelete(reward.id, reward.rewardContent)}
                            className="flex items-center justify-center space-x-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors min-w-[80px] sm:min-w-[60px]"
                            title="削除"
                          >
                            <FaTrash className="text-sm" />
                            <span className="text-sm sm:hidden">削除</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ヒント - スターバックス風 */}
        <div className="bg-gradient-to-r from-grit-50 via-white to-neutral-50 p-8 rounded-3xl border border-grit-200 shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-grit-400 to-grit-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="text-2xl font-bold text-grit-800 mb-6 text-center">
            ご褒美設定のコツ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-grit-700">
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="font-bold text-grit-800 mb-2 flex items-center space-x-2">
                <span className="text-neutral-600">🎯</span>
                <span>現実的な目標</span>
              </div>
              <p className="text-sm">現在のスコアから見て達成可能な目標を設定しましょう</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="font-bold text-grit-800 mb-2 flex items-center space-x-2">
                <span className="text-neutral-600">📈</span>
                <span>段階的な設定</span>
              </div>
              <p className="text-sm">小さなご褒美から大きなご褒美まで、複数設定すると継続しやすくなります</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="font-bold text-grit-800 mb-2 flex items-center space-x-2">
                <span className="text-neutral-600">✨</span>
                <span>具体的な内容</span>
              </div>
              <p className="text-sm">「好きなものを買う」より「〇〇を食べる」「〇〇を買う」など具体的に</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm">
              <div className="font-bold text-grit-800 mb-2 flex items-center space-x-2">
                <span className="text-neutral-600">💪</span>
                <span>自分への投資</span>
              </div>
              <p className="text-sm">単なる消費だけでなく、スキルアップや健康に関するご褒美も効果的です</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardSettings;