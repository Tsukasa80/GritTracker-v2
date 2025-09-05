import React, { useState } from 'react';
import { useGritStore } from '../store';
import { getTodayDate, calculateEnduranceScore } from '../utils';
import { FaSave, FaChartBar, FaClock, FaStar, FaPlus, FaTimes } from 'react-icons/fa';

const QuickRecord: React.FC = () => {
  const { addGritLog } = useGritStore();
  
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    taskName: '',
    difficultyScore: 5,
    enduredTime: 0,
    details: '',
    wasSuccessful: undefined as boolean | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName.trim() || formData.enduredTime <= 0) {
      alert('タスク名と粘った時間を入力してください！');
      return;
    }

    addGritLog(formData);
    
    // フォームをリセット
    setFormData({
      date: getTodayDate(),
      taskName: '',
      difficultyScore: 5,
      enduredTime: 0,
      details: '',
      wasSuccessful: undefined,
    });
    
    alert('記録を保存しました！🎉 お疲れさまでした！');
  };

  const handleReset = () => {
    setFormData({
      date: getTodayDate(),
      taskName: '',
      difficultyScore: 5,
      enduredTime: 0,
      details: '',
      wasSuccessful: undefined,
    });
  };

  const enduranceScore = calculateEnduranceScore(formData.difficultyScore, formData.enduredTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 to-endurance-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー - スターバックス風 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-grit-500 to-grit-600 rounded-full mb-4 shadow-lg">
            <FaPlus className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-wide text-grit-800">
            粘り記録を作成
          </h1>
          <p className="text-grit-600 text-lg font-medium">苦しさを成長の証に変えましょう</p>
          <div className="w-24 h-1 bg-gradient-to-r from-grit-500 to-endurance-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* フォーム - スターバックス風 */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-grit-100 space-y-6">
          
          {/* 日付とタスク名 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-grit-800 mb-2">
                日付
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-grit-800 mb-2">
                何に粘りましたか？ <span className="text-grit-500">*</span>
              </label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                placeholder="例：数学の勉強、筋トレ、英語学習など"
                className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400"
                required
              />
            </div>
          </div>

          {/* 苦しさスコア */}
          <div>
            <label className="block text-sm font-bold text-grit-800 mb-2 flex items-center">
              <FaChartBar className="text-grit-500 mr-2" />
              苦しさレベル: <span className="text-grit-600 font-bold ml-2">{formData.difficultyScore}/10</span>
            </label>
            <div className="px-3">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.difficultyScore}
                onChange={(e) => setFormData({ ...formData, difficultyScore: parseInt(e.target.value) })}
                className="w-full h-3 bg-gradient-to-r from-grit-200 via-grit-400 to-grit-600 rounded-lg cursor-pointer slider"
                style={{
                  WebkitAppearance: 'none', 
                  appearance: 'none',
                  background: 'linear-gradient(to right, #bbf7d0, #4ade80, #16a34a)'
                }}
              />
              <div className="flex justify-between text-xs text-grit-600 font-medium mt-1">
                <span>1 (楽勝)</span>
                <span>5 (普通)</span>
                <span>10 (激しい)</span>
              </div>
            </div>
          </div>

          {/* 粘った時間 */}
          <div>
            <label className="block text-sm font-bold text-grit-800 mb-2 flex items-center">
              <FaClock className="text-neutral-500 mr-2" />
              頑張った時間（分） <span className="text-grit-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={formData.enduredTime || ''}
              onChange={(e) => setFormData({ ...formData, enduredTime: parseInt(e.target.value) || 0 })}
              placeholder="分数を入力"
              className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800"
              required
            />
          </div>

          {/* 耐久スコア表示 */}
          {formData.enduredTime > 0 && (
            <div className="bg-gradient-to-r from-grit-50 to-neutral-50 p-6 rounded-2xl border border-grit-200 text-center">
              <FaChartBar className="inline text-2xl text-grit-600 mb-2" />
              <h3 className="text-xl font-bold text-grit-800 mb-2">予想獲得ポイント</h3>
              <div className="text-4xl font-extrabold text-grit-600 mb-2">
                {enduranceScore}
              </div>
              <p className="text-sm text-grit-600">
                苦しさ {formData.difficultyScore} × 時間 {formData.enduredTime}分 = {enduranceScore}ポイント
              </p>
            </div>
          )}

          {/* 完了状況 */}
          <div>
            <label className="block text-sm font-bold text-grit-800 mb-3 flex items-center">
              <FaStar className="text-endurance-500 mr-2" />
              結果はどうでしたか？
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="wasSuccessful"
                  checked={formData.wasSuccessful === true}
                  onChange={() => setFormData({ ...formData, wasSuccessful: true })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-green-700 font-semibold">✅ 完了・成功</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="wasSuccessful"
                  checked={formData.wasSuccessful === false}
                  onChange={() => setFormData({ ...formData, wasSuccessful: false })}
                  className="w-4 h-4 text-endurance-600 focus:ring-endurance-500"
                />
                <span className="text-endurance-700 font-semibold">💪 途中・挑戦中</span>
              </label>
            </div>
          </div>

          {/* 詳細メモ */}
          <div>
            <label className="block text-sm font-bold text-grit-800 mb-2">
              感想や詳細（任意）
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="どんなことが大変でしたか？どう乗り越えましたか？"
              rows={4}
              className="w-full px-4 py-3 border-2 border-grit-200 rounded-xl focus:border-grit-500 focus:outline-none transition-colors text-grit-800 placeholder-neutral-400 resize-none"
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-grit-500 to-grit-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-grit-600 hover:to-grit-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <FaSave className="text-xl" />
              <span>記録を保存</span>
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <FaTimes className="text-lg" />
              <span>リセット</span>
            </button>
          </div>
        </form>

        {/* 励ましメッセージ - スターバックス風 */}
        <div className="mt-8 bg-gradient-to-r from-grit-50 via-white to-endurance-50 p-6 rounded-3xl border border-grit-200 text-center shadow-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-grit-400 to-endurance-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-xl">🌟</span>
          </div>
          <h3 className="text-lg font-bold text-grit-800 mb-2">
            小さな粘りも大きな成長の種！
          </h3>
          <p className="text-grit-700">
            どんなに小さな努力でも記録することで、あなたの成長が見える化されます。
            継続こそが最大の力です！
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickRecord;