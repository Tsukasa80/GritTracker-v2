#!/bin/bash

# GritTracker - 高度なコンフリクト検出システム
# ファイル単位での変更重複検出

echo "🔍 Advanced Conflict Detection"
echo "============================="

# カラーコード定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch: ${CURRENT_BRANCH}${NC}"

# リモート情報を取得
echo -e "${BLUE}🌐 Fetching remote information...${NC}"
git fetch origin --quiet

# リモートブランチの存在確認
REMOTE_BRANCH="origin/$CURRENT_BRANCH"
if ! git show-ref --quiet --verify "refs/remotes/$REMOTE_BRANCH"; then
    echo -e "${GREEN}✅ New branch - no conflict risk${NC}"
    exit 0
fi

# ローカルとリモートの差分分析
LOCAL_CHANGES=$(git diff --name-only HEAD origin/$CURRENT_BRANCH)
REMOTE_CHANGES=$(git diff --name-only origin/$CURRENT_BRANCH HEAD)

if [ -z "$LOCAL_CHANGES" ] && [ -z "$REMOTE_CHANGES" ]; then
    echo -e "${GREEN}✅ No changes detected${NC}"
    exit 0
fi

# コンフリクトリスクの分析
echo -e "${PURPLE}📊 Change Analysis:${NC}"
echo ""

# ローカルの変更
if [ -n "$REMOTE_CHANGES" ]; then
    echo -e "${BLUE}📝 Local changes (your work):${NC}"
    echo "$REMOTE_CHANGES" | while read file; do
        if [ -n "$file" ]; then
            # ファイルサイズと変更行数を取得
            LINES_ADDED=$(git diff --numstat HEAD origin/$CURRENT_BRANCH -- "$file" | cut -f1)
            LINES_REMOVED=$(git diff --numstat HEAD origin/$CURRENT_BRANCH -- "$file" | cut -f2)
            echo -e "   📄 ${file} (+${LINES_ADDED:-0} -${LINES_REMOVED:-0} lines)"
        fi
    done
    echo ""
fi

# リモートの変更
if [ -n "$LOCAL_CHANGES" ]; then
    echo -e "${YELLOW}🌐 Remote changes (others' work):${NC}"
    echo "$LOCAL_CHANGES" | while read file; do
        if [ -n "$file" ]; then
            # ファイルサイズと変更行数を取得
            LINES_ADDED=$(git diff --numstat origin/$CURRENT_BRANCH HEAD -- "$file" | cut -f1)
            LINES_REMOVED=$(git diff --numstat origin/$CURRENT_BRANCH HEAD -- "$file" | cut -f2)
            echo -e "   📄 ${file} (+${LINES_ADDED:-0} -${LINES_REMOVED:-0} lines)"
        fi
    done
    echo ""
fi

# 重複編集ファイルの検出
CONFLICT_FILES=""
if [ -n "$LOCAL_CHANGES" ] && [ -n "$REMOTE_CHANGES" ]; then
    echo -e "${RED}⚠️  Analyzing potential conflicts...${NC}"
    
    for local_file in $REMOTE_CHANGES; do
        for remote_file in $LOCAL_CHANGES; do
            if [ "$local_file" = "$remote_file" ]; then
                CONFLICT_FILES="$CONFLICT_FILES $local_file"
                
                # 詳細な行レベル分析
                echo -e "${RED}🚨 HIGH RISK: ${local_file}${NC}"
                echo -e "   Both local and remote have changes to this file"
                
                # 変更された行の重複チェック（簡易版）
                LOCAL_LINES=$(git diff origin/$CURRENT_BRANCH HEAD -- "$local_file" | grep "^+" | wc -l)
                REMOTE_LINES=$(git diff HEAD origin/$CURRENT_BRANCH -- "$local_file" | grep "^+" | wc -l)
                
                echo -e "   Local: +${LOCAL_LINES} lines, Remote: +${REMOTE_LINES} lines"
            fi
        done
    done
fi

echo ""
echo "=============================="

# 最終リスク評価
if [ -n "$CONFLICT_FILES" ]; then
    echo -e "${RED}🚨 HIGH CONFLICT RISK DETECTED!${NC}"
    echo -e "${YELLOW}📋 Files with potential conflicts:${NC}"
    for file in $CONFLICT_FILES; do
        echo -e "   ⚡ ${file}"
    done
    echo ""
    echo -e "${BLUE}💡 Recommended strategy:${NC}"
    echo -e "   1️⃣  Backup your current work: ${YELLOW}git stash push -m \"backup\"${NC}"
    echo -e "   2️⃣  Pull remote changes: ${YELLOW}git pull origin $CURRENT_BRANCH${NC}"
    echo -e "   3️⃣  Apply your changes: ${YELLOW}git stash pop${NC}"
    echo -e "   4️⃣  Manually resolve conflicts in: $CONFLICT_FILES"
    echo -e "   5️⃣  Test thoroughly before committing"
elif [ -n "$LOCAL_CHANGES" ]; then
    echo -e "${YELLOW}⚠️  MEDIUM RISK: Remote changes detected${NC}"
    echo -e "${BLUE}💡 Safe to pull - different files modified${NC}"
    echo -e "   Run: ${YELLOW}git pull origin $CURRENT_BRANCH${NC}"
elif [ -n "$REMOTE_CHANGES" ]; then
    echo -e "${GREEN}✅ LOW RISK: Only local changes${NC}"
    echo -e "${BLUE}💡 Safe to push${NC}"
else
    echo -e "${GREEN}✅ NO RISK: No changes detected${NC}"
fi