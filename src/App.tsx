import React, { useEffect, useState } from 'react';
import { useGritStore } from './store';
import { FaChartLine, FaPlus, FaClipboardList, FaGift, FaBars, FaExclamationTriangle } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import QuickRecord from './components/QuickRecord';
import WeeklyReview from './components/WeeklyReview';
import RewardSettings from './components/RewardSettings';

function App() {
  const { currentView, setCurrentView, clearLocalStorage, resetAllData } = useGritStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [, setError] = useState<string | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  
  useEffect(() => {
    // エラーハンドリング
    const handleError = (event: ErrorEvent) => {
      console.error('App Error:', event.error);
      setError(event.message);
      setShowErrorBanner(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const navigationItems = [
    { 
      key: 'dashboard', 
      label: 'ダッシュボード', 
      icon: FaChartLine,
      description: '成果を可視化'
    },
    { 
      key: 'record', 
      label: '記録する', 
      icon: FaPlus,
      description: '粘りを記録'
    },
    { 
      key: 'review', 
      label: '振り返り', 
      icon: FaClipboardList,
      description: '週次レビュー'
    },
    { 
      key: 'rewards', 
      label: 'ご褒美', 
      icon: FaGift,
      description: 'モチベーション'
    },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'record':
        return <QuickRecord />;
      case 'review':
        return <WeeklyReview />;
      case 'rewards':
        return <RewardSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 via-neutral-50 to-accent-light">
      {/* エラーバナー */}
      {showErrorBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-red-600 text-white p-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="text-xl flex-shrink-0" />
              <div>
                <div className="font-semibold">アプリでエラーが発生しました</div>
                <div className="text-sm opacity-90">
                  スマホで表示されない問題の可能性があります。データをリセットしてみてください。
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  resetAllData();
                  setError(null);
                  setShowErrorBanner(false);
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
              >
                データリセット
              </button>
              <button
                onClick={clearLocalStorage}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
              >
                完全リセット
              </button>
              <button
                onClick={() => setShowErrorBanner(false)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div 
                className="text-3xl cursor-pointer"
                onClick={(e) => {
                  // 5回クリックでデバッグモード
                  const clicks = (e.target as any).__clicks || 0;
                  (e.target as any).__clicks = clicks + 1;
                  if (clicks === 4) {
                    setShowErrorBanner(true);
                    (e.target as any).__clicks = 0;
                  }
                }}
              >
                🔥
              </div>
              <div>
                <h1 className="text-2xl font-bold text-grit-600">GritTracker</h1>
                <p className="text-xs text-gray-500">粘り力を可視化する</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentView(item.key as any)}
                    className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                      currentView === item.key
                        ? 'bg-gradient-to-r from-grit-500 to-grit-600 text-white shadow-lg transform scale-105'
                        : 'text-neutral-600 hover:text-grit-600 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <IconComponent className="mr-2" />
                    <div className="text-left">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex justify-between items-center py-4">
              {/* Mobile Logo */}
              <div className="flex items-center space-x-2">
                <div 
                  className="text-2xl cursor-pointer"
                  onClick={(e) => {
                    // 5回クリックでデバッグモード
                    const clicks = (e.target as any).__clicks || 0;
                    (e.target as any).__clicks = clicks + 1;
                    if (clicks === 4) {
                      setShowErrorBanner(true);
                      (e.target as any).__clicks = 0;
                    }
                  }}
                >
                  🔥
                </div>
                <div>
                  <h1 className="text-xl font-bold text-grit-600">GritTracker</h1>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FaBars className="text-xl" />
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setCurrentView(item.key as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex flex-col items-center p-4 rounded-xl font-medium transition-all ${
                          currentView === item.key
                            ? 'bg-gradient-to-b from-grit-500 to-grit-600 text-white shadow-lg'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <IconComponent className="text-xl mb-2" />
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <div className="text-xl">🔥</div>
              <span className="font-bold text-grit-600">GritTracker</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              苦しさを成長の証に変える。あなたの粘り力を可視化し、セルフイメージを向上させましょう。
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>💪 粘り力向上</span>
              <span>📈 成長可視化</span>
              <span>🎯 目標達成</span>
              <span>🎉 自己肯定感UP</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCurrentView('record')}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 transform ${
            currentView === 'record' 
              ? 'bg-neutral-400 scale-95' 
              : 'bg-gradient-to-r from-grit-500 to-grit-600 hover:scale-110'
          } text-white`}
        >
          <FaPlus className="text-xl" />
        </button>
      </div>
    </div>
  );
}

export default App;