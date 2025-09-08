import React from 'react';
import { useGritStore } from './store';
import { FaChartLine, FaPlus, FaGift, FaBars, FaHistory, FaEdit } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import QuickRecord from './components/QuickRecord';
import WeeklyReview from './components/WeeklyReview';
import WeeklyReviewHistory from './components/WeeklyReviewHistory';
import RewardSettings from './components/RewardSettings';

function App() {
  const { currentView, setCurrentView } = useGritStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
      icon: FaEdit,
      description: '週次レビュー'
    },
    { 
      key: 'review-history', 
      label: '履歴', 
      icon: FaHistory,
      description: '過去の振返り'
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
      case 'review-history':
        return <WeeklyReviewHistory />;
      case 'rewards':
        return <RewardSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grit-50 via-neutral-50 to-accent-light">
      {/* Navigation Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🔥</div>
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
                <div className="text-2xl">🔥</div>
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