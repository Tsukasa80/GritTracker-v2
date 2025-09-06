#!/bin/bash

echo "🔍 作業開始前のコンフリクト防止チェック"
echo "=========================================="

# カラーコード定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 現在のブランチ確認
echo -e "${BLUE}📍 現在のブランチ:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "   $CURRENT_BRANCH"

# 2. ローカルの変更状況確認
echo ""
echo -e "${BLUE}💾 ローカルの変更状況:${NC}"
if git diff --quiet && git diff --cached --quiet; then
    echo -e "   ${GREEN}✅ 変更なし（クリーン）${NC}"
else
    echo -e "   ${YELLOW}⚠️  未コミットの変更があります:${NC}"
    git status --short | sed 's/^/   /'
    echo ""
    echo -e "${YELLOW}   推奨: 先に作業をコミットまたはstashしてください${NC}"
fi

# 3. リモートから最新情報を取得
echo ""
echo -e "${BLUE}🌐 リモートから最新情報を取得中...${NC}"
git fetch origin

# 4. リモートとの差分確認
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null)

if [ -z "$REMOTE" ]; then
    echo -e "   ${YELLOW}⚠️  リモートブランチが存在しません${NC}"
    echo -e "   ${BLUE}ℹ️  新しいブランチの場合は正常です${NC}"
else
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo -e "   ${GREEN}✅ リモートと完全に同期済み${NC}"
    else
        AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..HEAD 2>/dev/null || echo "0")
        BEHIND=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
        
        if [ "$AHEAD" -gt 0 ]; then
            echo -e "   ${YELLOW}⬆️  ローカルが ${AHEAD} コミット進んでいます（未プッシュ）${NC}"
        fi
        
        if [ "$BEHIND" -gt 0 ]; then
            echo -e "   ${RED}⬇️  リモートが ${BEHIND} コミット進んでいます（要プル）${NC}"
            echo -e "   ${RED}🚨 コンフリクトリスク高！ git pull を実行してください${NC}"
            
            # 自動でプルするか確認
            echo ""
            read -p "自動でgit pullを実行しますか？ (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}🔄 git pull実行中...${NC}"
                git pull origin $CURRENT_BRANCH
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ プル完了${NC}"
                else
                    echo -e "${RED}❌ プル失敗 - 手動で解決してください${NC}"
                fi
            fi
        fi
    fi
fi

# 5. 最近の変更履歴表示
echo ""
echo -e "${BLUE}📝 最新のコミット履歴:${NC}"
git log --oneline -5 | sed 's/^/   /'

# 6. 最終チェック結果
echo ""
echo "=========================================="
BEHIND_FINAL=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
if [ "$BEHIND_FINAL" -eq 0 ]; then
    echo -e "${GREEN}✨ 安全！コンフリクトリスク低で作業開始可能${NC}"
else
    echo -e "${RED}⚠️  注意！リモートとの差分があります${NC}"
    echo -e "${YELLOW}   推奨: git pull でリモートの変更を取り込んでから作業してください${NC}"
fi