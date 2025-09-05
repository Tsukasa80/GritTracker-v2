#!/bin/bash
# GritTracker パス設定自動修正スクリプト
# 使用方法: ./fix-paths.sh

echo "🔧 GritTracker パス設定を修正しています..."

# 現在のディレクトリ確認
if [ ! -d "GritTracker" ]; then
    echo "❌ エラー: GritTrackerフォルダが見つかりません"
    echo "   cc-testディレクトリで実行してください"
    exit 1
fi

# 1. 最新ビルド実行
echo "📦 ビルドを実行中..."
cd GritTracker
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ビルドが失敗しました"
    exit 1
fi

cd ..

# 2. 既存のファイルをバックアップ（存在する場合）
if [ -f "index.html" ]; then
    echo "💾 既存ファイルをバックアップ中..."
    mv index.html index.html.backup
fi

if [ -f "404.html" ]; then
    mv 404.html 404.html.backup  
fi

if [ -d "assets" ]; then
    mv assets assets.backup
fi

# 3. distファイルをルートにコピー
echo "📂 ファイルをコピー中..."
cp -r GritTracker/dist/* .
cp index.html 404.html

# 4. パスを相対パスに修正
echo "🔄 パスを相対パスに修正中..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS用
    sed -i '' 's|/grit-tracker/assets/|./assets/|g' index.html
    sed -i '' 's|/grit-tracker/assets/|./assets/|g' 404.html
else
    # Linux/Windows用
    sed -i 's|/grit-tracker/assets/|./assets/|g' index.html
    sed -i 's|/grit-tracker/assets/|./assets/|g' 404.html
fi

# 5. 結果確認
echo "✅ パス修正完了！以下を確認:"
echo ""
echo "📄 index.html のパス:"
grep -n "assets/" index.html | head -3

echo ""
echo "📄 404.html のパス:"  
grep -n "assets/" 404.html | head -3

echo ""
echo "📁 assets フォルダ内容:"
ls -la assets/ | head -5

# 6. Git状態表示
echo ""  
echo "📊 Git状態:"
git status --porcelain | head -10

echo ""
echo "🚀 デプロイ準備完了!"
echo ""
echo "次のステップ:"
echo "  git add ."
echo "  git commit -m \"Fix paths for GitHub Pages deployment\""  
echo "  git push origin main"
echo ""
echo "その後、2-3分待ってからアクセス:"
echo "  https://tsukasa80.github.io/grit-tracker/"