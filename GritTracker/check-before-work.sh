#!/bin/bash

echo "🔍 作業開始前のシステムチェック"
echo "=================================="

# 1. 現在のブランチ確認
echo "📍 現在のブランチ:"
git branch --show-current

# 2. ローカルの変更状況確認
echo ""
echo "💾 ローカルの変更状況:"
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ 変更なし（クリーン）"
else
    echo "⚠️  未コミットの変更があります:"
    git status --short
fi

# 3. リモートとの差分確認
echo ""
echo "🌐 リモートとの同期状況:"
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ リモートと同期済み"
else
    AHEAD=$(git rev-list --count origin/main..HEAD)
    BEHIND=$(git rev-list --count HEAD..origin/main)
    
    if [ "$AHEAD" -gt 0 ]; then
        echo "⬆️  ローカルが ${AHEAD} コミット進んでいます（未プッシュ）"
    fi
    
    if [ "$BEHIND" -gt 0 ]; then
        echo "⬇️  リモートが ${BEHIND} コミット進んでいます（要プル）"
        echo "🔧 git pull origin main を実行してください"
    fi
fi

# 4. 最新コミット表示
echo ""
echo "📝 最新のコミット履歴:"
git log --oneline -3

echo ""
echo "=================================="
echo "✨ チェック完了！安全に作業を開始できます"