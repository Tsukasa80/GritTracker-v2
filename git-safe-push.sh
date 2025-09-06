#!/bin/bash

# GritTracker - 安全なプッシュスクリプト
# コンフリクトを防ぐための自動プル＆プッシュ

echo "🚀 GritTracker Safe Push"
echo "======================"

# カラーコード定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 現在のブランチを取得
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch: ${CURRENT_BRANCH}${NC}"

# 未コミットの変更をチェック
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${RED}❌ Uncommitted changes detected${NC}"
    echo -e "${YELLOW}   Please commit or stash your changes first${NC}"
    git status --short | sed 's/^/   /'
    exit 1
fi

# リモートから最新情報を取得
echo -e "${BLUE}🌐 Fetching from remote...${NC}"
git fetch origin --quiet

# リモートブランチの確認
REMOTE_BRANCH="origin/$CURRENT_BRANCH"
if ! git show-ref --quiet --verify "refs/remotes/$REMOTE_BRANCH"; then
    echo -e "${YELLOW}⚠️  Remote branch doesn't exist${NC}"
    echo -e "${BLUE}🔄 Creating new remote branch...${NC}"
    git push -u origin $CURRENT_BRANCH
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed new branch${NC}"
    else
        echo -e "${RED}❌ Failed to push new branch${NC}"
        exit 1
    fi
    exit 0
fi

# リモートの変更をチェック
BEHIND=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH)

if [ "$BEHIND" -gt 0 ]; then
    echo -e "${YELLOW}⬇️  Remote is ${BEHIND} commits ahead${NC}"
    echo -e "${BLUE}🔄 Pulling remote changes...${NC}"
    
    # 変更されたファイルを事前に表示
    echo -e "${BLUE}📄 Files changed remotely:${NC}"
    git diff --name-only HEAD..origin/$CURRENT_BRANCH | sed 's/^/   /'
    
    # プルを実行
    git pull origin $CURRENT_BRANCH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pulled changes${NC}"
    else
        echo -e "${RED}❌ Merge conflicts detected${NC}"
        echo -e "${YELLOW}📝 Please resolve conflicts and try again${NC}"
        echo -e "${BLUE}💡 Steps to resolve:${NC}"
        echo -e "   1️⃣  Resolve conflicts in your editor"
        echo -e "   2️⃣  git add <resolved-files>"
        echo -e "   3️⃣  git commit"
        echo -e "   4️⃣  Run this script again"
        exit 1
    fi
fi

# プッシュを実行
echo -e "${BLUE}🚀 Pushing to remote...${NC}"
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed!${NC}"
    echo -e "${GREEN}🎉 All done - no conflicts!${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
fi